/**
 * In-memory + sessionStorage + optional localStorage so refresh does not
 * flash empty/zero while the network catches up.
 */
type Entry<T> = { data: T; at: number };

const memory = new Map<string, Entry<unknown>>();
const PREFIX = 'convia.q.';
const LOCAL_PREFIX = 'convia.lq.';

function readStorage<T>(key: string, store: Storage | null): Entry<T> | null {
  if (!store) return null;
  try {
    const raw = store.getItem(PREFIX + key) ?? store.getItem(LOCAL_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as Entry<T>;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, entry: Entry<T>, persist: 'session' | 'local' = 'session') {
  try {
    if (persist === 'local') {
      localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(entry));
    } else {
      sessionStorage.setItem(PREFIX + key, JSON.stringify(entry));
    }
  } catch {
    /* quota / private mode */
  }
}

/**
 * @param maxAgeMs soft TTL for “fresh”; if exceeded we still return stale data
 *   when `allowStale` is true so UI can show last-known values.
 */
export function cacheGet<T>(
  key: string,
  maxAgeMs = 60_000,
  opts?: { allowStale?: boolean; preferLocal?: boolean },
): T | undefined {
  const allowStale = opts?.allowStale !== false;
  const mem = memory.get(key) as Entry<T> | undefined;
  if (mem && Date.now() - mem.at < maxAgeMs) return mem.data;

  const session = typeof sessionStorage !== 'undefined' ? sessionStorage : null;
  const local = opts?.preferLocal && typeof localStorage !== 'undefined' ? localStorage : null;

  const stored =
    readStorage<T>(key, local) ||
    readStorage<T>(key, session) ||
    (opts?.preferLocal ? readStorage<T>(key, session) : readStorage<T>(key, local));

  if (stored) {
    memory.set(key, stored);
    if (Date.now() - stored.at < maxAgeMs || allowStale) return stored.data;
  }
  if (mem && allowStale) return mem.data;
  return undefined;
}

export function cacheSet<T>(key: string, data: T, opts?: { persist?: 'session' | 'local' }) {
  const entry: Entry<T> = { data, at: Date.now() };
  memory.set(key, entry);
  writeStorage(key, entry, opts?.persist || 'session');
  // Always mirror prices-style keys to local for hard refresh survival
  if (opts?.persist === 'local') {
    writeStorage(key, entry, 'local');
  }
}

export function cacheInvalidate(prefix?: string) {
  if (!prefix) {
    memory.clear();
    try {
      for (const store of [sessionStorage, localStorage]) {
        const keys: string[] = [];
        for (let i = 0; i < store.length; i++) {
          const k = store.key(i);
          if (k?.startsWith(PREFIX) || k?.startsWith(LOCAL_PREFIX)) keys.push(k);
        }
        keys.forEach((k) => store.removeItem(k));
      }
    } catch {
      /* ignore */
    }
    return;
  }
  for (const k of [...memory.keys()]) {
    if (k.startsWith(prefix)) memory.delete(k);
  }
  try {
    for (const store of [sessionStorage, localStorage]) {
      const keys: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        if (k?.startsWith(PREFIX + prefix) || k?.startsWith(LOCAL_PREFIX + prefix)) keys.push(k);
      }
      keys.forEach((k) => store.removeItem(k));
    }
  } catch {
    /* ignore */
  }
}
