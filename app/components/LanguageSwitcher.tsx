"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n';

const LanguageSwitcher = () => {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs transition-colors ${
            locale === loc
              ? 'bg-gold/20 border-gold text-gold'
              : 'bg-background-card border-border hover:border-gold text-foreground-muted hover:text-gold'
          }`}
          aria-label={`Switch to ${loc === 'en' ? 'English' : 'Arabic'}`}
        >
          {loc === 'en' ? '🇬🇧' : '🇸🇦'}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
