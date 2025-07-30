<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user, session, loading as authLoading, initializeAuth } from '$lib/auth';
	import { getUserQuizHistory, supabase, testQuizHistoryTable } from '$lib/supabase';
	import { trackPageView } from '$lib/analytics';

	// Quiz history data
	let quizHistory = [];
	let loading = true;
	let error = null;

	// Avatar loading state
	let avatarLoadError = false;

	onMount(async () => {
		// Initialize auth
		initializeAuth();
		
		// Track page view
		trackPageView('history', 'ru');
		
		// Test if quiz_attempts table exists
		const tableExists = await testQuizHistoryTable();
		console.log('Quiz attempts table exists:', tableExists);
		
		// Load quiz history when user is available
		const unsubscribe = user.subscribe(async (currentUser) => {
			if (currentUser) {
				await loadQuizHistory(currentUser.id);
			} else if (!$authLoading) {
				// Redirect to main page if not authenticated
				goto('/');
			}
		});

		return unsubscribe;
	});

	async function loadQuizHistory(userId) {
		try {
			loading = true;
			quizHistory = await getUserQuizHistory(userId);
		} catch (err) {
			console.error('Error loading quiz history:', err);
			error = 'Failed to load quiz history';
		} finally {
			loading = false;
		}
	}

	function getGrade(percentage) {
		if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
		if (percentage >= 80) return { grade: 'A', color: 'text-green-600' };
		if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600' };
		if (percentage >= 60) return { grade: 'B', color: 'text-blue-600' };
		if (percentage >= 50) return { grade: 'C+', color: 'text-yellow-600' };
		if (percentage >= 40) return { grade: 'C', color: 'text-yellow-600' };
		if (percentage >= 30) return { grade: 'D+', color: 'text-orange-600' };
		if (percentage >= 20) return { grade: 'D', color: 'text-orange-600' };
		return { grade: 'F', color: 'text-red-600' };
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-IL', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
			timeZone: 'Asia/Jerusalem'
		});
	}

	function capitalizeLevel(level) {
		return level.charAt(0).toUpperCase() + level.slice(1);
	}

	async function handleLogout() {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			goto('/');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	}
</script>

<svelte:head>
	<title>Quiz History - Guess the Masterpiece</title>
</svelte:head>

<div class="min-h-screen p-4 relative overflow-hidden">
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<div class="mb-8 relative">
			<!-- User Profile Button - Top Right -->
			<div class="absolute -top-4 right-0">
				{#if !$authLoading && $user}
					<div class="relative group">
						<button 
							class="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full border border-white/30 shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-white/20 hover:scale-105"
							aria-label="User Profile"
						>
							{#if $user.user_metadata?.avatar_url && !avatarLoadError}
								<img 
									src={$user.user_metadata.avatar_url} 
									alt="User Avatar"
									class="w-7 h-7 rounded-full"
									on:error={() => avatarLoadError = true}
								/>
							{:else}
								<!-- Custom logged-in user icon -->
								<svg class="w-5 h-5 text-text-primary" fill="currentColor" viewBox="0 0 472.615 472.615">
									<circle cx="236.308" cy="117.504" r="111.537"/>
									<path d="M369,246.306c-1.759-1.195-5.297-3.493-5.297-3.493c-28.511,39.583-74.993,65.402-127.395,65.402c-52.407,0-98.894-25.825-127.404-65.416c0,0-2.974,1.947-4.451,2.942C41.444,288.182,0,360.187,0,441.87v24.779h472.615V441.87C472.615,360.549,431.538,288.822,369,246.306z"/>
								</svg>
							{/if}
						</button>
						
						<!-- User Dropdown Menu -->
						<div class="absolute top-12 right-0 w-48 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/30 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10">
							<div class="px-4 py-2 border-b border-gray-200/50">
								<p class="text-sm font-medium text-text-primary truncate">
									{$user.email || 'Anonymous User'}
								</p>
							</div>
							<button 
								class="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-100/50 transition-colors duration-200"
								on:click={() => goto('/')}
							>
								🏠 Home
							</button>
							<button 
								class="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-100/50 transition-colors duration-200"
								on:click={handleLogout}
							>
								🚪 Sign Out
							</button>
						</div>
					</div>
				{/if}
			</div>
			
			<h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-4">
				Quiz History 📊
			</h1>
			<p class="text-lg text-text-secondary mb-6">
				Track your progress and see how you've improved over time
			</p>
		</div>

		<!-- Content -->
		<div class="bg-white/85 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl">
			{#if $authLoading || loading}
				<!-- Loading State -->
				<div class="p-12 text-center">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto mb-4"></div>
					<p class="text-text-secondary">Loading your quiz history...</p>
				</div>
			{:else if error}
				<!-- Error State -->
				<div class="p-12 text-center">
					<div class="text-red-500 text-6xl mb-4">⚠️</div>
					<h3 class="text-xl font-bold text-text-primary mb-2">Unable to Load History</h3>
					<p class="text-text-secondary mb-4">{error}</p>
					<button 
						class="px-6 py-2 bg-primary-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200"
						on:click={() => loadQuizHistory($user.id)}
					>
						Try Again
					</button>
				</div>
			{:else if quizHistory.length === 0}
				<!-- Empty State -->
				<div class="p-12 text-center">
					<div class="text-gray-400 text-6xl mb-4">📊</div>
					<h3 class="text-xl font-bold text-text-primary mb-2">No Quiz History Yet</h3>
					<p class="text-text-secondary mb-6">Start taking quizzes to see your progress here!</p>
					<button 
						class="px-6 py-2 bg-primary-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200"
						on:click={() => goto('/')}
					>
						Take Your First Quiz
					</button>
				</div>
			{:else}
				<!-- Quiz History Table -->
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50/50 border-b border-gray-200/50">
							<tr>
								<th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
								<th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
								<th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
								<th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
								<th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
								<th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200/50">
							{#each quizHistory as attempt}
								{@const percentage = Math.round((attempt.score / attempt.total_questions) * 100)}
								{@const gradeInfo = getGrade(percentage)}
								<tr class="hover:bg-gray-50/30 transition-colors duration-200">
									<td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
										{formatDate(attempt.created_at)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
											{capitalizeLevel(attempt.level)}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-medium">
										{attempt.score}/{attempt.total_questions}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm font-bold {gradeInfo.color}">
										{gradeInfo.grade}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
										{percentage}%
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
										{attempt.duration ? `${Math.round(attempt.duration / 60)}m ${attempt.duration % 60}s` : 'N/A'}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Summary Stats -->
				<div class="border-t border-gray-200/50 p-6">
					<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div class="text-center">
							<div class="text-2xl font-bold text-text-primary">{quizHistory.length}</div>
							<div class="text-sm text-text-secondary">Total Quizzes</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-text-primary">
								{Math.round(quizHistory.reduce((acc, attempt) => acc + (attempt.score / attempt.total_questions) * 100, 0) / quizHistory.length)}%
							</div>
							<div class="text-sm text-text-secondary">Average Score</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-text-primary">
								{Math.max(...quizHistory.map(attempt => Math.round((attempt.score / attempt.total_questions) * 100)))}%
							</div>
							<div class="text-sm text-text-secondary">Best Score</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-text-primary">
								{quizHistory.filter(attempt => (attempt.score / attempt.total_questions) * 100 >= 70).length}
							</div>
							<div class="text-sm text-text-secondary">Quizzes Passed</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Back to Home Button -->
		<div class="mt-8 text-center">
			<button 
				class="px-8 py-3 bg-primary-orange text-white rounded-xl font-medium hover:bg-orange-600 transition-all duration-200 hover:scale-105 shadow-lg"
				on:click={() => goto('/')}
			>
				← Back to Home
			</button>
		</div>
	</div>
</div>

<style>
	.transition-all {
		transition-property: all;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 200ms;
	}
</style>