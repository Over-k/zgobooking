import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { MobileMenu }  from "./MobileMenu";
import  UserMenu  from "./UserMenu";
import { Logo } from "../logo/logo";


const SheetMenu = () => (
  <Sheet>
    <SheetTrigger asChild className="lg:hidden">
      <Button variant="outline" size="icon">
        <MenuIcon className="h-4 w-4" />
      </Button>
    </SheetTrigger>
    <SheetContent side="top" className="max-h-screen overflow-auto">
      <SheetHeader>
        <SheetTitle>
          <Logo />
        </SheetTitle>
      </SheetHeader>
      <div className="flex flex-col p-4">
        <MobileMenu />
        <div className="flex flex-col gap-6">
          <a href="/error" className="font-medium">
            Error
          </a>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <UserMenu />
        </div>
      </div>
    </SheetContent>
  </Sheet>
);

export { SheetMenu };
