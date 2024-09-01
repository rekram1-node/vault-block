import { Link } from "wouter";
import { ThemeToggle } from "~/components/novel/ThemeToggle";
import { UserButton } from "~/components/UserButton";
import { useTheme } from "./ThemeProvider";

const Navbar = () => {
  const { theme } = useTheme();
  return (
    <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between px-6 py-4">
      <div className="flex items-center">
        <Link href="/">
          <div className="flex cursor-pointer items-center">
            {theme === "light" ? (
              <img src="/light-icon.png" className="h-10 w-10" />
            ) : (
              <img src="/dark-icon.png" className="h-10 w-10" />
            )}
            <span className="text-lg font-extrabold">Vault Block</span>
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
