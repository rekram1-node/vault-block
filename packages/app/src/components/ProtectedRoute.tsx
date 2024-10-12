import React, { useEffect } from "react";
import { authedApi } from "~/lib/api/api";
import { toast } from "sonner";
import { useMutation } from "~/hooks/useMutation";
import { LinearProgress } from "./LinearProgress";
import { useAuthProvider } from "./auth/AuthProviderv2";

export function ProtectedRoute({
  // path,
  children,
}: {
  // path: string;
  children: React.ReactNode;
}) {
  const auth = useAuthProvider();

  const $status = authedApi.auth.status.$get;
  const { mutate } = useMutation($status)({
    mutationKey: [],
    mutationFn: async () => {
      await $status();
      return {};
    },
    onSuccess: () => {
      auth.setSignedIn();
    },
    onError(error, _variables, _context) {
      // this needs to go to error page or something...
      toast.error("Failed to check auth status: " + error.message);
    },
  });

  useEffect(() => {
    if (auth.signedIn) return;
    mutate({});
  }, [auth.signedIn]);

  if (!auth.signedIn) {
    return (
      <div className="min-h-screen">
        <LinearProgress />
      </div>
    );
  }

  return <>{children}</>;
}
