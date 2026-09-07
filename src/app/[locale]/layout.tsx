import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';
import { SITE } from '@/config/site';
import PwaInstaller from '@/components/PwaInstaller';

/**
 * 单景点 SEO 实体绑定 —— TouristAttraction 结构化数据
 * 通过 @id 在知识图谱中精确锚定节点，配合地址 + geo 坐标声明站点对应实体。
 */
const touristAttractionSchema = {
  '@context': 'https://schema.org',
  '@type': ['TouristAttraction', 'ObservationDeck'],
  '@id': `${SITE.baseUrl}/#attraction`,
  name: SITE.attractionFullName,
  alternateName: [SITE.attractionShortName, `${SITE.cityName} ${SITE.attractionFullName}`],
  description: `Monument and observation deck on Cerro de San Miguel in ${SITE.cityName}, ${SITE.countryName}, honoring Independence War hero El Pípila. Open-air 360° viewpoint reached by funicular or footpath.`,
  url: SITE.baseUrl,
  image: [SITE.heroImageUrl],
  isAccessibleForFree: true,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address,
    addressLocality: SITE.cityName,
    addressRegion: SITE.stateProvince,
    postalCode: SITE.postalCode,
    addressCountry: SITE.countryCode,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: SITE.latitude,
    longitude: SITE.longitude,
  },
  hasMap: SITE.mapsShareUrl,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: SITE.rating,
    reviewCount: SITE.reviewCount.replace(/,/g, ''),
    bestRating: '5',
  },
  sameAs: [
    SITE.mapsShareUrl,
    SITE.govtTourismUrl,
    'https://guanajuato.travel/',
    'https://en.wikipedia.org/wiki/Monumento_al_P%C3%ADpila',
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`@/messages/${locale}.json`)).default;
  const baseUrl = 'https://monumentoalpipila.com';

  const zhUrl = `${baseUrl}/zh`;
  const enUrl = `${baseUrl}/en`;
  const esUrl = `${baseUrl}/es`;

  let selfUrl = esUrl;
  if (locale === 'zh') selfUrl = zhUrl;
  else if (locale === 'en') selfUrl = enUrl;

  const localeMap: Record<string, string> = {
    'zh': 'zh_CN',
    'en': 'en_US',
    'es': 'es_MX',
  };

  const ogImage = {
    url: SITE.heroImageUrl,
    alt: `${SITE.attractionFullName} in ${SITE.cityName}`,
  };

  return {
    metadataBase: new URL(SITE.baseUrl),
    title: messages.meta.title,
    description: messages.meta.description,
    alternates: {
      canonical: selfUrl,
      languages: {
        'en': enUrl,
        'es': esUrl,
        'zh': zhUrl,
        'x-default': enUrl,
      } as Record<string, string>,
    },
    openGraph: {
      title: messages.meta.title,
      description: messages.meta.description,
      url: selfUrl,
      siteName: SITE.attractionFullName,
      locale: localeMap[locale] || 'es_MX',
      type: 'website',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: messages.meta.title,
      description: messages.meta.description,
      images: [ogImage],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const langMap: Record<string, string> = {
    'zh': 'zh-CN',
    'en': 'en',
    'es': 'es',
  };

  return (
    <html lang={langMap[locale] || 'es'} suppressHydrationWarning>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossOrigin="anonymous" />
        <meta name="google-adsense-account" content="ca-pub-XXXXXXXXXX" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />

        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-HXM22WWPKP" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){ dataLayer.push(arguments); }
              gtag('js', new Date());
              gtag('config', 'G-HXM22WWPKP');
            `,
          }}
        />

        {/* PWA 支持 */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0f2015" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Monumento Al Pipila" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* 结构化数据：TouristAttraction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(touristAttractionSchema) }}
        />
      </head>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>
          {children}
          <PwaInstaller />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
