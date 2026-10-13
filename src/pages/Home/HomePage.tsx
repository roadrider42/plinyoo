/**
 * pages/LandingPage.tsx
 * Marketing Landing Page nach Entwicklungsrichtlinien
 * Zweck: Conversion-optimierte Startseite für neue Nutzer
 *
 * A/B Testing: Verschiedene Hero-Varianten
 * - original: Bisheriger Hero
 * - variant-a: Wissen aufbauen
 * - variant-b: Erfahrung kann man nicht lernen
 * - variant-c: Wissen wird zu Können
 */

import React from "react";

import Hero from "@/components/ui/Hero";
import HeroSection1 from "@/components/ui/HeroSection1";
import HeroSection2 from "@/components/ui/HeroSection2";
import HeroSection3 from "@/components/ui/HeroSection3";
import VisionMission from "@/components/ui/VisionMission";
import Roles from "@/components/ui/Roles";
import HowItWorks from "@/components/ui/HowItWorks";
import Examples from "@/components/ui/Examples";
import Features from "@/components/ui/Features";
import Journey from "@/components/ui/Journey";
import Story from "@/components/ui/Story";
import Faq from "@/components/ui/Faq";
import Outcomes from "@/components/ui/Outcomes";
import Pillars from "@/components/ui/Pillars";
import Views from "@/components/ui/Views";
import CTA from "@/components/ui/CTA";

export default function LandingPage() {
  const heroVariant = import.meta.env.VITE_HERO_VARIANT || 'original';

  const renderHero = () => {
    switch (heroVariant) {
      case 'variant-a':
        return <HeroSection1 />;
      case 'variant-b':
        return <HeroSection2 />;
      case 'variant-c':
        return <HeroSection3 />;
      default:
        return <Hero />;
    }
  };

  return (
    <>
      {renderHero()}
      <Story />
      <VisionMission />
      <Features />
      <Journey />
      <Views />
      <Pillars />
      <Outcomes />
      <Roles />
      <Examples />
      <HowItWorks />
      <Faq />
      <CTA />
    </>
  );
}
