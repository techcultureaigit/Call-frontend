/**
 * In-memory store for mock contact uploads when Cloudinary env is not set.
 * Dev/local only — process memory; real Cloudinary is used when configured.
 */

type MockContactFile = {
  fileName: string;
  text: string;
  contentType: string;
  createdAt: number;
};

const store = new Map<string, MockContactFile>();

const MAX_AGE_MS = 1000 * 60 * 60 * 6; // 6 hours

function prune() {
  const now = Date.now();
  for (const [id, file] of store) {
    if (now - file.createdAt > MAX_AGE_MS) store.delete(id);
  }
}

export function saveMockContactFile(
  fileName: string,
  text: string,
  contentType = "text/csv; charset=utf-8"
): string {
  prune();
  const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  store.set(id, { fileName, text, contentType, createdAt: Date.now() });
  return id;
}

export function getMockContactFile(id: string): MockContactFile | undefined {
  prune();
  return store.get(id);
}
