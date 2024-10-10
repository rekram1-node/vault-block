import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { SyncNotionAlert } from "~/components/vaults/SyncNotionAlert";
import ListVaults from "~/components/vaults/ListVaults";
import { useNotionPagesQuery } from "~/lib/api/userApi";
import { useAuthProvider } from "~/components/auth/AuthProviderv2";

export function Home() {
  const authProvider = useAuthProvider();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (authProvider.newSignup) {
      setIsOpen(true);
    }
  }, [authProvider.newSignup]);

  const {
    data: notionPages,
    isLoading: isGetNotionPagesLoading,
    error,
    isError,
  } = useNotionPagesQuery();

  useEffect(() => {
    if (isError) {
      toast.error("Failed to read notion pages: " + error.message);
    }
  }, [error, isError]);

  return (
    <>
      <SyncNotionAlert
        title="Welcome to Vault Block"
        description="Thank you for signing up. We're excited to have you on board!"
        isOpen={isOpen}
        setIsOpen={(value: boolean) => {
          // once they close the modal, set as false
          authProvider.setNewSignup(false);
          setIsOpen(value);
        }}
        notionPages={notionPages}
        isGetNotionPagesLoading={isGetNotionPagesLoading}
      />

      <div className="flex h-full w-full justify-center pt-2">
        <ListVaults
          notionPages={notionPages}
          isGetNotionPagesLoading={isGetNotionPagesLoading}
        />
      </div>
    </>
  );
}
