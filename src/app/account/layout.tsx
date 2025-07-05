import { ReactNode } from "react";
import { Sidebar } from "@/components/account/sidebar";
import { MobileNav } from "@/components/account/mobile-nav";

interface AccountLayoutProps {
  children: ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col md:flex-row md:gap-8">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4 md:hidden">
          <h1 className="text-xl sm:text-2xl font-bold">Account</h1>
          <MobileNav />
        </header>
        <aside className="hidden w-64 flex-shrink-0 md:block">
          <Sidebar />
        </aside>
        <main className="flex-1 pt-4 sm:pt-6 md:pt-0">{children}</main>
      </div>
    </div>
  );
}
