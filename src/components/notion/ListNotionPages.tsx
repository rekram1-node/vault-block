import { toast } from "sonner";
import { useState } from "react";

import { useMutation } from "~/hooks/useMutation";
import { api } from "~/lib/query";
import { type Page } from "shared/types/Page";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";
import { AddIcon } from "~/components/icons/Icons";
import { LoadingSpinner } from "../Loading";

function NotionPage({ page, vaultId }: { page: Page; vaultId: string }) {
  const [isClickable, setIsClickable] = useState(true);
  const $addToNotion = api.user.notion[":vaultId"][":pageId"].$post;

  const { mutate, isPending } = useMutation($addToNotion)({
    mutationKey: [],
    mutationFn: async (args) => {
      await $addToNotion(args);
      return {};
    },
    onSuccess: () => {
      toast.info(`Added vault to ${page.name}`);
    },
    onError(error, _variables, _context) {
      toast.error(
        "Failed to add vault to Notion, encountered error: " + error.message,
      );
    },
  });

  const handleItemClick = (e: React.MouseEvent, page: Page) => {
    e.preventDefault();
    e.stopPropagation(); // Stop the event from closing the dropdown
    if (!isClickable) return;
    setIsClickable(false);
    void mutate({
      param: {
        vaultId,
        pageId: page.id,
      },
    });
  };

  return (
    <DropdownMenuItem className="w-full p-0" key={page.id}>
      <span
        className={`flex w-full items-center justify-between px-2 py-2 ${
          isClickable ? "cursor-pointer" : "cursor-not-allowed"
        }`}
        onClick={(e) => handleItemClick(e, page)}
      >
        <span
          className={`${!isClickable ? "text-muted-foreground opacity-80" : "text-foreground"}`}
        >
          {page.name}
        </span>
        {!isPending && isClickable && <AddIcon />}
        {isPending && <LoadingSpinner />}
      </span>
    </DropdownMenuItem>
  );
}

type Props = {
  vaultId: string;
  pages?: Page[];
  isLoading: boolean;
};

export function ListNotionPages({ pages, isLoading, vaultId }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const numPages = pages?.length ?? 0;
  const itemsToDisplay = isExpanded ? pages : pages?.slice(0, 3);

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop the event from closing the dropdown
    setIsExpanded(true);
  };

  return (
    <DropdownMenuPortal>
      <DropdownMenuSubContent
        className={`${
          isExpanded ? "max-h-40 overflow-y-auto" : "max-h-auto"
        } transition-all duration-300 ease-in-out`}
      >
        <DropdownMenuLabel>Your Notion Pages:</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <DropdownMenuItem className="w-full py-1" key={index}>
                <Skeleton className="h-4 w-full rounded" />
              </DropdownMenuItem>
            ))
          : itemsToDisplay?.map((page) => (
              <NotionPage page={page} vaultId={vaultId} key={page.id} />
            ))}

        {!isExpanded && numPages > 3 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleMoreClick} className="w-full p-0">
              <span className="block w-full px-2 py-2">More...</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuPortal>
  );
}
