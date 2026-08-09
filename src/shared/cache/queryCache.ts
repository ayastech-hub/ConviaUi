/**
 * Lightweight in-memory + sessionStorage cache so navigating between tabs
 * does not flash empty/loading states when data was already fetched.
 */
type Entry<T> = { data: T; at: number };

const memory = new Map<string, Entry<unknown>>();
const PREFIX = 'convia.q.';

function readStorage<T>(key: string): Entry<T> | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as Entry<T>;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, entry: Entry<T>) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    /* quota / private mode */
  }
}

export function cacheGet<T>(key: string, maxAgeMs = 60_000): T | undefined {
  const mem = memory.get(key) as Entry<T> | undefined;
  if (mem && Date.now() - mem.at < maxAgeMs) return mem.data;
  const stored = readStorage<T>(key);
  if (stored && Date.now() - stored.at < maxAgeMs) {
    memory.set(key, stored);
    return stored.data;
  }
  if (mem) return mem.data;
  if (stored) {
    memory.set(key, stored);
    return stored.data;
  }
  return undefined;
}

export function cacheSet<T>(key: string, data: T) {
  const entry: Entry<T> = { data, at: Date.now() };
  memory.set(key, entry);
  writeStorage(key, entry);
}

export function cacheInvalidate(prefix?: string) {
  if (!prefix) {
    memory.clear();
    try {
      const keys: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k?.startsWith(PREFIX)) keys.push(k);
      }
      keys.forEach((k) => sessionStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    return;
  }
  for (const k of [...memory.keys()]) {
    if (k.startsWith(prefix)) memory.delete(k);
  }
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(PREFIX + prefix)) keys.push(k);
    }
    keys.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
