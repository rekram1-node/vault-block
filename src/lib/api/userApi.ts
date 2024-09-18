import { oauthApi, keys } from "~/lib/api/api";
import { useQuery } from "@tanstack/react-query";

export function useReadAllVaultsQuery() {
  return useQuery({
    queryKey: keys.vaults,
    queryFn: async () => {
      const res = await oauthApi.user.vaults.$get();
      return res.json();
    },
  });
}

export function useNotionPagesQuery() {
  return useQuery({
    queryKey: keys.notion,
    queryFn: async () => {
      const res = await oauthApi.user.notion.$get();
      return res.json();
    },
  });
}
