const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();
const relativeTimeFormatterCache = new Map<string, Intl.RelativeTimeFormat>();

function getDateFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const cacheKey = `${locale}-${JSON.stringify(options)}`;
  let formatter = dateFormatterCache.get(cacheKey);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateFormatterCache.set(cacheKey, formatter);
  }

  return formatter;
}

function getRelativeTimeFormatter(locale: string): Intl.RelativeTimeFormat {
  let formatter = relativeTimeFormatterCache.get(locale);

  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    relativeTimeFormatterCache.set(locale, formatter);
  }

  return formatter;
}

export function parseDate(input: string | Date | number): Date {
  return input instanceof Date ? input : new Date(input);
}

export function formatDate(
  input: string | Date | number,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  return getDateFormatter(locale, options).format(parseDate(input));
}

export function formatDateTime(
  input: string | Date | number,
  locale = "en-US"
): string {
  return formatDate(input, locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeTime(
  input: string | Date | number,
  locale = "en-US"
): string {
  const date = parseDate(input);
  const now = Date.now();
  const diffInSeconds = Math.round((date.getTime() - now) / 1000);
  const formatter = getRelativeTimeFormatter(locale);

  const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" },
  ];

  let duration = diffInSeconds;

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return formatter.format(0, "second");
}

export function isValidDate(input: unknown): input is Date {
  return input instanceof Date && !Number.isNaN(input.getTime());
}

/** e.g. 2024-07-14 15:34:23 */
export function formatAgentCreatedAt(input: string | Date | number): string {
  const d = parseDate(input);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
