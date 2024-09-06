import { useState } from "react";
import { useParams } from "wouter";
import { PasswordForm } from "~/components/vaults/PasswordForm";
import Editor from "~/components/novel/Editor";
import { usePublicVault } from "~/hooks/usePublicVault";

export function VaultPage() {
  const { encryptedContent } = usePublicVault();
  const { id } = useParams();
  const [isLocked, setIsLocked] = useState(true);

  return (
    <>
      {isLocked && (
        <div className="flex min-h-screen items-center justify-center">
          <PasswordForm vaultId={id!} setIsLocked={setIsLocked} />
        </div>
      )}
      {!isLocked && <div>{encryptedContent}</div>}
    </>
  );
}
