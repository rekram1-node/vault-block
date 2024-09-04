import { Toaster } from "~/components/ui/sonner";
import { useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Router } from "~/Router";
import { ThemeProvider } from "./components/ThemeProvider";
import { OauthProvider } from "~/components/auth/OauthProvider";
import Navbar from "~/components/Navbar";
import { queryClient } from "~/lib/query";

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

export function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <OauthProvider>
          <Layout>
            <Toaster />
            <Router />
          </Layout>
        </OauthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
