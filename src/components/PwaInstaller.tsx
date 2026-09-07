'use client';

import { useEffect } from 'react';

/**
 * 注册 Service Worker，使站点具备 PWA 离线可用与可安装能力。
 * 仅在 https 或 localhost 环境下启用（浏览器安全策略要求）。
 */
export default function PwaInstaller() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const host = window.location.hostname;
    const isSecureContext =
      window.location.protocol === 'https:' ||
      host === 'localhost' ||
      host === '127.0.0.1';

    if (!isSecureContext) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* 静默失败，不影响页面浏览 */
      });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
    }

    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
