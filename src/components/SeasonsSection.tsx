import { useTranslations, useMessages } from 'next-intl';

interface SeasonRow {
  season: string;
  span: string;
  climate: string;
  tip: string;
}

export default function SeasonsSection() {
  const t = useTranslations('seasons');
  const messages = useMessages() as any;
  const rows = (messages?.seasons?.rows ?? []) as SeasonRow[];

  const headers = [
    t('colSeason'),
    t('colMonths'),
    t('colClimate'),
    t('colTips'),
  ];

  return (
    <section id="seasons" className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
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

        {rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-color)', background: 'var(--card-bg)' }}>
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  {headers.map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 sm:px-5 py-3.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b last:border-b-0 align-top"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <td className="px-4 sm:px-5 py-4 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                      {row.season}
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                      {row.span}
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {row.climate}
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {row.tip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs leading-relaxed max-w-3xl" style={{ color: 'var(--text-muted)' }}>
          {t('note')}
        </p>
      </div>
    </section>
  );
}
