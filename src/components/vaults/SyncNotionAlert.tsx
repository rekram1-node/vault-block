import React, { useCallback, useState } from "react";

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
import { SyncNotion } from "../vaults/SyncNotion";

type Props = {
  title?: string;
  description?: string;
  isOpen: boolean;
  setIsOpen: (_: boolean) => void;
  notionPages: Page[] | undefined;
  isGetNotionPagesLoading: boolean;
  numVaults?: number;
};

export function SyncNotionAlert({
  title,
  description,
  isOpen,
  setIsOpen,
  notionPages,
  isGetNotionPagesLoading,
  numVaults,
}: Props) {
  const [isDisabled, setIsDisabled] = useState(true);
  const [callback, setCallback] = useState<() => void>();

  const handleSubmit = useCallback(() => {
    if (callback) {
      callback();
    }
  }, [callback]);

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-screen-md">
          {title && description ? (
            <AlertDialogHeader className="mb-1">
              <AlertDialogTitle className="text-4xl">{title}</AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
          ) : (
            <AlertDialogHeader className="">
              <AlertDialogTitle></AlertDialogTitle>
              <AlertDialogDescription></AlertDialogDescription>
            </AlertDialogHeader>
          )}
          <SyncNotion
            numVaults={numVaults}
            notionPages={notionPages}
            isGetNotionPagesLoading={isGetNotionPagesLoading}
            setHandleSubmit={setCallback}
            setSubmitDisabled={setIsDisabled}
          />
          <AlertDialogFooter className="mt-4 sm:justify-between">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleSubmit();
                setIsOpen(false);
              }}
              disabled={isDisabled}
            >
              Sync Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
