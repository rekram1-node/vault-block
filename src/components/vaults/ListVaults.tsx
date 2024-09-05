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
import { CreateVault } from "./CreateVault";
import { api, keys } from "~/lib/query";
import { VaultSkeleton } from "./VaultSkeleton";
import { type Page } from "functions/src/lib/notion";
import { isErrorResponse } from "shared/types/ErrorResponse";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ListVaults() {
  const { data: vaults, isLoading: isGetVaultsLoading } = useQuery({
    queryKey: keys.vaults,
    queryFn: async () => {
      const res = await api.user.vaults.$get();
      return await res.json();
    },
  });

  const {
    data: notionPages,
    isLoading: isGetNotionPagesLoading,
    error,
    isError,
  } = useQuery({
    queryKey: [],
    queryFn: async () => {
      const res = await api.user.notion.$get();
      if (res.ok) {
        return await res.json();
      } else {
        const d = await res.json();
        if (isErrorResponse(d)) {
          return Promise.reject(d);
        }
      }
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error("Failed to read notion pages:" + error.message);
    }
  }, [error, isError]);

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
          <CreateVault />
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
            {isGetVaultsLoading && (
              <>
                <VaultSkeleton />
                <VaultSkeleton />
                <VaultSkeleton />
              </>
            )}
            {!isGetVaultsLoading &&
              vaults?.map((v, i) => (
                <Vault
                  key={i}
                  name={v.name}
                  id={v.id}
                  updatedAt={v.updatedAt}
                  notionPages={notionPages}
                  isNotionPagesLoading={isGetNotionPagesLoading}
                />
              ))}
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
