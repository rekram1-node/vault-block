import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { type JSONContent } from "novel";
import { LockIcon } from "lucide-react";

import { PasswordForm } from "~/components/vaults/PasswordForm";
import Editor from "~/components/novel/Editor";
import { usePublicVault } from "~/hooks/usePublicVault";
import { decryptData, encryptData } from "~/lib/encryption/encryption";
import { ThemeToggle } from "~/components/novel/ThemeToggle";
import { Button } from "~/components/ui/button";
import { createPatch } from "rfc6902";

export function VaultPage() {
  const { encryptedContent, stretchedMasterKey, iv, name, clear } =
    usePublicVault();
  const { id } = useParams();
  const [isLocked, setIsLocked] = useState(true);
  const [decrypted, setDecrypted] = useState<JSONContent | undefined>();

  useEffect(() => {
    if (isLocked || !encryptedContent || !iv || !stretchedMasterKey) return;
    const decrypt = async () => {
      const content = await decryptData(
        encryptedContent,
        iv,
        stretchedMasterKey,
      );
      setDecrypted(JSON.parse(content) as JSONContent);
    };
    void decrypt();
  }, [isLocked, encryptedContent]);

  const autoSave = async (editorJson: JSONContent) => {
    console.log(createPatch(decrypted, editorJson));
    // console.log(editorJson);
    if (!iv || !stretchedMasterKey) {
      console.error("reached invalid application state");
      return;
    }
    const encrypted = await encryptData(
      JSON.stringify(editorJson),
      iv,
      stretchedMasterKey,
    );
    // console.log(encrypted);
  };

  // TODO: delete prose and just use globals.css
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
              <ThemeToggle />
              <Button
                variant="secondary"
                size="icon"
                title="Toggle Theme"
                className="overflow-hidden rounded-full bg-transparent"
              >
                <LockIcon
                  className="h-6 cursor-pointer transition-colors hover:text-muted"
                  onClick={() => {
                    setIsLocked(true);
                    clear();
                  }}
                />
              </Button>
            </div>
          </div>
          <div className="flex-grow pb-10">
            {/* was descrypted */}
            <Editor initialValue={decrypted} onChange={autoSave} />
          </div>
        </div>
      )}
    </>
  );
}
