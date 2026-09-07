/**
 * Cloudflare Worker —— 负责两件事：
 * 1. /api/weather：把 Open-Meteo 的实时/7 日预报缓存在边缘（10 分钟），
 *    前端无需直连第三方、更快更稳；
 * 2. 静态资源托管：以 Next.js 静态导出产物（out/）为文件源，
 *    并为 /es、/zh、/en 这类无扩展名语言路由补全为对应 .html 文件。
 */
const WEATHER_PARAMS = new URLSearchParams({
  latitude: '21.0145',
  longitude: '-101.2544',
  current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation',
  daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,wind_speed_10m_max',
  timezone: 'America/Mexico_City',
  forecast_days: '7',
});

const WEATHER_UPSTREAM = `https://api.open-meteo.com/v1/forecast?${WEATHER_PARAMS.toString()}`;
const WEATHER_CACHE_KEY = new Request('https://weather.monumentoalpipila.com/current-forecast');
const WEATHER_CACHE_TTL = 600;

const json = (body, status) =>
  new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });

async function serveWeather(ctx) {
  const cache = caches.default;
  try {
    const cached = await cache.match(WEATHER_CACHE_KEY);
    if (cached) return cached;
  } catch {
    /* cache read failed -> continue upstream */
  }

  try {
    const upstream = await fetch(WEATHER_UPSTREAM);
    if (!upstream.ok) return json('{}', 502);
    const text = await upstream.text();
    const response = new Response(text, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': `public, max-age=${WEATHER_CACHE_TTL}`,
      },
    });
    try {
      ctx.waitUntil(cache.put(WEATHER_CACHE_KEY, response.clone()));
    } catch {
      /* best-effort caching */
    }
    return response;
  } catch {
    return json('{}', 503);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1) 天气接口由 Worker 代取并缓存
    if (url.pathname === '/api/weather') {
      return serveWeather(ctx);
    }

    // 2) 静态资源：先让 ASSETS 直接处理
    const direct = await env.ASSETS.fetch(request);
    if (direct.status !== 404) return direct;

    // 3) 对无扩展名路径做 HTML 补全（/es -> /es/index.html 或 /es.html）
    const acceptsHtml = (request.headers.get('accept') || '').includes('text/html');
    const lastSegment = url.pathname.split('/').filter(Boolean).pop() || '';
    if (!acceptsHtml || lastSegment.includes('.')) return direct;

    const candidates = [
      `${url.pathname}/index.html`,
      `${url.pathname}.html`,
    ];
    for (const candidate of candidates) {
      const hit = await env.ASSETS.fetch(new Request(new URL(candidate, url.origin), request));
      if (hit.status !== 404) return hit;
    }
    return direct;
  },
};
