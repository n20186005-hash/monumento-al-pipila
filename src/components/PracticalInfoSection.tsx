import { useTranslations, useMessages } from 'next-intl';

interface Facility {
  t: string;
  d: string;
}

export default function PracticalInfoSection() {
  const t = useTranslations('practical');
  const messages = useMessages() as any;
  const items = (messages?.practical?.items ?? []) as Facility[];

  return (
    <section id="practical" className="section-padding">
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl p-5 border-l-4"
              style={{
                background: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                borderLeftColor: 'var(--accent)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                {item.t}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.d}
              </p>
            </div>
          ))}
        </div>

        <p
          className="mt-6 inline-flex items-start gap-2 rounded-lg px-4 py-2.5 text-xs leading-relaxed max-w-3xl"
          style={{ background: 'var(--tag-bg)', color: 'var(--tag-text)' }}
        >
          <span aria-hidden="true" style={{ color: 'var(--accent)' }}>ⓘ</span>
          <span>{t('neutralNote')}</span>
        </p>
      </div>
    </section>
  );
}
