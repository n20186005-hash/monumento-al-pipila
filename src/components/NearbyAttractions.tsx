import { useTranslations, useMessages } from 'next-intl';

type Place = { name: string; desc: string };

/** 将 **加粗** 语法渲染为语义化 <strong> */
function renderRich(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary)">$1</strong>');
}

/**
 * 周边语义集群板块（SEO 实体绑定 - 4.3）
 * 语义等同：Monumento Al Pipila 与 El Pípila；锚定周边地标。
 */
export default function NearbyAttractions() {
  const t = useTranslations('nearby');
  const messages = useMessages() as any;
  const places = (messages?.nearby?.places ?? []) as Place[];

  return (
    <section
      id="nearby"
      className="section-padding"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div className="max-w-5xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-2 text-center"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <div
          className="w-12 h-0.5 mb-6 mx-auto rounded-full"
          style={{ background: 'var(--accent)' }}
        />
        <p
          className="text-center text-base sm:text-lg leading-relaxed max-w-3xl mx-auto mb-4"
          style={{ color: 'var(--text-secondary)' }}
          dangerouslySetInnerHTML={{ __html: renderRich(t('intro')) }}
        />
        <p
          className="text-center text-sm mb-10 max-w-2xl mx-auto"
          style={{ color: 'var(--text-muted)' }}
        >
          {t('hint')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {places.map((place) => (
            <article
              key={place.name}
              className="rounded-xl p-6 flex flex-col gap-2 transition-transform hover:-translate-y-1"
              style={{
                background: 'var(--bg-primary)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <h3
                className="text-lg font-semibold leading-snug"
                style={{ color: 'var(--text-primary)' }}
              >
                {place.name}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {place.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
