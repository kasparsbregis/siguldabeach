export function getCurrentSeasonYear(): number {
  return new Date().getFullYear();
}

export function parseSeasonYear(value: string | null): number | null {
  if (!value) return null;
  const year = Number.parseInt(value, 10);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return null;
  return year;
}
