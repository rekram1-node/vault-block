import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/query";
import ListVaults from "~/components/ListVaults";

export function Home() {
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
        {/* <div className="">
        </div> */}
        <ListVaults />
      </div>
    </>
  );
}
