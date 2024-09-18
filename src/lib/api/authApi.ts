import { api } from "~/lib/api/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "~/hooks/useAuth";

export function useRefreshTokenQuery(
  enabled: boolean,
  refetchInterval: number,
) {
  const { setAccessToken } = useAuth();
  return useQuery({
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryKey: [],
    queryFn: async () => {
      console.log("refresh token query", enabled);
      const res = await api.auth.refresh.$post();
      if (res.ok) {
        const { token } = await res.json();
        setAccessToken(token);
      }
      return null;
    },
    enabled,
    refetchInterval,
    refetchIntervalInBackground: true,
  });
}

export function useRefreshTokenMutation(onSuccess?: () => void) {
  const { setAccessToken } = useAuth();
  const [, navigate] = useLocation();
  return useMutation({
    mutationFn: async (args?: object) => {
      console.log("refresh token mutation");
      const res = await api.auth.refresh.$post(args ?? {});
      if (res.ok) {
        return res.json();
      }
      return null;
    },
    onSuccess: (data) => {
      if (data) {
        setAccessToken(data.token);
        if (onSuccess) onSuccess();
      }
    },
    onError: () => {
      navigate("/auth/sign-in");
    },
  });
}
