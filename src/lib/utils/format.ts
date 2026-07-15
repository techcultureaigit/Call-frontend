const currencyFormatterCache = new Map<string, Intl.NumberFormat>();

export function formatCurrency(
  value: number,
  currency = "USD",
  locale = "en-US"
): string {
  const cacheKey = `${locale}-${currency}`;
  let formatter = currencyFormatterCache.get(cacheKey);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    currencyFormatterCache.set(cacheKey, formatter);
  }

  return formatter.format(value);
}

export function formatNumber(
  value: number,
  locale = "en-US",
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatPercent(
  value: number,
  locale = "en-US",
  maximumFractionDigits = 1
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits,
  }).format(value / 100);
}

export function formatCompactNumber(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}
