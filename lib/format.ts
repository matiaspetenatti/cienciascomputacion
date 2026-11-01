const YEAR_LABELS: Record<number, string> = {
  1: "Primer año",
  2: "Segundo año",
  3: "Tercer año",
  4: "Cuarto año",
  5: "Quinto año",
  6: "Sexto año",
};

export function yearLabel(year: number): string {
  return YEAR_LABELS[year] ?? `${year}° año`;
}

export function readingTime(minutes: number): string {
  return `${minutes} min de lectura`;
}
