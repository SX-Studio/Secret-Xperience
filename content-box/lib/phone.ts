// Phone helpers. Normalization must match normalize_phone() in SQL:
// digits only, no '+', no spaces.
export function normalizePhone(input: string): string {
  return (input || '').replace(/\D/g, '').replace(/^00/, '');
}

// Loose E.164 check for the login form (7–15 digits after normalization).
export function looksLikePhone(input: string): boolean {
  const d = normalizePhone(input);
  return d.length >= 7 && d.length <= 15;
}
