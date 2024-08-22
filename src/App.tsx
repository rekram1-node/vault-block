import { Toaster } from "sonner";
import { useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, trpc, trpcQueryClient } from "~/trpc/trpc";
import { Router } from "~/Router";
import { ThemeProvider } from "./components/ThemeProvider";
import Navbar from "~/components/Navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  console.log(import.meta.env);

  return (
    <div className={"h-screen bg-background pt-16 font-sans antialiased"}>
      {!location.includes("/protected") && <Navbar />}
      {children}
    </div>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <trpc.Provider client={trpcQueryClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Layout>
            <Toaster />
            <Router />
          </Layout>
        </QueryClientProvider>
      </trpc.Provider>
    </ThemeProvider>
  );
};
