/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_TWITTER_BEARER_TOKEN?: string;
    readonly [key: string]: string | undefined;
  };
}
