import { Toaster } from "sonner";
import { useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { trpc, trpcClient } from "~/lib/trpc";
import { Router } from "~/Router";
import { ThemeProvider } from "./components/ThemeProvider";
import { OauthProvider } from "~/components/OauthProvider";
import Navbar from "~/components/Navbar";
import { TRPCClientError } from "@trpc/client";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();

  return (
    <div className={"h-screen bg-background pt-16 font-sans antialiased"}>
      {!location.includes("/auth") && <Navbar />}
      {children}
    </div>
  );
};

const HTTP_STATUS_TO_NOT_RETRY = [400, 403, 404];

type ErrorDataWithCode = {
  code: string;
  httpStatus: number;
};

function hasCodeField(data: unknown): data is ErrorDataWithCode {
  return data !== null && typeof data === "object" && "code" in data;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof TRPCClientError && hasCodeField(error.data)) {
          if (HTTP_STATUS_TO_NOT_RETRY.includes(error.data.httpStatus)) {
            return false;
          }
        }
        // Enable retries for other errors (up to 3 times)
        return failureCount < 3;
      },
    },
  },
});

export const App = () => {
  return (
    <ThemeProvider>
      {/* <trpc.Provider client={trpcClient} queryClient={queryClient}> */}
      <QueryClientProvider client={queryClient}>
        <OauthProvider>
          <Layout>
            <Toaster />
            <Router />
          </Layout>
        </OauthProvider>
      </QueryClientProvider>
      {/* </trpc.Provider> */}
    </ThemeProvider>
  );
};
