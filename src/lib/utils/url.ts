export function buildUrl(
  base: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  const normalizedBase = base.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export function getSearchParams(
  searchParams: URLSearchParams,
  key: string
): string | undefined {
  const value = searchParams.get(key);
  return value ?? undefined;
}

export function createQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//.test(url);
}

export function joinPaths(...segments: string[]): string {
  return segments
    .map((segment, index) => {
      if (index === 0) return segment.replace(/\/$/, "");
      return segment.replace(/^\//, "").replace(/\/$/, "");
    })
    .filter(Boolean)
    .join("/");
}
