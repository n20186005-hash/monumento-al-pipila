import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useMessages, useLocale } from 'next-intl';
import type { Metadata } from 'next';

const baseUrl = 'https://monumentoalpipila.com';
const path = 'things-to-do-in-guanajuato';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'thingsToDo' });
  const zhUrl = `${baseUrl}/zh/${path}`;
  const enUrl = `${baseUrl}/en/${path}`;
  const esUrl = `${baseUrl}/es/${path}`;
  const selfUrl = locale === 'zh' ? zhUrl : locale === 'en' ? enUrl : esUrl;

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: selfUrl,
      languages: {
        'en': enUrl,
        'es': esUrl,
        'zh': zhUrl,
        'x-default': enUrl,
      },
    },
  };
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ThingsToDoContent() {
  const messages = useMessages() as any;
  const locale = useLocale();
  const homeHref = `/${locale}`;

  const content = messages?.thingsToDo;
  const chips = (content?.chips || []) as string[];
  const items = (content?.items || []) as Array<{ title: string; desc: string; tip?: string }>;
  const intro = (content?.intro || []) as string[];
  const itinerary = (content?.itinerary || []) as Array<{ period: string; text: string }>;

  const headingStyle = { color: 'var(--text-primary)' };
  const bodyStyle = { color: 'var(--text-secondary)' };
  const mutedStyle = { color: 'var(--text-muted)' };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <a
          href={homeHref}
          className="inline-flex items-center gap-2 text-sm font-medium mb-10 transition-colors no-underline"
          style={{ color: 'var(--accent)' }}
        >
          <ChevronLeftIcon />
          {messages?.header?.backToHome || 'Home'}
        </a>

        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={mutedStyle}>
          {content?.eyebrow}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4 leading-tight" style={headingStyle}>
          {content?.title}
        </h1>
        <p className="text-xs mb-10" style={mutedStyle}>
          {content?.lastUpdated}
        </p>
        <div className="w-12 h-0.5 mb-10" style={{ background: 'var(--accent)' }} />

        <h2 className="font-display text-2xl font-semibold mb-4" style={headingStyle}>
          {content?.introTitle}
        </h2>
        <div className="space-y-4 leading-relaxed mb-12">
          {intro.map((paragraph, i) => (
            <p key={i} style={bodyStyle}>
              {paragraph}
            </p>
          ))}
        </div>

        <nav className="mb-12" aria-label={content?.chipsTitle}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={mutedStyle}>
            {content?.chipsTitle}
          </p>
          <div className="flex flex-wrap gap-2">
            {chips.map((label, i) => (
              <a
                key={i}
                href={`#td-${i}`}
                className="text-xs font-medium px-3 py-1.5 rounded-full no-underline hover:underline"
                style={{ background: 'var(--tag-bg)', color: 'var(--tag-text)' }}
              >
                {i + 1}. {label}
              </a>
            ))}
          </div>
        </nav>

        <div
          className="rounded-2xl p-6 sm:p-7 mb-14"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          <h2 className="font-display text-lg font-semibold mb-2" style={headingStyle}>
            {content?.calloutTitle}
          </h2>
          <p className="leading-relaxed text-sm mb-4" style={bodyStyle}>
            {content?.calloutText}
          </p>
          <a href={homeHref} className="text-sm font-semibold hover:underline no-underline" style={{ color: 'var(--accent)' }}>
            {content?.calloutCta} →
          </a>
          <a
            href={`/${locale}/funicular-guanajuato-guide`}
            className="block mt-3 text-sm font-semibold hover:underline no-underline"
            style={{ color: 'var(--accent)' }}
          >
            {content?.calloutCta2} →
          </a>
          <a
            href={`/${locale}/churches-in-guanajuato-mexico`}
            className="block mt-3 text-sm font-semibold hover:underline no-underline"
            style={{ color: 'var(--accent)' }}
          >
            {content?.calloutCta3} →
          </a>
        </div>

        <h2 className="font-display text-2xl font-semibold mb-2" style={headingStyle}>
          {content?.listTitle}
        </h2>
        <p className="text-sm mb-10" style={mutedStyle}>
          {content?.listIntro}
        </p>

        <div className="space-y-10 mb-16">
          {items.map((item, i) => (
            <article key={i} id={`td-${i}`} className="scroll-mt-24">
              <div className="flex items-start gap-4">
                <span
                  className="flex items-center justify-center shrink-0 w-9 h-9 rounded-full font-display font-bold text-sm mt-0.5"
                  style={{ background: 'var(--tag-bg)', color: 'var(--tag-text)' }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold mb-2" style={headingStyle}>
                    {item.title}
                  </h3>
                  <p className="leading-relaxed mb-3" style={bodyStyle}>
                    {item.desc}
                  </p>
                  {item.tip && (
                    <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                      {item.tip}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <h2 className="font-display text-2xl font-semibold mb-2" style={headingStyle}>
          {content?.itineraryTitle}
        </h2>
        <p className="leading-relaxed mb-8" style={bodyStyle}>
          {content?.itineraryIntro}
        </p>
        <div className="grid gap-5 sm:grid-cols-3 mb-14">
          {itinerary.map((block, i) => (
            <div
              key={i}
              className="rounded-2xl p-5"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
            >
              <p className="font-display font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                {block.period}
              </p>
              <p className="text-sm leading-relaxed" style={bodyStyle}>
                {block.text}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a href={homeHref} className="text-sm font-semibold hover:underline no-underline" style={{ color: 'var(--accent)' }}>
            {content?.calloutCta} →
          </a>
        </div>
      </div>
    </div>
  );
}

export default async function ThingsToDoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ThingsToDoContent />;
}
