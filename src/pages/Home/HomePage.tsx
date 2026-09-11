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
// import StorySketch from "@/components/ui/StorySketch";
import Pillars from "@/components/ui/Pillars";
import Outcomes from "@/components/ui/Outcomes";
import Features from "@/components/ui/Features";
import Testimonials from "@/components/ui/Testimonials";
import Faq from "@/components/ui/Faq";
import CTA from "@/components/ui/CTA";

export default function LandingPage() {
  // A/B Testing: Wähle eine Hero-Variante.
  // Umgebungsvariable: VITE_HERO_VARIANT, gelesen aus der .env im Repo-Wurzel.
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
      <VisionMission />
      <Roles />
      <Examples />
      <HowItWorks />
      {/* <StorySketch /> */}
      <Pillars />
      <Outcomes />
      <Features />
      <Testimonials />
      <Faq />
      <CTA />
    </>
  );
}
