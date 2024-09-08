import ListVaults from "~/components/vaults/ListVaults";

export function Home() {
  // TODO: delete this...
  console.log("Environment Variables:", import.meta.env);

  return (
    <>
      <div className="flex h-full w-full justify-center pt-2">
        <ListVaults />
      </div>
    </>
  );
}
