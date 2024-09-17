import { api } from "~/lib/api/api";

// async function getNotionPages() {
//     const res = await api.user.notion.$get();
//     if (!res.ok) {
//       throw new Error(JSON.stringify(await res.json()));
//     }
//     return res.json();
//   }

//   export const notionPagesQuery = queryOptions({
//     queryKey: keys.notion,
//     queryFn: getNotionPages,
//   });

async function newToken() {
  //   const res = await api.auth.url.$get();
  const res = await api.auth.token.$post();
  if (!res.ok) {
    // throw
  }
  const data = await res.json();
  //   res.json()
}
