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
      
      // Check if this is an OAuth callback with URL fragments
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check for auth tokens in URL (OAuth callback)
      const accessToken = hashParams.get('access_token') || urlParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || urlParams.get('refresh_token');
      
      if (accessToken) {
        // Set the session using the tokens from the URL
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          error = sessionError.message;
        } else if (sessionData.session) {
          // Update the auth stores with the new session
          session.set(sessionData.session);
          user.set(sessionData.session.user);
          console.log('Auth successful:', sessionData.session.user.email);
        }
      } else {
        // No tokens in URL, check for existing session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          session.set(sessionData.session);
          user.set(sessionData.session.user);
          console.log('Existing session found:', sessionData.session.user.email);
        }
      }
      
      // Clean up the URL by removing auth parameters
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
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