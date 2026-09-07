/**
 * 单景点 SEO 实体绑定配置变量表 (Domain: monumentoalpipila.com)
 * --------------------------------------------------------------
 * 集中维护该页面绑定的地理实体（Monumento Al Pipila）的全部变量，
 * 供 JSON-LD 结构化数据、TDK/OG 元数据、正文语义文案与地图模块复用，
 * 避免在多处硬编码导致信息不一致。
 */

export const SITE = {
  // ── 域名 / 实体名称 ────────────────────────────────
  domainName: 'monumentoalpipila.com',
  baseUrl: 'https://monumentoalpipila.com',

  /** 景点官方全称（与 Google Maps 商家名称保持一致） */
  attractionFullName: 'Monumento Al Pipila',

  /** 景点常用俗称（域名含义的对应名称 / 当地通用叫法） */
  attractionShortName: 'El Pípila',

  /** 归属层级：全称 → 城市 → 州 → 国家 */
  cityName: 'Guanajuato',
  stateProvince: 'Guanajuato',
  countryName: 'Mexico',
  countryCode: 'MX',
  postalCode: '36000',
  address: 'Cerro de San Miguel S/N, Zona Centro, 36000 Guanajuato, Gto., Mexico',
  plusCode: '2P7W+Q6 Guanajuato, Mexico',

  // ── 地理坐标（来自 Google Maps 嵌入坐标）─────────────
  latitude: 21.0144964,
  longitude: -101.2544089,

  // ── Google 数据 ─────────────────────────────────────
  rating: '4.7',
  reviewCount: '39,069',
  mapsShareUrl: 'https://maps.app.goo.gl/tijtga6Z8omokNxv9',
  mapsEmbedSrc:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6372.3087180421535!2d-101.2544089!3d21.014496400000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842b740fa5ab4dcd%3A0xc433e9189f29aa1!2sMonumento%20Al%20Pipila!5e1!3m2!1sen!2s!4v1788749767887!5m2!1sen!2s',

  // ── 周边核心地标 ─────────────────────────────────────
  nearbyLandmark1: 'Alhóndiga de Granaditas',
  nearbyLandmark2: 'Jardín de la Unión',

  // ── 当地政府 / 官方旅游局 ────────────────────────────
  govtTourismUrl: 'https://www.gob.mx/sectur',

  // ── 站内规范图片资源（与 alt 语义绑定配合使用）────────
  heroImagePath: '/images/hero.jpg',
  heroImageUrl: 'https://monumentoalpipila.com/images/hero.jpg',

  galleryPrefix: '/gallery/',
} as const;
