export function formatMonetaryAmount(amount?: number | null) {
  if (amount === null || amount === undefined)
    return null

  return new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'})
    .format(amount / 100.0);
}


export function parseMonetaryInput(input: string): number {
  return Math.round(Number.parseFloat(input) * 100);
}

export function formatMonetaryInput(input?: number): string {
  if (input == null) return '';
  return (input / 100).toString();
}