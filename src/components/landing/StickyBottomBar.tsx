'use client'

import { useTranslations } from "next-intl"
import { LayoutDashboard, Rocket } from "lucide-react"

export function StickyBottomBar() {
    const t = useTranslations('landing.hero')

    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL
    if (!dashboardUrl) {
        throw new Error('NEXT_PUBLIC_DASHBOARD_URL is required')
    }

    const miniappUrl = process.env.NEXT_PUBLIC_MINIAPP_URL
    if (!miniappUrl) {
        throw new Error('NEXT_PUBLIC_MINIAPP_URL is required')
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 sm:px-6 sm:pb-6 md:hidden">
            {/* Button container */}
            <div className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/90 px-4 py-3 backdrop-blur-xl sm:gap-4 sm:px-6">
                {/* Dashboard Button */}
                <div className="relative h-10 flex-1 sm:h-11">
                    <a
                        href={dashboardUrl}
                        className="flex h-full w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black transition-all hover:bg-white/90 sm:text-sm"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>{t('goToDashboard')}</span>
                    </a>
                </div>

                {/* Miniapp Button */}
                <a
                    href={miniappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl p-[1px] text-xs font-semibold text-white transition-all hover:opacity-90 sm:h-11 sm:text-sm"
                    style={{
                        background: 'linear-gradient(135deg, #22c55e, #84cc16, #eab308, #f97316, #ef4444, #ec4899, #a855f7, #6366f1, #3b82f6, #22c55e)'
                    }}
                >
                    <span className="flex h-full w-full items-center justify-center gap-2 rounded-[11px] bg-black/90 px-4">
                        <Rocket className="h-4 w-4" />
                        <span>{t('openMiniapp')}</span>
                    </span>
                </a>
            </div>
        </div>
    )
}
