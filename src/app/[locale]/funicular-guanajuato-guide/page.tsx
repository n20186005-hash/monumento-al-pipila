import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useMessages, useLocale } from 'next-intl';
import type { Metadata } from 'next';

const baseUrl = 'https://monumentoalpipila.com';
const path = 'funicular-guanajuato-guide';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'funicularGuide' });
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

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function FunicularGuideContent() {
  const messages = useMessages() as any;
  const locale = useLocale();
  const thingsHref = `/${locale}/things-to-do-in-guanajuato`;
  const homeHref = `/${locale}`;

  const content = messages?.funicularGuide;
  const intro = (content?.intro || []) as string[];
  const facts = (content?.facts || []) as Array<{ name: string; value: string }>;
  const route = (content?.route || []) as string[];
  const ticketParagraphs = (content?.ticketParagraphs || []) as string[];
  const hours = (content?.hours || []) as string[];
  const sunset = (content?.sunset || []) as string[];
  const walk = (content?.walk || []) as string[];
  const faq = (content?.faq || []) as Array<{ q: string; a: string }>;

  const headingStyle = { color: 'var(--text-primary)' };
  const bodyStyle = { color: 'var(--text-secondary)' };
  const mutedStyle = { color: 'var(--text-muted)' };

  const renderParagraphs = (paragraphs: string[]) => (
    <div className="space-y-4 leading-relaxed">
      {paragraphs.map((paragraph, i) => (
        <p key={i} style={bodyStyle}>
          {paragraph}
        </p>
      ))}
    </div>
  );

  const sectionTitle = (text: string, id: string) => (
    <h2 id={id} className="font-display text-2xl font-semibold mb-4 scroll-mt-24" style={headingStyle}>
      {text}
    </h2>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <a
          href={thingsHref}
          className="inline-flex items-center gap-2 text-sm font-medium mb-10 transition-colors no-underline"
          style={{ color: 'var(--accent)' }}
        >
          <ChevronLeftIcon />
          {content?.backLabel || 'Back'}
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

        <section className="mb-12">
          {sectionTitle(content?.introTitle || '', 'overview')}
          {renderParagraphs(intro)}
        </section>

        <section className="mb-12" aria-label={content?.factsTitle}>
          <div
            className="rounded-2xl p-6 sm:p-7"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
          >
            <h2 className="font-display text-lg font-semibold mb-5" style={headingStyle}>
              {content?.factsTitle}
            </h2>
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {facts.map((fact, i) => (
                <div key={i}>
                  <dt className="text-xs font-semibold uppercase tracking-wide mb-1" style={mutedStyle}>
                    {fact.name}
                  </dt>
                  <dd className="text-sm leading-relaxed" style={bodyStyle}>
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mb-12">
          {sectionTitle(content?.routeTitle || '', 'route')}
          {renderParagraphs(route)}
        </section>

        <section className="mb-12">
          {sectionTitle(content?.ticketTitle || '', 'prices')}
          {renderParagraphs(ticketParagraphs)}
        </section>

        <section className="mb-12">
          {sectionTitle(content?.hoursTitle || '', 'hours')}
          {renderParagraphs(hours)}
        </section>

        <section className="mb-12">
          {sectionTitle(content?.sunsetTitle || '', 'sunset')}
          {renderParagraphs(sunset)}
          <a
            href={`/${locale}/pipila-sunset-night-view`}
            className="inline-flex items-center gap-2 text-sm font-semibold mt-5 hover:underline no-underline"
            style={{ color: 'var(--accent)' }}
          >
            {content?.sunsetCta} →
          </a>
        </section>

        <section className="mb-12">
          {sectionTitle(content?.walkTitle || '', 'walking')}
          {renderParagraphs(walk)}
        </section>

        <section className="mb-14" aria-label={content?.faqTitle}>
          <h2 className="font-display text-2xl font-semibold mb-6" style={headingStyle}>
            {content?.faqTitle}
          </h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl p-5"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
              >
                <h3 className="font-display font-semibold text-sm mb-2" style={{ color: 'var(--accent)' }}>
                  {item.q}
                </h3>
                <p className="text-sm leading-relaxed" style={bodyStyle}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div
          className="rounded-2xl p-6 sm:p-7"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          <h2 className="font-display text-lg font-semibold mb-2" style={headingStyle}>
            {content?.ctaCardTitle}
          </h2>
          <p className="leading-relaxed text-sm mb-5" style={bodyStyle}>
            {content?.ctaCardText}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <a href={thingsHref} className="inline-flex items-center gap-2 text-sm font-semibold hover:underline no-underline" style={{ color: 'var(--accent)' }}>
              {content?.ctaCardLabel} <ArrowIcon />
            </a>
            <a href={homeHref} className="inline-flex items-center gap-2 text-sm font-semibold hover:underline no-underline" style={{ color: 'var(--accent)' }}>
              {content?.ctaHomeLabel} <ArrowIcon />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function FunicularGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FunicularGuideContent />;
}
