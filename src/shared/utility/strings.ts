import { slice } from "@rbxts/string-utils";

export function slugToPascal(slug: string): string {
  return slug.split("-")
    .map(word => word.sub(1, 1).upper() + slice(word, 1))
    .join("");
}