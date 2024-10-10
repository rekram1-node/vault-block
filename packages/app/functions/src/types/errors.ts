import { HTTPException } from "hono/http-exception";

export const Unauthorized = new HTTPException(401, { message: "Unauthorized" });
