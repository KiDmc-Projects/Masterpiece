import { createSupabaseLoadClient } from "./supabase-client";
import type { Provider } from "@supabase/supabase-js";

const supabase = createSupabaseLoadClient();

export type AuthProvider = "google" | "github" | "twitter";

export const authService = {
  // Sign in with OAuth provider
  async signInWithProvider(provider: AuthProvider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(`Error signing in with ${provider}:`, error);
      throw error;
    }

    return data;
  },

  // Sign in with email and password
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in with email:", error);
      throw error;
    }

    return data;
  },

  // Sign up with email and password
  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error signing up with email:", error);
      throw error;
    }

    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  // Get current session
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      return null;
    }

    return session;
  },

  // Get current user
  async getUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error);
      return null;
    }

    return user;
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      console.error("Error resetting password:", error);
      throw error;
    }

    return data;
  },

  // Update password
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error("Error updating password:", error);
      throw error;
    }

    return data;
  },
};

// Auth state store
import { writable } from "svelte/store";
import type { User, Session } from "@supabase/supabase-js";

export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const loading = writable(true);

// Initialize auth state
export function initializeAuth() {
  // Get initial session
  authService.getSession().then((initialSession) => {
    session.set(initialSession);
    user.set(initialSession?.user ?? null);
    loading.set(false);
  });

  // Listen for auth changes
  authService.onAuthStateChange((event, newSession) => {
    session.set(newSession);
    user.set(newSession?.user ?? null);
    loading.set(false);
  });
}
