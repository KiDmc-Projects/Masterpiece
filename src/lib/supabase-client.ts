import {
  createBrowserClient,
  createServerClient,
  isBrowser,
} from "@supabase/ssr";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "$env/static/public";
import type { Database } from "./database.types";

export const createSupabaseLoadClient = () => {
  return createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
  );
};

export const createSupabaseServerClient = (fetch: typeof globalThis.fetch) => {
  return createServerClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch,
      },
      cookies: {
        get(key) {
          // In SvelteKit, we can't access cookies directly in this context
          // This will be handled by the hooks
          return undefined;
        },
        set(key, value, options) {
          // This will be handled by the hooks
        },
        remove(key, options) {
          // This will be handled by the hooks
        },
      },
    },
  );
};
