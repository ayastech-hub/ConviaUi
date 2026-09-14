import { motion } from 'motion/react';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { PRIVACY_DOC, TERMS_DOC, type LegalDoc } from '../components/legalContent';

interface Props {
  doc: 'privacy' | 'terms';
  goBack: () => void;
}

export function LegalDocumentScreen({ doc, goBack }: Props) {
  const data: LegalDoc = doc === 'privacy' ? PRIVACY_DOC : TERMS_DOC;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-2">
        <BackButton onClick={goBack} />
        <div className="flex-1 min-w-0 pr-10">
          <h1 className="text-center truncate" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>
            {data.title}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-12">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <div
            className="rounded-[22px] p-5 mb-5"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>{data.title}</p>
            <p className="mt-1" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
              {data.subtitle}
            </p>
            <p className="mt-3" style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>
              {data.effective}
            </p>
          </div>

          <div className="space-y-4">
            {data.sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[18px] px-4 py-4"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <h2 style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 14, marginBottom: 8 }}>
                  {section.title}
                </h2>
                <div className="space-y-2.5">
                  {section.body.map((p, i) => (
                    <p key={i} style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.55 }}>
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="text-center mt-8 mb-4" style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
            Convia · {data.title}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
