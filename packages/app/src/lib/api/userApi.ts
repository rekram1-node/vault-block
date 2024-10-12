import { authedApi, keys } from "~/lib/api/api";
import { useQuery } from "@tanstack/react-query";

export function useReadAllVaultsQuery() {
  return useQuery({
    queryKey: keys.vaults,
    queryFn: async () => {
      const res = await authedApi.user.vaults.$get();
      return res.json();
    },
  });
}

export function useNotionPagesQuery() {
  return useQuery({
    queryKey: keys.notion,
    queryFn: async () => {
      const res = await authedApi.user.notion.$get();
      return res.json();
    },
  });
}
