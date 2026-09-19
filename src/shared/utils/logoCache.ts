/** Cache VTPass (or other) logo URLs in localStorage + warm browser HTTP cache. */
const KEY = 'convia_provider_logos_v1';

type LogoMap = Record<string, string>;

function read(): LogoMap {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as LogoMap;
  } catch {
    return {};
  }
}

function write(map: LogoMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
}

export function cacheProviderLogos(entries: Array<{ code?: string; image?: string | null }>) {
  const map = read();
  let dirty = false;
  for (const e of entries) {
    const code = (e.code || '').toLowerCase();
    const img = e.image || '';
    if (!code || !img || !/^https?:\/\//i.test(img)) continue;
    if (map[code] !== img) {
      map[code] = img;
      dirty = true;
    }
    // Warm browser cache
    const i = new Image();
    i.decoding = 'async';
    i.src = img;
  }
  if (dirty) write(map);
}

export function getCachedLogo(code: string): string | undefined {
  return read()[(code || '').toLowerCase()];
}
