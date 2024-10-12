import React, { useEffect, useState } from "react";
import { useParams } from "wouter";
import { type JSONContent } from "novel";
import { LockIcon } from "lucide-react";
import { toast } from "sonner";
import { createPatch } from "rfc6902";

import { PasswordForm } from "~/components/vaults/PasswordForm";
import Editor from "~/components/novel/Editor";
import { usePublicVault } from "~/hooks/usePublicVault";
// import { ThemeToggle } from "~/components/novel/ThemeToggle";
import { Button } from "~/components/ui/button";
import { decryptTextBlocks, encryptOperationArray } from "~/lib/workerPool";
import { useMutation } from "~/hooks/useMutation";
import { publicApi } from "~/lib/api/api";
import { isErrorResponse } from "shared/types/ErrorResponse";

// TODO: add auto lock after inactivity (30 min?)

export function VaultPage() {
  const { encryptedContent, stretchedMasterKey, iv, name, clear } =
    usePublicVault();
  const { id } = useParams();
  const [isLocked, setIsLocked] = useState(true);
  const [decrypted, setDecrypted] = useState<JSONContent | undefined>();

  const $update = publicApi.vaults[":vaultId"].content.$post;
  const { mutate } = useMutation($update)({
    mutationFn: async (args) => {
      const res = await $update(args);
      if (!res.ok) {
        const error = await res.json();
        if (isErrorResponse(error)) {
          throw new Error(error.error);
        }
      }

      return res;
    },
    onError(error, variables, context) {
      console.error(error, variables, context);
      toast.error("Failed to save vault, encountered error: " + error.message);
    },
  });

  useEffect(() => {
    if (isLocked || !encryptedContent || !iv || !stretchedMasterKey) {
      setDecrypted(undefined);
      return;
    }
    const decrypt = async () => {
      const decryptedBlocks = await decryptTextBlocks(
        encryptedContent,
        iv,
        stretchedMasterKey,
        10,
      );
      setDecrypted(decryptedBlocks);
    };
    void decrypt();
  }, [isLocked, encryptedContent, iv, stretchedMasterKey]);

  const autoSave = async (editorJson: JSONContent) => {
    if (!id) return;

    if (!iv || !stretchedMasterKey) {
      const error = "reached invalid application state";
      console.error(error);
      toast.error(error);
      return;
    }

    let patches = createPatch(decrypted, editorJson);
    patches = await encryptOperationArray(patches, iv, stretchedMasterKey, 10);

    mutate({ param: { vaultId: id }, json: patches });

    if (!isLocked) {
      // Want to make sure there isn't any data corruption
      // if say a user signs in, edits, then signs out and back in again
      // This could otherwise lead to a late decryption set due to debounce
      setDecrypted(editorJson);
    }
  };

  return (
    <>
      {isLocked && (
        <div className="flex min-h-screen items-center justify-center">
          <PasswordForm vaultId={id!} setIsLocked={setIsLocked} />
        </div>
      )}
      {!isLocked && (
        <div className="absolute left-0 top-0 flex h-full w-full flex-col p-6 pb-10">
          <div className="mb-6 flex w-full items-center justify-between">
            <h1 className="text-xl font-bold">{name}</h1>
            <div className="flex items-center space-x-2">
              {/* <ThemeToggle /> */}
              <Button
                variant="secondary"
                size="icon"
                title="Toggle Theme"
                className="overflow-hidden rounded-full bg-transparent"
                onClick={() => {
                  setIsLocked(true);
                  clear();
                  setDecrypted(undefined);
                }}
              >
                <LockIcon className="h-6 cursor-pointer transition-colors hover:text-muted" />
              </Button>
            </div>
          </div>
          {decrypted !== undefined && (
            <div className="flex-grow pb-10">
              <Editor initialValue={decrypted} onChange={autoSave} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
