<script lang="ts">
	import '../app.css'
	import { onMount, setContext } from 'svelte'
	import { invalidate } from '$app/navigation'
	import { page } from '$app/stores'
	import { createSupabaseLoadClient } from '$lib/supabase-client'
	import { user, session, loading, initializeAuth } from '$lib/auth'
	import type { LayoutData } from './$types'
	
	export let data: LayoutData
	
	// Create supabase client and set context for child components
	const supabase = createSupabaseLoadClient()
	setContext('supabase', supabase)
	
	// Initialize auth state
	onMount(() => {
		initializeAuth()
		
		// Listen for auth changes and invalidate data
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth')
			}
		})
		
		return () => subscription.unsubscribe()
	})
	
	// Reactive updates from server data
	$: if (data.session) {
		session.set(data.session)
		user.set(data.user)
		loading.set(false)
	}
</script>

<main class="min-h-screen bg-background bg-cover bg-center bg-no-repeat bg-fixed bg-[url('/backgrounds/bg-mobile.webp')] md:bg-[url('/backgrounds/bg-desktop.webp')]">
	<slot />
</main>