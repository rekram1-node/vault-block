import { MoreHorizontal } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { type InferRequestType, type InferResponseType } from "hono/client";
import { toast } from "sonner";

import { api, keys, queryClient } from "~/lib/query";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { TableCell, TableRow } from "~/components/ui/table";
import {
  AddIcon,
  CopyIcon,
  OpenInNewWindowIcon,
  TrashIcon,
} from "~/components/icons/Icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ListNotionPages } from "../notion/ListNotionPages";
import { type Page } from "functions/src/lib/notion";

type Props = {
  id: string;
  name: string;
  notionPages?: Page[];
  isNotionPagesLoading: boolean;
};

export function Vault({ name, id, notionPages, isNotionPagesLoading }: Props) {
  const link = `/vaults/${id}`; // TODO: Add proper links
  const $delete = api.user.vaults[":vaultId"].$delete;

  const mutation = useMutation<
    InferResponseType<typeof $delete>,
    Error,
    InferRequestType<typeof $delete>
  >({
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
        2023-07-12 10:42 AM
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
            <Popover>
              <PopoverTrigger asChild>
                <DropdownMenuItem className="flex items-center justify-between">
                  <div className="pr-2">Add to Notion</div>
                  <AddIcon size={18} />
                </DropdownMenuItem>
              </PopoverTrigger>
              <ListNotionPages
                pages={notionPages}
                isLoading={isNotionPagesLoading}
              />
            </Popover>
            {/* <DropdownMenuItem className="flex items-center justify-between">
              <div className="pr-2">Add to Notion</div>
              <AddIcon size={18} />
            </DropdownMenuItem> */}
            <DropdownMenuItem
              className="flex items-center justify-between"
              onClick={() => {
                window.open(link);
              }}
            >
              <div className="pr-2">Open</div>
              <OpenInNewWindowIcon size={18} />
            </DropdownMenuItem>
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
