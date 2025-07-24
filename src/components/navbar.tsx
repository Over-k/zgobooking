import { SheetMenu } from "./navbar/ui/SheetMenu";
import { DesktopMenu } from "./navbar/ui/DesktopMenu";
import { Logo } from "./navbar/logo/logo";
import  UserMenu  from "./navbar/ui/UserMenu";
import { Categories } from "./navbar/ui/Categories";

export default function Navbar() {
  return (
    <section className="w-full z-10">
      <div className="container">
        <nav className="flex items-center">
          <Logo />
          <DesktopMenu />
          <div className="hidden items-center gap-4 lg:flex">
            <UserMenu />
          </div>
          <div className="ml-auto lg:hidden">
            <SheetMenu />
          </div>
        </nav>
        <Categories />
      </div>
    </section>
  );
};
