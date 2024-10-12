import { useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Router } from "~/Router";
import { Toaster } from "~/components/ui/sonner";
import { ThemeProvider } from "./components/ThemeProvider";
import Navbar from "~/components/Navbar";
import { queryClient } from "~/lib/api/api";
import {
  AuthProvider,
  useAuthProvider,
} from "./components/auth/AuthProviderv2";
import ErrorBoundaryFallback from "./components/ErrorBoundaryFallback";

const forbiddenPaths = ["/auth", "/vaults/", "/404"];

function Layout({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();
  const [location] = useLocation();
  const showNav = !forbiddenPaths.some((path) => location.includes(path));

  if (showNav && auth.signedIn) {
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
    <ErrorBoundary
      FallbackComponent={ErrorBoundaryFallback}
      onError={(error) => {
        console.error(`Encountered Unexpected Error: ${JSON.stringify(error)}`);
      }}
      onReset={() => {
        window.location.reload();
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Layout>
              <Toaster />
              <Router />
            </Layout>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
