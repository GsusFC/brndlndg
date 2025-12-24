'use client'

import Image from "next/image"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { LayoutDashboard, Rocket } from "lucide-react"

export function Header() {
    const t = useTranslations('landing.hero')
    const [isScrolled, setIsScrolled] = useState(false)

    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL
    if (!dashboardUrl) {
        throw new Error('NEXT_PUBLIC_DASHBOARD_URL is required')
    }

    const miniappUrl = process.env.NEXT_PUBLIC_MINIAPP_URL
    if (!miniappUrl) {
        throw new Error('NEXT_PUBLIC_MINIAPP_URL is required')
    }

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-center px-6 transition-all duration-300 md:justify-between md:px-12 ${
                isScrolled
                    ? 'bg-black/80 py-3 backdrop-blur-md'
                    : 'bg-transparent py-6'
            }`}
        >
            {/* Left Button - Go to Dashboard (Desktop only) */}
            <div className={`relative hidden transition-all duration-300 md:block ${
                isScrolled ? 'h-10 w-[160px]' : 'h-11 w-[180px]'
            }`}>
                <a
                    href={dashboardUrl}
                    className="flex h-full w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition-all hover:bg-white/90"
                >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{t('goToDashboard')}</span>
                </a>
            </div>

            {/* Center Logo */}
            <div className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
                <Image
                    src="/logo.svg"
                    alt="BRND"
                    width={120}
                    height={40}
                    className={`w-auto transition-all duration-300 ${
                        isScrolled ? 'h-6 md:h-7' : 'h-8 md:h-10'
                    }`}
                    priority
                />
            </div>

            {/* Right Button - Open Miniapp (Desktop only) */}
            <a
                href={miniappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden items-center justify-center rounded-xl p-[1px] text-sm font-semibold text-white transition-all hover:opacity-90 md:flex ${
                    isScrolled ? 'h-10 w-[160px]' : 'h-11 w-[180px]'
                }`}
                style={{
                    background: 'linear-gradient(135deg, #22c55e, #84cc16, #eab308, #f97316, #ef4444, #ec4899, #a855f7, #6366f1, #3b82f6, #22c55e)'
                }}
            >
                <span className="flex h-full w-full items-center justify-center gap-2 rounded-[11px] bg-black/90">
                    <Rocket className="h-4 w-4" />
                    <span>{t('openMiniapp')}</span>
                </span>
            </a>
        </header>
    )
}
