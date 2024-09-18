import { Toaster } from "~/components/ui/sonner";
import { useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Router } from "~/Router";
import { ThemeProvider } from "./components/ThemeProvider";
import { OauthProvider } from "~/components/auth/OauthProvider";
import Navbar from "~/components/Navbar";
import { queryClient } from "~/lib/api/api";

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const showNav = !location.includes("/auth") && !location.includes("/vaults/");

  if (showNav) {
    return (
      <div className="h-screen pt-16 font-sans antialiased">
        <Navbar />
        {children}
      </div>
    );
  }

  return <div className="h-screen font-sans antialiased">{children}</div>;
}

// Routes excluded from Oauth protections
const excludedRoutes = ["/auth/sign-in", "/auth/callback", "/vaults", "/temp"];

export function App() {
  console.log(window.location.pathname);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <OauthProvider excludedRoutes={excludedRoutes}>
          <Layout>
            <Toaster />
            <Router />
          </Layout>
        </OauthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
