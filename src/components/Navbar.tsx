import { Link } from "wouter";
import { ThemeToggle } from "~/components/novel/ThemeToggle";
import { UserButton } from "~/components/UserButton";

const Navbar = () => {
  return (
    <nav className="shadow-l fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b-2 bg-background px-6 py-4">
      <div className="flex items-center">
        <Link href="/">
          <div className="flex cursor-pointer items-center">
            <img src="/favicon.ico" className="h-10 w-10" />
            <span className="text-2xl font-extrabold">Vault Block</span>
          </div>
        </Link>
      </div>
      <div className="flex items-center space-x-5">
        <ThemeToggle />
        <UserButton />
      </div>
    </nav>
  );
};

export default Navbar;
