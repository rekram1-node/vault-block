import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Vault } from "./Vault";
import { Create } from "./vaults/Create";
import { api, keys } from "~/lib/query";

export default function ListVaults() {
  const { data: vaults } = useQuery({
    queryKey: keys.vaults,
    queryFn: async () => {
      const res = await api.user.vaults.$get();
      return await res.json();
    },
  });
  console.log(vaults);

  return (
    // The transparent borders and background may not be ideal
    // bg-transparent border-transparent
    <Card className="h-auto max-h-[80vh] w-2/3 overflow-y-auto p-4">
      <CardHeader>
        {/* <CardTitle>Your Vaults</CardTitle>
        <CardDescription>
          Manage your vaults and view their content.
        </CardDescription>
        <Button>Create</Button> */}
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Your Vaults</CardTitle>
            <CardDescription>
              Manage your vaults and view their content.
            </CardDescription>
          </div>
          <Create />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden w-[200px] md:table-cell">
                Updated at
              </TableHead>
              <TableHead className="w-[100px] text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vaults?.map((v, i) => <Vault key={i} name={v.name} id={v.id} />)}
            {/* TODO: Add skeleton and loading state */}
          </TableBody>
        </Table>
      </CardContent>
      {/* <CardFooter> */}
      {/* TODO: Make the counter stick in bottom right corner */}
      <CardFooter className="">
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>32</strong> products
        </div>
      </CardFooter>
    </Card>
  );
}
