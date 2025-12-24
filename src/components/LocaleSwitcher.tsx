'use client'

import { useLocale } from 'next-intl'
import { Globe, Loader2 } from 'lucide-react'
import { locales, localeNames, type Locale } from '@/i18n/config'
import { useChangeLocale } from '@/i18n/useLocale'

export function LocaleSwitcher() {
  const currentLocale = useLocale() as Locale
  const { changeLocale, isPending } = useChangeLocale()

  return (
    <div className="flex items-center gap-2">
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
      ) : (
        <Globe className="h-4 w-4 text-zinc-500" />
      )}
      <select
        aria-label="Language"
        value={currentLocale}
        onChange={(e) => changeLocale(e.target.value as Locale)}
        disabled={isPending}
        className="cursor-pointer border-none bg-transparent font-mono text-sm text-zinc-400 transition-colors hover:text-white focus:outline-none disabled:opacity-50"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale} className="bg-zinc-900">
            {localeNames[locale]}
          </option>
        ))}
      </select>
    </div>
  )
}
