import { type Page } from "shared/types/Page";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useMutation } from "~/hooks/useMutation";
import { api, keys, queryClient } from "~/lib/query";
import { isErrorResponse } from "shared/types/ErrorResponse";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";

export type SetSubmitFunction = (fn: () => void) => void;

type Props = {
  setSubmitDisabled: (_: boolean) => void;
  setHandleSubmit: SetSubmitFunction;
  notionPages: Page[] | undefined;
  isGetNotionPagesLoading: boolean;
  numVaults?: number;
};

export function SyncNotion({
  notionPages,
  isGetNotionPagesLoading,
  setSubmitDisabled,
  setHandleSubmit,
  numVaults,
}: Props) {
  const MAX_VAULTS = import.meta.env.VITE_MAX_VAULTS;
  const allowed = MAX_VAULTS - (numVaults ?? 0);
  const max = MAX_VAULTS + (numVaults ?? 0);
  const [selectedPages, setSelectedPages] = useState<Page[]>([]);
  const $sync = api.user.notion.$post;

  const { mutate } = useMutation($sync)({
    mutationKey: keys.vaults,
    mutationFn: async (args) => {
      const res = await $sync(args);
      if (!res.ok) {
        const error = await res.json();
        if (isErrorResponse(error)) {
          throw new Error(error.error);
        }
      }
      return res;
    },
    onSuccess() {
      void queryClient.invalidateQueries({
        queryKey: keys.vaults,
      });
      toast.success("Successfully synced");
    },
    onError(error, _variables, _context) {
      toast.error(
        "Failed to sync Notion documents, encountered error: " + error.message,
      );
    },
  });

  const handleCheckboxChange = (page: Page) => {
    setSelectedPages((prev) => {
      const isSelected = prev.some((p) => p.id === page.id);

      if (isSelected) {
        return prev.filter((p) => p.id !== page.id);
      } else if (prev.length < MAX_VAULTS) {
        return [...prev, page];
      } else {
        return prev;
      }
    });
  };

  useEffect(() => {
    setHandleSubmit(() => () => {
      mutate({
        json: selectedPages,
      });
    });
  }, [setHandleSubmit, mutate, selectedPages]);

  useEffect(() => {
    if (selectedPages.length === 0) {
      setSubmitDisabled(true);
    } else {
      setSubmitDisabled(false);
    }
  }, [setSubmitDisabled, selectedPages]);

  const hasPages = notionPages !== undefined && notionPages.length > 0;

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Sync Notion Documents</CardTitle>
        <CardDescription className="pt-2">
          Would you like to sync your Notion documents? Select up to {allowed}{" "}
          documents you'd like to create a Vault for. Once created, you can set
          a password for each Vault. After this initialization, the Vault will
          be visible in Notion!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          <div className="p-1">
            {!isGetNotionPagesLoading &&
              hasPages &&
              notionPages.map((page) => (
                <div key={page.id} className="mb-2 flex items-center space-x-2">
                  <Checkbox
                    id={page.id}
                    checked={selectedPages.some((p) => p.id === page.id)}
                    onCheckedChange={() => handleCheckboxChange(page)}
                    disabled={selectedPages.length >= max}
                  />
                  <label
                    htmlFor={page.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {page.name}
                  </label>
                </div>
              ))}
            {!isGetNotionPagesLoading && !hasPages && (
              <p className="text-sm">
                No Notion documents found. Please make sure you have connected
                your Notion account and gave Vault Block access to some pages.
              </p>
            )}
            {isGetNotionPagesLoading && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <p className="mt-2 text-sm text-gray-500">
          Selected: {selectedPages.length} / {allowed}
        </p>
      </CardContent>
    </Card>
  );
}
