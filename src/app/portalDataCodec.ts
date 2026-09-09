/**
 * Converts between the application's camelCase model and PostgreSQL's
 * snake_case columns. The conversion is recursive because several legacy
 * tables store structured records in JSONB columns.
 */
function transformKeys(value: unknown, transform: (key: string) => string): unknown {
  if (Array.isArray(value)) return value.map((item) => transformKeys(item, transform));
  if (!value || typeof value !== 'object' || value instanceof Date) return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
      transform(key),
      transformKeys(nested, transform),
    ]),
  );
}

const toSnakeKey = (key: string) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const toCamelKey = (key: string) => key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

export function toPortalDatabase<T>(value: T): unknown {
  return transformKeys(value, toSnakeKey);
}

export function fromPortalDatabase<T>(value: unknown): T {
  return transformKeys(value, toCamelKey) as T;
}
