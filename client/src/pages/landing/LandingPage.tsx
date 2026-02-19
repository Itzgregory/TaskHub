import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { FeatureGrid } from "@/components/landing/features/FeatureGrid";
import { FeaturePills } from "@/components/landing/features/FeaturePills";
import { IntegrationsCallout } from "@/components/landing/integrations/IntegrationsCallout";
import { TestimonialsGrid } from "@/components/landing/testimonials/TestimonialsGrid";
import { FAQAccordion } from "@/components/landing/faq/FAQAccordion";
import { FinalCTA } from "@/components/landing/cta/FinalCTA";
import { Footer } from "@/components/landing/footer/Footer";

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div
      style={{
        backgroundColor: "var(--c-bacPri)",
        color: "var(--c-texPri)",
        fontFamily: "'Inter', sans-serif",
      }}
      className="min-h-screen"
    >
      <Navbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <Hero />
      <SocialProof />
      <FeatureGrid />
      <FeaturePills />
      <IntegrationsCallout />
      <TestimonialsGrid />
      <FAQAccordion openFaq={openFaq} setOpenFaq={setOpenFaq} />
      <FinalCTA />
      <Footer />
    </div>
  );
}