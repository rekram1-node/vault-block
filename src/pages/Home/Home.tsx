import ListVaults from "~/components/vaults/ListVaults";

export function Home() {
  console.log("Environment Variables:", import.meta.env);

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
