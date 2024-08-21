import { Toaster } from "sonner";
import { Router } from "~/Router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, trpc, trpcQueryClient } from "~/trpc/trpc";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className={""}>
      <div className={"h-screen bg-background pt-16 font-sans antialiased"}>
        {/* {!router.pathname.includes("/protected") && <Navbar />} */}
        {children}
      </div>
    </main>
  );
}

export function App() {
  return (
    <trpc.Provider client={trpcQueryClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Toaster />
          <Router />
        </Layout>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
