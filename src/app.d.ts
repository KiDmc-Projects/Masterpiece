// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import { SupabaseClient, Session, User } from "@supabase/supabase-js";
import type { Database } from "./lib/database.types";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      safeGetSession(): Promise<{ session: Session | null; user: User | null }>;
      session: Session | null;
      user: User | null;
    }
    interface PageData {
      session: Session | null;
      user: User | null;
    }
    // interface Error {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
