import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/query";
import { toast } from "sonner";
import { useLocation } from "wouter";

export function Home() {
  const [, navigate] = useLocation();
  const { data } = useQuery({
    queryKey: [],
    queryFn: async () => {
      const res = await api.user.$get();
      return await res.json();
    },
  });
  console.log(data);

  return (
    <>
      <div className="flex h-full w-full justify-center pt-2">
        <div className="flex w-[80%] flex-col">
          <div className="card variant-glass flex items-center justify-between px-1 pb-4 pt-4">
            <h5 className="text-xl font-semibold">Your Vault Blocks</h5>
            <button onClick={() => toast("My first toast")}>
              Give me a toast
            </button>
            <button onClick={() => navigate("/vault")}>Go To Vault</button>
          </div>
          {"Hello: " + data?.userId}
        </div>
      </div>
    </>
  );
}
