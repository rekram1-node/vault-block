import { z } from "zod";

export interface Page {
  id: string;
  url: string;
  name: string;
}

export const PageSchema = z.object({
  id: z.string(),
  url: z.string(),
  name: z.string()
})
