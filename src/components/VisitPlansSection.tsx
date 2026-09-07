import { useTranslations, useMessages } from 'next-intl';

interface Audience {
  title: string;
  intro: string;
  points: string[];
}

interface Stop {
  t: string;
  d: string;
}

export default function VisitPlansSection() {
  const t = useTranslations('visitPlans');
  const messages = useMessages() as any;
  const audiences = (messages?.visitPlans?.audiences ?? []) as Audience[];
  const halfDay = (messages?.visitPlans?.itineraryHalf?.stops ?? []) as Stop[];
  const fullDay = (messages?.visitPlans?.itineraryFull?.stops ?? []) as Stop[];

  return (
    <>
      {/* 按人群定制的游览方案 */}
      <section id="plan" className="section-padding">
        <div className="max-w-6xl mx-auto">
          <h2
            className="font-display text-3xl sm:text-4xl font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('audienceTitle')}
          </h2>
          <p className="mb-8 max-w-3xl" style={{ color: 'var(--text-muted)' }}>
            {t('subtitle')}
          </p>
          <div className="w-12 h-0.5 mb-10" style={{ background: 'var(--accent)' }} />

          <div className="grid gap-5 md:grid-cols-3">
            {audiences.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 flex flex-col"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--accent)' }}>
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {item.intro}
                </p>
                <ul className="space-y-2 mt-auto">
                  {(item.points ?? []).map((point, j) => (
                    <li key={j} className="flex gap-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      <span aria-hidden="true" style={{ color: 'var(--accent)' }}>•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 推荐通用游览路线（半日 / 全日） */}
      <section id="routes" className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="font-display text-3xl sm:text-4xl font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('routesTitle')}
          </h2>
          <p className="mb-8 max-w-3xl" style={{ color: 'var(--text-muted)' }}>
            {t('subtitle2')}
          </p>
          <div className="w-12 h-0.5 mb-10" style={{ background: 'var(--accent)' }} />

          <div className="grid gap-6 md:grid-cols-2">
            <div
              className="rounded-2xl p-6 sm:p-7"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}
            >
              <h3 className="font-display text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('halfTitle')}
              </h3>
              <p className="mb-5 text-xs" style={{ color: 'var(--text-muted)' }}>
                {t('halfTime')}
              </p>
              <ol className="space-y-4">
                {halfDay.map((stop, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className="flex-none w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {stop.t}
                      </p>
                      <p className="text-sm leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {stop.d}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div
              className="rounded-2xl p-6 sm:p-7"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}
            >
              <h3 className="font-display text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('fullTitle')}
              </h3>
              <p className="mb-5 text-xs" style={{ color: 'var(--text-muted)' }}>
                {t('fullTime')}
              </p>
              <ol className="space-y-4">
                {fullDay.map((stop, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className="flex-none w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {stop.t}
                      </p>
                      <p className="text-sm leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {stop.d}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
