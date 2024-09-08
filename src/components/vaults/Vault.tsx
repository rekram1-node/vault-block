import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { useMutation } from "~/hooks/useMutation";
import { api, keys, queryClient } from "~/lib/query";
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

type Props = {
  id: string;
  name: string;
  updatedAt: string;
  notionPages?: Page[];
  isNotionPagesLoading: boolean;
};

export function Vault({
  name,
  id,
  updatedAt,
  notionPages,
  isNotionPagesLoading,
}: Props) {
  const url = new URL(window.location.href);
  const link = `${url.origin}/vaults/${id}`;
  const $delete = api.user.vaults[":vaultId"].$delete;

  const mutation = useMutation($delete)({
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
        "Failed to create vault, encountered error: " + error.message,
      );
    },
  });

  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell className="hidden md:table-cell">
        {formatToLocalDateTime(updatedAt)}
      </TableCell>
      {/* <TableCell> */}
      <TableCell className="w-[150px] pr-4 text-right">
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
                mutation.mutate({ param: { vaultId: id } });
              }}
            >
              <div className="pr-2">Delete</div>
              <TrashIcon size={18} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
