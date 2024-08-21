import { trpc } from "~/trpc/trpc";
import { toast } from "sonner";

export function Home() {
  const q = trpc.hello.useQuery("1");
  console.log(q.data);
  return (
    <>
      <div className="flex h-full w-full justify-center pt-2">
        <div className="flex w-[80%] flex-col">
          <div className="card variant-glass flex items-center justify-between px-1 pb-4 pt-4">
            <h5 className="text-xl font-semibold">Your Protected Pages</h5>
            <button onClick={() => toast("My first toast")}>
              Give me a toast
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
