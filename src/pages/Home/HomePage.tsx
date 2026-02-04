/**
 * pages/LandingPage.tsx
 * Marketing Landing Page nach Entwicklungsrichtlinien
 * Zweck: Conversion-optimierte Startseite für neue Nutzer
 */

import React from "react";

import Hero from "@/components/ui/Hero";
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
  return (
    <>
      <Hero />
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
