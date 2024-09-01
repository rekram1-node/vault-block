import { useLocation } from "wouter";

export function Vault() {
  const [, navigate] = useLocation();
  return (
    <>
      <div className="flex h-full w-full justify-center pt-2">
        <div className="flex w-[80%] flex-col">
          <div className="card variant-glass flex items-center justify-between px-1 pb-4 pt-4">
            <h5 className="text-xl font-semibold">Vault Page</h5>
            {/* <button onClick={() => toast("My first toast")}>
                Give me a toast
              </button> */}
            <button onClick={() => navigate("/")}>Go Home</button>
          </div>
        </div>
      </div>
    </>
  );
}
