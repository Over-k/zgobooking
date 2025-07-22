import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ListingsGrid } from "@/components/listing/ListingsGrid";
import { TrustSection } from "@/components/sections/TrustSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { TrendingSection } from "@/components/sections/TrendingSection";
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen container mx-auto p-4">
      <Navbar />
      {/* Main Content */}
      <div className="container flex flex-col items-center justify-center h-full">
        <ListingsGrid />
      </div>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <TrendingSection />
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <TrustSection />
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <HowItWorksSection />
        </div>
      </section>
      <Footer />
    </main>
  );
}