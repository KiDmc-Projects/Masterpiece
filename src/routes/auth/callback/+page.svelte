<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { createSupabaseLoadClient } from '$lib/supabase-client';
  import { user, session } from '$lib/auth';

  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      const supabase = createSupabaseLoadClient();
      
      // Handle the auth callback from the URL
      const { data, error: authError } = await supabase.auth.getSessionFromUrl();
      
      if (authError) {
        console.error('Auth callback error:', authError);
        error = authError.message;
        
        // Still try to get existing session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          session.set(sessionData.session);
          user.set(sessionData.session.user);
        }
      } else if (data.session) {
        // Update the auth stores with the new session
        session.set(data.session);
        user.set(data.session.user);
        console.log('Auth successful:', data.session.user.email);
      } else {
        // Check if there's an existing session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          session.set(sessionData.session);
          user.set(sessionData.session.user);
        }
      }
      
      // Always redirect to home after handling auth
      setTimeout(() => {
        goto('/', { replaceState: true });
      }, 1500);
      
    } catch (err) {
      console.error('Callback handling error:', err);
      error = 'Authentication failed';
      setTimeout(() => {
        goto('/', { replaceState: true });
      }, 3000);
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen bg-background bg-cover bg-center bg-no-repeat bg-fixed bg-[url('/backgrounds/bg-mobile.webp')] md:bg-[url('/backgrounds/bg-desktop.webp')] flex items-center justify-center">
  <div class="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-8 max-w-md w-full mx-4">
    {#if loading}
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold text-text-primary mb-2">Completing Authentication...</h2>
        <p class="text-text-secondary">Please wait while we log you in.</p>
      </div>
    {:else if error}
      <div class="text-center">
        <div class="text-red-500 text-4xl mb-4">❌</div>
        <h2 class="text-xl font-semibold text-text-primary mb-2">Authentication Error</h2>
        <p class="text-text-secondary mb-4">{error}</p>
        <p class="text-sm text-text-secondary">Redirecting to home page...</p>
      </div>
    {:else}
      <div class="text-center">
        <div class="text-green-500 text-4xl mb-4">✅</div>
        <h2 class="text-xl font-semibold text-text-primary mb-2">Authentication Successful!</h2>
        <p class="text-text-secondary">Redirecting you to the home page...</p>
      </div>
    {/if}
  </div>
</div>