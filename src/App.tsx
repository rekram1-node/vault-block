import { Toaster } from "sonner";
import { useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "~/Router";
import { ThemeProvider } from "./components/ThemeProvider";
import { OauthProvider } from "~/components/OauthProvider";
import Navbar from "~/components/Navbar";
import { HTTPError } from "ky";

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className={"h-screen bg-muted/40 pt-16 font-sans antialiased"}>
      {!location.includes("/auth") && <Navbar />}
      {children}
    </div>
  );
}

const HTTP_STATUS_TO_NOT_RETRY = [400, 403, 404];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof HTTPError) {
          if (HTTP_STATUS_TO_NOT_RETRY.includes(error.response.status)) {
            return false;
          }
        }
        // Enable retries for other errors (up to 3 times)
        return failureCount < 3;
      },
    },
  },
});

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
