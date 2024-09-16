import React, { useEffect, useState } from "react";
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
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Vault } from "./Vault";
import { CreateVault } from "./CreateVault";
import { VaultSkeleton } from "./VaultSkeleton";
import { type Page } from "shared/types/Page";
import { SyncNotionButton } from "./SyncNotionButton";
import { SyncNotionAlert } from "./SyncNotionAlert";
import { useReadAllVaultsQuery } from "~/lib/api/userApi";

type Props = {
  notionPages: Page[] | undefined;
  isGetNotionPagesLoading: boolean;
};

export default function ListVaults({
  notionPages,
  isGetNotionPagesLoading,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const vaultsPerPage = 5;

  const { data: vaults, isLoading: isGetVaultsLoading } =
    useReadAllVaultsQuery();

  const numVaults = vaults?.length ?? 0;
  const totalPages = Math.ceil(numVaults / vaultsPerPage);

  useEffect(() => {
    if (currentPage >= totalPages && currentPage > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [vaults, currentPage, totalPages]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const paginatedVaults =
    vaults !== undefined
      ? vaults?.slice(
          currentPage * vaultsPerPage,
          (currentPage + 1) * vaultsPerPage,
        )
      : [];

  const creationDisabled = numVaults >= import.meta.env.VITE_MAX_VAULTS;

  return (
    <>
      <SyncNotionAlert
        numVaults={numVaults}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        notionPages={notionPages}
        isGetNotionPagesLoading={isGetNotionPagesLoading}
      />
      <Card className="relative h-auto max-h-[80vh] w-2/3 overflow-y-auto p-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="pb-1">Your Vaults</CardTitle>
              <CardDescription>
                Manage your vaults and view their content.
              </CardDescription>
            </div>
            <CreateVault disabled={creationDisabled} />
          </div>
        </CardHeader>
        <CardContent>
          {(isGetVaultsLoading || numVaults > 0) && (
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
                  paginatedVaults?.map((v) => (
                    <Vault
                      key={v.id}
                      name={v.name}
                      id={v.id}
                      updatedAt={v.updatedAt}
                      initialized={v.initialized}
                      notionPages={notionPages}
                      isNotionPagesLoading={isGetNotionPagesLoading}
                    />
                  ))}
              </TableBody>
            </Table>
          )}
          {!isGetVaultsLoading && numVaults == 0 && (
            <div className="inset-0 mt-10 flex items-center justify-center pt-10">
              <div className="text-center">
                <p className="text-lg font-semibold">
                  Create your first Vault!
                </p>
                <p className="text-md text-muted-foreground">
                  You don't have any vaults yet. Start by creating a new one.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="absolute bottom-0 left-0">
          <SyncNotionButton disabled={false} onClick={() => setIsOpen(true)} />
        </CardFooter>
        {totalPages > 1 && (
          <CardFooter className="absolute bottom-0 right-0">
            <div className="pr-4 text-xs text-muted-foreground">
              Showing{" "}
              <strong>
                {numVaults === 0 ? 0 : currentPage * vaultsPerPage + 1}-
                {Math.min((currentPage + 1) * vaultsPerPage, numVaults)}
              </strong>{" "}
              of <strong>{numVaults}</strong> vaults
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </>
  );
}
