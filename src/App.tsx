import { Toaster } from "sonner";
import { useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Router } from "~/Router";
import { ThemeProvider } from "./components/ThemeProvider";
import { OauthProvider } from "~/components/OauthProvider";
import Navbar from "~/components/Navbar";
import { queryClient } from "~/lib/query";

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className={"h-screen pt-16 font-sans antialiased"}>
      {!location.includes("/auth") && <Navbar />}
      {children}
    </div>
  );
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
