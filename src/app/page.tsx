import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ListingsGrid } from "@/components/listing/ListingsGrid";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen container mx-auto p-4">
      <Navbar />
      {/* Main Content */}
      <div className="container flex flex-col items-center justify-center h-full">
        <ListingsGrid />
      </div>
      <Footer />
    </main>
  );
}