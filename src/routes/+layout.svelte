<script lang="ts">
	import '../app.css'
	import { onMount, setContext } from 'svelte'
	import { invalidate } from '$app/navigation'
	import { page } from '$app/stores'
	import { createSupabaseLoadClient } from '$lib/supabase-client'
	import { user, session, loading, initializeAuth } from '$lib/auth'
	// No server data needed for static site
	
	// Create supabase client and set context for child components
	const supabase = createSupabaseLoadClient()
	setContext('supabase', supabase)
	
	// Initialize auth state for static site
	onMount(() => {
		initializeAuth()
		loading.set(false)
		
		// Listen for auth changes (client-side only)
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				// For static site, just update client state
				session.set(_session)
				user.set(_session?.user || null)
			}
		})
		
		return () => subscription.unsubscribe()
	})
</script>

<main class="min-h-screen bg-background bg-cover bg-center bg-no-repeat bg-fixed bg-[url('/backgrounds/bg-mobile.webp')] md:bg-[url('/backgrounds/bg-desktop.webp')]">
	<slot />
</main>