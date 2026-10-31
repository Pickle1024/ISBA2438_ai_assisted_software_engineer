"""Command-line tool for a small store's product inventory.

Each invocation performs one operation on a JSON data file
(default: products.json in the current directory) and then exits.
"""

import argparse
import json
import re
import sys
from decimal import Decimal, InvalidOperation
from pathlib import Path

DEFAULT_FILE = "products.json"
PRICE_INPUT_PATTERN = re.compile(r"^\d+(\.\d{1,2})?$")
PRICE_STORED_PATTERN = re.compile(r"^\d+\.\d{2}$")
INTEGER_PATTERN = re.compile(r"^\d+$")


class ToolError(Exception):
    """A problem reported as one clean line plus an exit code (1 or 2)."""

    def __init__(self, message, code):
        super().__init__(message)
        self.message = message
        self.code = code


def fail(message, code):
    raise ToolError(message, code)


def load_store(path):
    """Read the data file. A missing file is an empty store."""
    if not path.exists():
        return {"next_id": 1, "products": []}
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        fail(f"Error: cannot read data file {path}: {exc}", 1)
    if not text.strip():
        fail(f"Error: data file {path} is empty", 1)
    try:
        store = json.loads(text)
    except ValueError:
        fail(f"Error: data file {path} is not valid JSON", 1)
    validate_store(store, path)
    return store


def validate_store(store, path):
    """Reject stored data that does not match the required schema."""
    def invalid():
        fail(f"Error: data file {path} does not match the required schema", 1)

    if not isinstance(store, dict) or set(store) != {"next_id", "products"}:
        invalid()
    next_id, products = store["next_id"], store["products"]
    if isinstance(next_id, bool) or not isinstance(next_id, int) or next_id <= 0:
        invalid()
    if not isinstance(products, list):
        invalid()
    seen_ids = set()
    for product in products:
        if not isinstance(product, dict) or set(product) != {"id", "name", "price", "quantity"}:
            invalid()
        pid = product["id"]
        if isinstance(pid, bool) or not isinstance(pid, int) or pid <= 0:
            invalid()
        if not isinstance(product["name"], str) or not product["name"].strip():
            invalid()
        if not isinstance(product["price"], str) or not PRICE_STORED_PATTERN.match(product["price"]):
            invalid()
        quantity = product["quantity"]
        if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 0:
            invalid()
        if pid in seen_ids:
            invalid()
        seen_ids.add(pid)
    if products and next_id <= max(seen_ids):
        invalid()


def save_store(path, store):
    try:
        path.write_text(
            json.dumps(store, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
    except OSError as exc:
        fail(f"Error: cannot write data file {path}: {exc}", 1)


def validate_name(raw):
    name = raw.strip()
    if not name:
        fail("Error: name must contain at least one non-whitespace character", 2)
    return name


def validate_price(raw):
    if not PRICE_INPUT_PATTERN.match(raw):
        fail(
            f"Error: price {raw!r} is invalid. Use a nonnegative amount like 4 or 4.5 or 4.50, "
            "without a sign, currency symbol, or more than two decimal places.",
            2,
        )
    try:
        return str(Decimal(raw).quantize(Decimal("0.01")))
    except InvalidOperation:
        fail(f"Error: price {raw!r} is out of range", 2)


def validate_quantity(raw):
    if not INTEGER_PATTERN.match(raw):
        fail(f"Error: quantity {raw!r} is invalid. Use a nonnegative whole number like 0 or 10.", 2)
    return int(raw)


def validate_id(raw):
    if not INTEGER_PATTERN.match(raw) or int(raw) <= 0:
        fail(f"Error: product ID must be a positive integer, got {raw!r}", 2)
    return int(raw)


def find_product(store, product_id):
    for product in store["products"]:
        if product["id"] == product_id:
            return product
    fail(f"Error: product {product_id} not found", 1)


def cmd_add(args):
    path = args.file
    store = load_store(path)
    product = {
        "id": store["next_id"],
        "name": validate_name(args.name),
        "price": validate_price(args.price),
        "quantity": validate_quantity(args.quantity),
    }
    store["products"].append(product)
    store["next_id"] += 1
    save_store(path, store)
    print(json.dumps(product, indent=2, ensure_ascii=False))


def cmd_list(args):
    store = load_store(args.file)
    products = sorted(store["products"], key=lambda product: product["id"])
    print(json.dumps(products, indent=2, ensure_ascii=False))


def cmd_get(args):
    store = load_store(args.file)
    product = find_product(store, validate_id(args.id))
    print(json.dumps(product, indent=2, ensure_ascii=False))


def cmd_update(args):
    path = args.file
    store = load_store(path)
    product = find_product(store, validate_id(args.id))
    updates = {}
    if args.name is not None:
        updates["name"] = validate_name(args.name)
    if args.price is not None:
        updates["price"] = validate_price(args.price)
    if args.quantity is not None:
        updates["quantity"] = validate_quantity(args.quantity)
    if not updates:
        fail("Error: update requires at least one of --name, --price, or --quantity", 2)
    product.update(updates)
    save_store(path, store)
    print(json.dumps(product, indent=2, ensure_ascii=False))


def cmd_delete(args):
    path = args.file
    store = load_store(path)
    product = find_product(store, validate_id(args.id))
    if not args.yes:
        fail("Error: delete requires --yes to confirm deletion", 2)
    store["products"].remove(product)
    save_store(path, store)
    print(json.dumps({"deleted_id": product["id"]}, indent=2))


def cmd_summary(args):
    """Custom feature: inventory summary (count, total units, total value)."""
    store = load_store(args.file)
    total_units = 0
    total_value = Decimal("0")
    for product in store["products"]:
        total_units += product["quantity"]
        total_value += Decimal(product["price"]) * product["quantity"]
    result = {
        "product_count": len(store["products"]),
        "total_units": total_units,
        "total_value": str(total_value.quantize(Decimal("0.01"))),
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))


def build_parser():
    parser = argparse.ArgumentParser(
        prog="products.py",
        description="Manage a small store's product inventory in a JSON file.",
    )
    parser.add_argument(
        "--file",
        default=DEFAULT_FILE,
        metavar="PATH",
        help=f"JSON data file to use (default: {DEFAULT_FILE})",
    )
    subparsers = parser.add_subparsers(dest="command", metavar="COMMAND", required=True)

    p_add = subparsers.add_parser("add", help="create one product")
    p_add.add_argument("--name", required=True, help="product name")
    p_add.add_argument("--price", required=True, help="price like 4 or 4.5 or 4.50")
    p_add.add_argument("--quantity", required=True, help="nonnegative whole number")
    p_add.set_defaults(func=cmd_add)

    p_list = subparsers.add_parser("list", help="print all products sorted by ID")
    p_list.set_defaults(func=cmd_list)

    p_get = subparsers.add_parser("get", help="print one product by ID")
    p_get.add_argument("id", help="product ID")
    p_get.set_defaults(func=cmd_get)

    p_update = subparsers.add_parser("update", help="change fields of one product")
    p_update.add_argument("id", help="product ID")
    p_update.add_argument("--name", help="new name")
    p_update.add_argument("--price", help="new price like 4.50")
    p_update.add_argument("--quantity", help="new nonnegative whole number")
    p_update.set_defaults(func=cmd_update)

    p_delete = subparsers.add_parser("delete", help="remove one product by ID")
    p_delete.add_argument("id", help="product ID")
    p_delete.add_argument("--yes", action="store_true", help="confirm the deletion")
    p_delete.set_defaults(func=cmd_delete)

    p_summary = subparsers.add_parser(
        "summary",
        help="show product count, total units, and total inventory value",
    )
    p_summary.set_defaults(func=cmd_summary)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    args.file = Path(args.file)
    try:
        args.func(args)
    except ToolError as exc:
        print(exc.message, file=sys.stderr)
        sys.exit(exc.code)
    except Exception as exc:
        print(f"Error: unexpected problem: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
