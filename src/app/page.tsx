import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { PodiumCarouselGSAP } from "@/components/landing/PodiumCarouselGSAP";
import { CredibilityTabs } from "@/components/landing/CredibilityTabs";
import { BrndAttributes } from "@/components/landing/BrndAttributes";
import { ScreenshotsGallery } from "@/components/landing/ScreenshotsGallery";
import { StickyBottomBar } from "@/components/landing/StickyBottomBar";

export default async function HomePage() {
  const t = await getTranslations("landing");

  return (
    <div className="min-h-screen bg-background font-sans pb-24">
      <Header />

      <HeroSection />

      <PodiumCarouselGSAP initialPodiums={[]} />

      <CredibilityTabs />

      <BrndAttributes />

      <ScreenshotsGallery />

      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <Image
              src="/logo.svg"
              alt="BRND"
              width={80}
              height={28}
              className="h-6 w-auto opacity-50"
            />
            <p className="text-sm text-zinc-500">
              {t("footer.rights", { year: new Date().getFullYear() })}
            </p>
            <LocaleSwitcher />
          </div>
        </div>
      </footer>

      <StickyBottomBar />
    </div>
  );
}
