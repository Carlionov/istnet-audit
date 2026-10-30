import { SiteDecorations } from "@/components/SiteDecorations";
import { MistnetScripts } from "@/components/MistnetScripts";
import { MobileMenuA11y } from "@/components/MobileMenuA11y";
import { Header } from "@/components/Header";
import { Footer } from "@/components/footer/Footer";
import { SiteOverlays } from "@/components/SiteOverlays";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { Advantages } from "@/components/sections/Advantages";
import { StructuredData } from "@/components/StructuredData";
import { Pricing } from "@/components/sections/Pricing";
import { Locations } from "@/components/sections/Locations";
import { Protocols } from "@/components/sections/Protocols";
import { Terminal } from "@/components/sections/Terminal";
import { HowTo } from "@/components/sections/HowTo";
import { Quote } from "@/components/sections/Quote";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <StructuredData />
      <SiteDecorations />
      <Header />
      <main id="main">
        <Hero />
        <TrustBar />
        <Advantages />
        <Pricing />
        <Locations />
        <Protocols />
        <Terminal />
        <HowTo />
        <Quote />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <SiteOverlays />
      <MobileMenuA11y />
      <MistnetScripts />
    </>
  );
}
