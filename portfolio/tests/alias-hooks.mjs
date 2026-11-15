import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const target = `${pathToFileURL(path.join(ROOT, specifier.slice(2)))}.ts`;
    return next(target, context);
  }
  return next(specifier, context);
}
