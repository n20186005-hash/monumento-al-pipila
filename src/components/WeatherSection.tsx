'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';

/**
 * 天气模块：获取瓜纳华托（Cerro de San Miguel）实时天气与未来 7 日预报。
 * 部署环境优先请求同源 /api/weather（由 Cloudflare Worker 缓存转发），
 * 其他环境直接请求公开接口；本地 15 分钟内复用缓存，避免频繁刷新。
 * 下方“出行建议”根据天气条件组合输出，只展示与当天相关的条目。
 */

const CURRENT =
  'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation';
const DAILY =
  'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,wind_speed_10m_max';
const DIRECT_URL = `https://api.open-meteo.com/v1/forecast?latitude=21.0145&longitude=-101.2544&current=${CURRENT}&daily=${DAILY}&timezone=America%2FMexico_City&forecast_days=7`;
const CACHE_KEY = 'pipila-weather-v2';
const CACHE_TTL = 15 * 60 * 1000;

type Status = 'loading' | 'ready' | 'error';
type WeatherKind = 'clear' | 'mainlyClear' | 'partlyCloudy' | 'overcast' | 'rain' | 'thunderstorm';
type TipSet = { outfit: string[]; activity: string[]; gear: string[]; risk: string[] };

interface DayForecast {
  date: string;
  code: number;
  tMax: number;
  tMin: number;
  pop: number | null;
  uv: number;
  wind: number;
}

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  code: number;
  precipitation: number;
  days: DayForecast[];
}

const round = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : fallback;
};

function wmoKind(code: number): WeatherKind {
  if (code === 0) return 'clear';
  if (code === 1) return 'mainlyClear';
  if (code === 2) return 'partlyCloudy';
  if (code >= 45 && code <= 48) return 'overcast';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'rain';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 85 && code <= 86) return 'rain';
  return 'thunderstorm';
}

function WeatherGlyph({ kind, size = 28 }: { kind: WeatherKind | string; size?: number }) {
  if (kind === 'clear') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="1.5" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22.5" />
        <line x1="1.5" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22.5" y2="12" />
        <line x1="4.6" y1="4.6" x2="6.4" y2="6.4" />
        <line x1="17.6" y1="17.6" x2="19.4" y2="19.4" />
        <line x1="19.4" y1="4.6" x2="17.6" y2="6.4" />
        <line x1="6.4" y1="17.6" x2="4.6" y2="19.4" />
      </svg>
    );
  }
  if (kind === 'mainlyClear' || kind === 'partlyCloudy') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8.5" cy="6" r="2.6" />
        <line x1="8.5" y1="1.5" x2="8.5" y2="3" />
        <line x1="4" y1="6" x2="5.5" y2="6" />
        <line x1="11.5" y1="6" x2="13" y2="6" />
        <line x1="5.3" y1="2.8" x2="6.4" y2="3.9" />
        <line x1="11.7" y1="9.2" x2="10.6" y2="8.1" />
        <path d="M18.5 15.5h-8.7a4 4 0 0 1-1.2-7.8 5 5 0 0 1 9.8.5 3.4 3.4 0 0 1 .1 7.3z" />
      </svg>
    );
  }
  if (kind === 'overcast') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M17.5 19H9a4.5 4.5 0 0 1-1.4-8.8A5.5 5.5 0 0 1 19 8.6a3.8 3.8 0 0 1 2.6 4.9A3.5 3.5 0 0 1 17.5 19z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 17H7.5A4 4 0 0 1 6.4 9.1 5 5 0 0 1 16 8.6a3.6 3.6 0 0 1 3.5 4.4 3 3 0 0 1-2 4z" />
      <line x1="8" y1="20" x2="8" y2="22" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="16" y1="20" x2="16" y2="22" />
    </svg>
  );
}

function rainLevel(code: number): 0 | 1 | 2 {
  // 0 无雨, 1 轻/小雨, 2 较强降雨
  if (code >= 95) return 2; // 雷暴按强降雨级别处理安全提示
  if (code === 65 || code === 66 || code === 67 || code === 82) return 2;
  if ((code >= 51 && code <= 57) || code === 61 || code === 80 || code === 81) return 1;
  if ((code >= 63 && code <= 64) || (code >= 71 && code <= 77)) return 1;
  return 0;
}

function uvQual(uv: number): 'low' | 'moderate' | 'high' | 'veryHigh' | 'extreme' {
  if (uv <= 2) return 'low';
  if (uv <= 5) return 'moderate';
  if (uv <= 7) return 'high';
  if (uv <= 10) return 'veryHigh';
  return 'extreme';
}

/** 根据某一天的天气字段组合出需要展示的建议条目（不命中就不返回）。 */
function buildTips(day: DayForecast, nowTemp: number): TipSet {
  const outfit: string[] = [];
  const activity: string[] = [];
  const gear: string[] = [];
  const risk: string[] = [];

  const pop = day.pop ?? 0;
  const uv = day.uv;
  const wind = day.wind;
  const code = day.code;
  const rain = rainLevel(code);
  const thunder = code >= 95;
  const fog = code >= 45 && code <= 48;
  const sunny = code >= 0 && code <= 2;
  const cloudyOnly = code === 3;
  const swing = day.tMax - day.tMin >= 9;
  const rainingAny = rain > 0 || pop >= 60;

  // —— 穿搭 ——
  if (rainingAny) {
    outfit.push('fit_rainOuter');
    if (day.tMax >= 30) outfit.push('fit_warm');
    else if (day.tMin <= 6 || day.tMax <= 14) outfit.push('fit_cool');
    else if (swing) outfit.push('fit_swing');
  } else if (day.tMax >= 30) {
    outfit.push('fit_warm');
  } else if (day.tMin <= 6 || day.tMax <= 14) {
    outfit.push('fit_cool');
    if (swing) outfit.push('fit_swing');
  } else if (swing) {
    outfit.push('fit_swing');
  } else {
    outfit.push('fit_mild');
  }
  if (wind >= 39 && outfit.length < 3) outfit.push('fit_windy');

  // —— 游玩安排 ——
  if (thunder) {
    activity.push('act_thunder');
  } else if (rain === 2) {
    activity.push('act_rainHeavy');
  } else if (rain === 1) {
    activity.push('act_rainLight');
  } else if (fog) {
    activity.push('act_fog');
  } else if (sunny) {
    activity.push('act_sunny');
  } else if (cloudyOnly) {
    activity.push('act_cloudy');
  }
  if (sunny && day.tMin <= 8 && activity.length < 2) activity.push('act_chill');
  if (day.tMax >= 32 && activity.length < 2) activity.push('act_heat');
  if (pop >= 60 && rain === 0 && !thunder && !fog && activity.length < 3) activity.push('act_pop');
  if (wind >= 39 && !thunder && activity.length < 3) activity.push('act_wind');
  if (activity.length === 0) activity.push('act_cloudy');

  // —— 随身物品 ——
  if (rainingAny) {
    if (rain === 2 || thunder || wind >= 39) gear.push('gear_raincoat');
    else gear.push('gear_umbrella');
  }
  if (uv >= 5) gear.push('gear_sunscreen');
  if (uv >= 8) gear.push('gear_sunglasses');
  if (day.tMax >= 30 || nowTemp >= 30) gear.push('gear_water');
  if (wind >= 39) gear.push('gear_wind');

  // —— 风险提醒 ——
  if (thunder) risk.push('risk_thunder');
  if (rain === 2 && !thunder) risk.push('risk_heavy');
  if (wind >= 50) risk.push('risk_wind');
  if (day.tMax >= 35) risk.push('risk_heat');

  const cap = (arr: string[], max: number) => Array.from(new Set(arr)).slice(0, max);
  return { outfit: cap(outfit, 3), activity: cap(activity, 3), gear: cap(gear, 4), risk: cap(risk, 3) };
}

export default function WeatherSection() {
  const t = useTranslations('weather');
  const locale = useLocale();
  const [status, setStatus] = useState<Status>('loading');
  const [data, setData] = useState<WeatherData | null>(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    const parsePayload = (raw: any): WeatherData => {
      const days: DayForecast[] = (raw?.daily?.time ?? []).map((date: string, i: number) => ({
        date,
        code: round(raw?.daily?.weather_code?.[i]),
        tMax: round(raw?.daily?.temperature_2m_max?.[i]),
        tMin: round(raw?.daily?.temperature_2m_min?.[i]),
        pop: raw?.daily?.precipitation_probability_max?.[i] ?? null,
        uv: round(raw?.daily?.uv_index_max?.[i]),
        wind: round(raw?.daily?.wind_speed_10m_max?.[i]),
      }));
      if (days.length > 0) {
        days[0].wind = Math.max(days[0].wind, round(raw?.current?.wind_speed_10m));
      }
      return {
        temp: round(raw?.current?.temperature_2m),
        feelsLike: round(raw?.current?.apparent_temperature),
        humidity: round(raw?.current?.relative_humidity_2m),
        wind: round(raw?.current?.wind_speed_10m),
        code: round(raw?.current?.weather_code),
        precipitation: Math.round((Number(raw?.current?.precipitation) || 0) * 10) / 10,
        days,
      };
    };

    const readCache = (): { at: number; payload: any } | null => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch {
        return null;
      }
    };

    const writeCache = (payload: any) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), payload }));
      } catch {
        /* ignore */
      }
    };

    const load = async () => {
      const cached = readCache();
      if (cached && Date.now() - cached.at < CACHE_TTL) {
        window.clearTimeout(timeout);
        if (!cancelled) {
          setData(parsePayload(cached.payload));
          setStatus('ready');
        }
        return;
      }
      try {
        let payload: any = null;
        try {
          const res = await fetch('/api/weather', { signal: controller.signal });
          if (res.ok) payload = await res.json();
        } catch {
          /* fall back to direct request below */
        }
        if (!payload) {
          const res = await fetch(DIRECT_URL, { signal: controller.signal });
          if (!res.ok) throw new Error(`weather ${res.status}`);
          payload = await res.json();
        }
        if (cancelled) return;
        window.clearTimeout(timeout);
        writeCache(payload);
        setData(parsePayload(payload));
        setStatus('ready');
      } catch {
        window.clearTimeout(timeout);
        if (!cancelled) setStatus('error');
      }
    };

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const localeTag = locale === 'zh' ? 'zh-CN' : locale === 'es' ? 'es-MX' : 'en-GB';
  const formatDay = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString(localeTag, { day: 'numeric', month: 'short' });
  };
  const formatWeekday = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString(localeTag, { weekday: 'short' });
  };

  const tokens = (t.raw('smart.tokens') as Record<string, string>) || {};
  const uvText = (uv: number) =>
    uv < 0.5 ? '' : `${Math.round(uv)} · ${t(`uvLevels.${uvQual(uv)}`)}`;

  const adv = useMemo<TipSet | null>(() => {
    if (!data || !data.days[selected]) return null;
    const day = data.days[selected];
    return buildTips(day, selected === 0 ? data.temp : day.tMax);
  }, [data, selected]);

  const kind = data ? wmoKind(data.code) : 'clear';
  const day0 = data?.days[0];

  const group = (
    label: string,
    items: string[],
    color: string,
  ): ReactElement | null => {
    if (!items.length) return null;
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        <ul className="space-y-1.5">
          {items.map((key) => (
            <li key={key} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
              <span>{tokens[key] || key}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <section id="weather" className="section-padding">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          {t('title')}
        </h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          {t('subtitle')}
        </p>
        <div className="w-12 h-0.5 mb-10" style={{ background: 'var(--accent)' }} />

        {status === 'error' && (
          <div
            className="rounded-xl p-6 text-center text-sm"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
          >
            <p className="mb-3">{t('unavailable')}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {t('retry')}
            </button>
          </div>
        )}

        {(status === 'loading' || status === 'ready') && (
          <>
            <div className="grid gap-6 lg:grid-cols-5">
              {/* 当前天气卡片 */}
              <div
                className="rounded-2xl p-6 lg:col-span-2"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}
              >
                {status === 'loading' ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 w-2/3 rounded" style={{ background: 'var(--tag-bg)' }} />
                    <div className="h-16 w-1/2 rounded" style={{ background: 'var(--tag-bg)' }} />
                    <div className="h-4 w-3/4 rounded" style={{ background: 'var(--tag-bg)' }} />
                    <div className="h-24 w-full rounded" style={{ background: 'var(--tag-bg)' }} />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {t('today')}
                        </span>
                        <p className="font-display text-5xl font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
                          {data!.temp}°C
                        </p>
                      </div>
                      <span style={{ color: 'var(--accent)' }}>
                        <WeatherGlyph kind={kind} />
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {t(`condition.${kind}`)} {day0 && `· ${day0.tMax}° / ${day0.tMin}°`}
                    </p>
                    <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div>
                        <dt style={{ color: 'var(--text-muted)' }}>{t('feelsLike')}</dt>
                        <dd className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {data!.feelsLike}°C
                        </dd>
                      </div>
                      <div>
                        <dt style={{ color: 'var(--text-muted)' }}>{t('humidity')}</dt>
                        <dd className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {data!.humidity}%
                        </dd>
                      </div>
                      <div>
                        <dt style={{ color: 'var(--text-muted)' }}>{t('wind')}</dt>
                        <dd className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {data!.wind} km/h
                        </dd>
                      </div>
                      <div>
                        <dt style={{ color: 'var(--text-muted)' }}>{t('chanceRain')}</dt>
                        <dd className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {day0?.pop != null ? `${day0.pop}%` : '—'}
                        </dd>
                      </div>
                      {day0 && day0.uv >= 0.5 && (
                        <div>
                          <dt style={{ color: 'var(--text-muted)' }}>{t('uvIndex')}</dt>
                          <dd className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {uvText(day0.uv)}
                          </dd>
                        </div>
                      )}
                      {data!.precipitation > 0.05 && (
                        <div>
                          <dt style={{ color: 'var(--text-muted)' }}>{t('precipitation')}</dt>
                          <dd className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {data!.precipitation} mm
                          </dd>
                        </div>
                      )}
                    </dl>
                  </>
                )}
              </div>

              {/* 出行建议 */}
              <div
                className="rounded-2xl p-6 lg:col-span-3"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}
              >
                {status === 'loading' ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-5 w-1/2 rounded" style={{ background: 'var(--tag-bg)' }} />
                    <div className="h-3 w-2/3 rounded" style={{ background: 'var(--tag-bg)' }} />
                    <div className="h-24 w-full rounded" style={{ background: 'var(--tag-bg)' }} />
                    <div className="h-16 w-3/4 rounded" style={{ background: 'var(--tag-bg)' }} />
                  </div>
                ) : data && adv ? (
                  <>
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {t('smart.title')}
                        </h3>
                        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {selected === 0
                            ? `${t('today')} · ${formatDay(data.days[0].date)}`
                            : t('smart.forDay', { date: formatDay(data.days[selected].date) })}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {t('smart.subtitle')}
                    </p>

                    {adv.risk.length > 0 && (
                      <div
                        className="mt-4 rounded-xl px-4 py-3"
                        style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.45)' }}
                      >
                        <p className="text-sm font-semibold mb-1" style={{ color: '#b91c1c' }}>
                          {t('smart.riskTitle')}
                        </p>
                        <ul className="space-y-1">
                          {adv.risk.map((key) => (
                            <li key={key} className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {tokens[key] || key}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-5 grid gap-5 sm:grid-cols-1">
                      {group(t('smart.outfit'), adv.outfit, 'var(--accent)')}
                      {group(t('smart.activity'), adv.activity, '#eab308')}
                      {group(t('smart.gear'), adv.gear, '#10b981')}
                    </div>

                    {adv.risk.length === 0 && (
                      <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        ✓ {t('smart.noRisk')}
                      </p>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            {/* 7 日预报（点击某天查看建议） */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {t('smart.forecastTitle')}
              </p>
              {status === 'loading' ? (
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-32 rounded-xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                  {data!.days.map((day, i) => {
                    const active = i === selected;
                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => setSelected(i)}
                        aria-pressed={active}
                        className="rounded-xl p-3 text-left transition-colors cursor-pointer"
                        style={{
                          background: active ? 'rgba(var(--accent-rgb, 202,138,4), 0.12)' : 'var(--card-bg)',
                          border: active ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
                          boxShadow: active ? 'var(--card-shadow)' : 'none',
                        }}
                      >
                        <p className="text-xs font-medium" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
                          {i === 0 ? t('today') : formatWeekday(day.date)}
                        </p>
                        <div className="mt-1.5" style={{ color: 'var(--accent)' }}>
                          <WeatherGlyph kind={wmoKind(day.code)} size={22} />
                        </div>
                        <p className="mt-1.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {day.tMax}° / {day.tMin}°
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {day.pop != null ? `${day.pop}%` : '—'}
                          {day.uv >= 0.5 ? ` · UV ${Math.round(day.uv)}` : ''}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
