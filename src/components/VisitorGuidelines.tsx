import { useTranslations, useMessages } from 'next-intl';

interface Guideline {
  t: string;
  d: string;
}

export default function VisitorGuidelines() {
  const t = useTranslations('guidelines');
  const messages = useMessages() as any;
  const items = (messages?.guidelines?.items ?? []) as Guideline[];

  return (
    <section id="responsibility" className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <p className="mb-8 max-w-3xl" style={{ color: 'var(--text-muted)' }}>
          {t('subtitle')}
        </p>
        <div className="w-12 h-0.5 mb-10" style={{ background: 'var(--accent)' }} />

        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl p-5"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                <span
                  className="flex-none w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  ✓
                </span>
                {item.t}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.d}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs leading-relaxed max-w-3xl" style={{ color: 'var(--text-muted)' }}>
          {t('note')}
        </p>
      </div>
    </section>
  );
}
