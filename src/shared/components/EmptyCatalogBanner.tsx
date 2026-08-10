/** Shown when GET /tokens returns no rows — money UIs cannot invent assets. */
export function EmptyCatalogBanner({ message }: { message?: string }) {
  return (
    <div
      className="rounded-[16px] px-4 py-3 mb-3"
      style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
    >
      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
        No tokens configured
      </p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4, lineHeight: 1.45 }}>
        {message ||
          'The asset catalog is empty. An admin must register tokens and chains before deposit, send, or swap works.'}
      </p>
    </div>
  );
}
