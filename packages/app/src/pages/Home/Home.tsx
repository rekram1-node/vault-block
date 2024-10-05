import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { SyncNotionAlert } from "~/components/vaults/SyncNotionAlert";
import ListVaults from "~/components/vaults/ListVaults";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/lib/query";
import { isErrorResponse } from "shared/types/ErrorResponse";

export function Home() {
  const { newSignup } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (newSignup) {
      setIsOpen(true);
    }
  }, [newSignup]);

  const {
    data: notionPages,
    isLoading: isGetNotionPagesLoading,
    error,
    isError,
  } = useQuery({
    queryKey: [],
    queryFn: async () => {
      const res = await api.user.notion.$get();
      if (res.ok) {
        return await res.json();
      } else {
        const d = await res.json();
        if (isErrorResponse(d)) {
          return Promise.reject(d);
        }
      }
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error("Failed to read notion pages:" + error.message);
    }
  }, [error, isError]);

  return (
    <>
      <SyncNotionAlert
        title="Welcome to Vault Block"
        description="Thank you for signing up. We're excited to have you on board!"
        isOpen={isOpen}
        setIsOpen={setIsOpen}
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
