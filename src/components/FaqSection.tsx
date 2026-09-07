import { useTranslations, useMessages } from 'next-intl';

type FaqItem = { q: string; a: string };

/** 将 **加粗** 语法渲染为语义化 <strong> */
function renderRich(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary)">$1</strong>');
}

/**
 * FAQ 可见内容 + FAQPage 结构化数据（5~8 个常问问题）
 * 面向 Featured Snippet / AI Overview 卡片抢占。
 */
export default function FaqSection() {
  const t = useTranslations('faq');
  const messages = useMessages() as any;
  const items = (messages?.faq?.items ?? []) as FaqItem[];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <>
      <section id="faq" className="section-padding" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-3xl mx-auto">
          <h2
            className="font-display text-3xl sm:text-4xl font-semibold mb-2 text-center"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('title')}
          </h2>
          <p className="text-center mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('subtitle')}
          </p>
          <div
            className="w-12 h-0.5 mb-10 mx-auto rounded-full"
            style={{ background: 'var(--accent)' }}
          />

          {items.map((item, index) => (
            <details key={index} className="faq-item" open={index === 0}>
              <summary>
                <span>{item.q}</span>
              </summary>
              <div
                className="faq-answer"
                dangerouslySetInnerHTML={{ __html: renderRich(item.a) }}
              />
            </details>
          ))}
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
