import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { useMutation } from "~/hooks/useMutation";
import { oauthApi, keys, queryClient } from "~/lib/api/api";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { TableCell, TableRow } from "~/components/ui/table";
import {
  CopyIcon,
  OpenInNewWindowIcon,
  TrashIcon,
} from "~/components/icons/Icons";
import { ListNotionPages } from "../notion/ListNotionPages";
import { type Page } from "shared/types/Page";
import { formatToLocalDateTime } from "shared/lib/time";
import { useState } from "react";
import { InitializeVault } from "./InitializeVault";
import React from "react";

type Props = {
  id: string;
  name: string;
  updatedAt: string;
  initialized: boolean;
  notionPages?: Page[];
  isNotionPagesLoading: boolean;
};

export function Vault({
  name,
  id,
  updatedAt,
  initialized,
  notionPages,
  isNotionPagesLoading,
}: Props) {
  const [open, setOpen] = useState(false);

  const url = new URL(window.location.href);
  const link = `${url.origin}/vaults/${id}`;
  const $delete = oauthApi.user.vaults[":vaultId"].$delete;

  const { mutate: deleteVault } = useMutation($delete)({
    mutationKey: keys.vaults,
    mutationFn: async (args) => {
      await $delete(args);
      return {};
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: keys.vaults,
      });
      toast.info("Successfully deleted vault");
    },
    onError(error, _variables, _context) {
      toast.error(
        "Failed to delete vault, encountered error: " + error.message,
      );
    },
  });

  const handleInitialize = () => {
    setOpen(true);
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell className="hidden md:table-cell">
        {formatToLocalDateTime(updatedAt)}
      </TableCell>
      <TableCell className="w-[100px] pr-4 text-right">
        {initialized ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="flex items-center justify-between"
                  onClick={async () => {
                    await navigator.clipboard.writeText(link);
                    toast.info("Vault link has been copied to clipboard");
                  }}
                >
                  <div className="pr-2">Copy Link</div>
                  <CopyIcon size={18} />
                </DropdownMenuItem>
                {notionPages?.length !== 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <div className="pr-2">Add to Notion</div>
                    </DropdownMenuSubTrigger>
                    <ListNotionPages
                      pages={notionPages}
                      isLoading={isNotionPagesLoading}
                      vaultId={id}
                    />
                  </DropdownMenuSub>
                )}

                <DropdownMenuItem
                  className="flex items-center justify-between"
                  onClick={() => {
                    window.open(link);
                  }}
                >
                  <div className="pr-2">Open</div>
                  <OpenInNewWindowIcon size={18} />
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center justify-between bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  deleteVault({ param: { vaultId: id } });
                }}
              >
                <div className="pr-2">Delete</div>
                <TrashIcon size={18} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button
              variant="white"
              onClick={handleInitialize}
              size="sm"
              className="px-2 py-1 text-sm"
            >
              Initialize
            </Button>
            <InitializeVault vaultId={id} open={open} setOpen={setOpen} />
          </>
        )}
      </TableCell>
    </TableRow>
  );
}
