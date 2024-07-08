export function formatMonetaryAmount(amount?: number | null) {
  if (amount === null || amount === undefined)
    return null

  return new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'})
    .format(amount);
}
