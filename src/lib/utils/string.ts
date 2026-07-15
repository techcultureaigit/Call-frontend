export function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function toTitleCase(value: string): string {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\w\S*/g, (word) => capitalize(word.toLowerCase()));
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}…`;
}

export function getInitials(
  firstName: string,
  lastName?: string,
  maxLength = 2
): string {
  const parts = [firstName, lastName].filter(Boolean) as string[];
  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, maxLength);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isEmptyString(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim().length === 0;
}
