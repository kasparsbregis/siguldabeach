"use client";

import PageShell from "./components/PageShell";
import { HeroSection } from "./components/home/hero-section";
import { TournamentPreview } from "./components/home/tournament-preview";
import { FeatureBento } from "./components/home/feature-bento";
import { CTASection } from "./components/home/cta-section";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <PageShell fullWidth>
      <div className="flex flex-col gap-14 md:gap-20">
        <HeroSection />

        <Separator className="bg-border/40" />

        <TournamentPreview />

        <Separator className="bg-border/40" />

        <FeatureBento />

        <CTASection />
      </div>
    </PageShell>
  );
}
