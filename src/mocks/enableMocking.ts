/** Mocks disabled — FE always talks to VITE_API_BASE_URL. */
export async function enableMocking(): Promise<void> {
  try {
    localStorage.removeItem('convia.forceMock');
  } catch {
    /* ignore */
  }
}
