import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'es', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/things-to-do-in-guanajuato': '/things-to-do-in-guanajuato',
    '/funicular-guanajuato-guide': '/funicular-guanajuato-guide',
    '/pipila-sunset-night-view': '/pipila-sunset-night-view',
    '/churches-in-guanajuato-mexico': '/churches-in-guanajuato-mexico',
    '/privacy-policy': '/privacy-policy',
    '/terms-of-service': '/terms-of-service',
    '/cookie-settings': '/cookie-settings',
  },
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
