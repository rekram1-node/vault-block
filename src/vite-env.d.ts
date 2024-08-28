/// <reference types="vite/client" />
interface ImportMetaEnv {
  [key: string]: object;
  VITE_CLERK_PUBLISHABLE_KEY: string;
  NOTION_CLIENT_ID: string;
}
