// import { clerkClient } from "@clerk/backend";
// import { type Result, ok, error } from "functions/src/types/result";

// const provider = "oauth_notion";

// export const readToken = async (userId: string): Promise<Result<string>> => {
//   try {
//     const { data, totalCount } =
//       await clerkClient().users.getUserOauthAccessToken(userId, provider);

//     if (totalCount === 0 || data.length === 0) {
//       return error(new Error("failed to read token, empty response"));
//     }

//     const oauth = data[0];
//     if (!oauth?.token) {
//       return error(
//         new Error(`response doesn't contain token: ${JSON.stringify(oauth)}`),
//       );
//     }
//     return ok(oauth.token);
//   } catch (e) {
//     return error(new Error(String(e)));
//   }
// };
