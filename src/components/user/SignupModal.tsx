import React, { useState } from "react";

import { type Page } from "shared/types/Page";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
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

type Props = {
  isOpen: boolean;
  setIsOpen: (_: boolean) => void;
  notionPages: Page[] | undefined;
  isGetNotionPagesLoading: boolean;
};

export function SignupModal({
  isOpen,
  setIsOpen,
  notionPages,
  isGetNotionPagesLoading,
}: Props) {
  const MAX_VAULTS = import.meta.env.VITE_MAX_VAULTS;
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
      if (prev.some((p) => p.id === page.id)) {
        return prev.filter((p) => p.id !== page.id);
      } else if (prev.length < MAX_VAULTS) {
        return [...prev, page];
      } else {
        return prev;
      }
    });
  };

  const handleSubmit = () => {
    mutate({
      json: selectedPages,
    });
    setIsOpen(false);
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-screen-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Welcome to Vault Block</AlertDialogTitle>
            <AlertDialogDescription>
              Thank you for signing up. We're excited to have you on board!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Card className="mt-1">
            <CardHeader>
              <CardTitle>Sync Notion Documents</CardTitle>
              <CardDescription className="pt-2">
                Would you like to sync your Notion documents? Select up to{" "}
                {MAX_VAULTS} documents you'd like to create a Vault for. Once
                created, you can set a password for each Vault. After this
                initialization, the Vault will be visible in Notion!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <div className="p-1">
                  {!isGetNotionPagesLoading &&
                    notionPages?.map((page) => (
                      <div
                        key={page.id}
                        className="mb-2 flex items-center space-x-2"
                      >
                        <Checkbox
                          id={page.id}
                          checked={selectedPages.some((p) => p.id === page.id)}
                          onCheckedChange={() => handleCheckboxChange(page)}
                          disabled={
                            selectedPages.length >= MAX_VAULTS &&
                            !selectedPages.some((p) => p.id === page.id)
                          }
                        />
                        <label
                          htmlFor={page.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {page.name}
                        </label>
                      </div>
                    ))}
                </div>
              </ScrollArea>
              <p className="mt-2 text-sm text-gray-500">
                Selected: {selectedPages.length} / {MAX_VAULTS}
              </p>
            </CardContent>
          </Card>
          <AlertDialogFooter className="mt-4 sm:justify-between">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={selectedPages.length === 0}
            >
              Sync Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
