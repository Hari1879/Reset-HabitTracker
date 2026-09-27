let counter = 0;

/** Local-only unique id — no backend, so a timestamp + random suffix is sufficient. */
export function generateId(prefix = 'id'): string {
  counter = (counter + 1) % 1_000_000;
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${counter}-${random}`;
}
