# Inventory CLI — ISBA 2438 Assignment 1

A Python 3 command-line tool that manages product inventory for a small store.
Products live in a local JSON file (`products.json` by default).

Built with the Python 3 standard library only — no third-party packages required.

## Custom feature: `summary`

### Problem it solves
A store owner usually wants two quick numbers: how many units are on the
shelf and what they are worth in total. Scanning every record and doing
mental math (`price × quantity` per item) is slow and error-prone.

### Who it helps
Small-store owners or anyone managing stock who wants a one-shot health
check of the whole inventory instead of eyeballing records one by one.

### Command syntax
    python3 products.py summary

It takes no arguments and supports the global `--file PATH` flag like
every other command.

### Inputs
None — it reads every product in the data file and aggregates three numbers.

### Expected output
A JSON object with:

- `product_count`: how many products are stored
- `total_units`: sum of every product's quantity
- `total_value`: sum of price × quantity, printed with exactly two
  decimal places (e.g. `"54.00"`); `"0.00"` when the store is empty

### Example
    $ python3 products.py add --name "Notebook" --price 4.5 --quantity 10
    $ python3 products.py summary
    {
      "product_count": 1,
      "total_units": 10,
      "total_value": "45.00"
    }

Edge case — an empty store returns zeros instead of failing:

    $ python3 products.py --file empty_store.json summary
    {
      "product_count": 0,
      "total_units": 0,
      "total_value": "0.00"
    }

## Core commands

    python3 products.py add --name NAME --price PRICE --quantity QTY
    python3 products.py list
    python3 products.py get ID
    python3 products.py update ID [--name NAME] [--price PRICE] [--quantity QTY]
    python3 products.py delete ID --yes

- `--file PATH` (optional, placed before the command) uses another data file.
- `delete` requires `--yes` as confirmation.
- `python3 products.py --help` and `python3 products.py COMMAND --help` print usage.

## Data file
UTF-8 JSON with a `next_id` counter and a `products` array:

    {
      "next_id": 2,
      "products": [
        {"id": 1, "name": "Notebook", "price": "4.50", "quantity": 10}
      ]
    }

IDs start at 1, are assigned automatically, and deleted IDs are never reused.
Prices are stored as strings with exactly two decimal places.

## Exit codes
- `0` — success (including empty results and `--help`)
- `1` — product not found, invalid stored data, or file read/write failure
- `2` — invalid syntax, missing arguments, or invalid input values

Errors print one concise line to standard error; the data file is never
modified by a failed command.

## Assignment 2: portfolio website
The Next.js portfolio for assignment 2 is in [`portfolio/`](portfolio/).
