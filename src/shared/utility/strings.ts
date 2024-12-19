import { slice } from "@rbxts/string-utils";

/**
 * Takes a slug-string and converts it into PascalCase
 */
export function slugToPascal(slug: string): string {
  return slug.split("-")
    .map(word => word.sub(1, 1).upper() + slice(word, 1))
    .join("");
}

/**
 * Takes a string and converts it into spaced text
 */
export function toSpaced(camelCased: string): string {
  return camelCased
    .gsub("([a-z])([A-Z])", "%1 %2")[0]
    .gsub("([A-Za-z])(%d)", "%1 %2")[0];
}

/**
 * Capitalizes the first letter of `text`
 */
export function capitalize(text: string): string {
  return text.gsub("^[a-z]", s => s.upper())[0];
}

/**
 * Removes all whitespace characters from `text`
 */
export function stripWhitespace(text: string): string {
  return text.gsub("%s+", "")[0];
}