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
	let showUserDropdown = false;
	
	// Check if user came from results page
	let cameFromResults = false;

	// Pagination state
	let currentPage = 1;
	let itemsPerPage = 25;
	let totalItems = 0;
	let totalPages = 0;
	let paginatedHistory = [];

	onMount(async () => {
		// Initialize auth
		initializeAuth();
		
		// Check if user came from results page
		if (typeof window !== 'undefined') {
			cameFromResults = document.referrer.includes('/results') || 
			                 sessionStorage.getItem('fromResults') === 'true';
			// Clear the flag after checking
			sessionStorage.removeItem('fromResults');
		}
		
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
			updatePagination();
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
			timeZone: 'Asia/Jerusalem'
		});
	}

	function capitalizeLevel(level) {
		return level.charAt(0).toUpperCase() + level.slice(1);
	}

	function getLevelColor(level) {
		switch (level.toLowerCase()) {
			case 'neophyte':
				return { bg: 'bg-green-500', text: 'text-white' };
			case 'artisan':
				return { bg: 'bg-teal-500', text: 'text-white' };
			case 'master':
				return { bg: 'bg-purple-500', text: 'text-white' };
			case 'mix':
				return { bg: 'bg-primary-orange', text: 'text-white' };
			default:
				return { bg: 'bg-blue-100', text: 'text-blue-800' };
		}
	}

	function calculateLevelStats(history, level) {
		const levelAttempts = history.filter(attempt => attempt.level.toLowerCase() === level.toLowerCase());
		
		if (levelAttempts.length === 0) {
			return {
				totalQuizzes: 0,
				averageScore: 0,
				bestScore: 0,
				quizzesPassed: 0
			};
		}

		const scores = levelAttempts.map(attempt => Math.round((attempt.score / attempt.total_questions) * 100));
		const averageScore = Math.round(levelAttempts.reduce((acc, attempt) => acc + (attempt.score / attempt.total_questions) * 100, 0) / levelAttempts.length);
		const bestScore = Math.max(...scores);
		const quizzesPassed = levelAttempts.filter(attempt => (attempt.score / attempt.total_questions) * 100 >= 70).length;

		return {
			totalQuizzes: levelAttempts.length,
			averageScore,
			bestScore,
			quizzesPassed
		};
	}

	function getAvailableLevels(history) {
		const levels = [...new Set(history.map(attempt => attempt.level))];
		return levels.sort((a, b) => {
			const order = { neophyte: 1, artisan: 2, master: 3, mix: 4 };
			return (order[a.toLowerCase()] || 5) - (order[b.toLowerCase()] || 5);
		});
	}

	function updatePagination() {
		totalItems = quizHistory.length;
		totalPages = Math.ceil(totalItems / itemsPerPage);
		
		// Ensure current page is within bounds
		if (currentPage > totalPages) {
			currentPage = Math.max(1, totalPages);
		}
		
		// Calculate start and end indices
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		
		// Slice the history array for current page
		paginatedHistory = quizHistory.slice(startIndex, endIndex);
	}

	function goToPage(page) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			updatePagination();
		}
	}

	function nextPage() {
		goToPage(currentPage + 1);
	}

	function previousPage() {
		goToPage(currentPage - 1);
	}

	function getVisiblePageNumbers() {
		const delta = 2; // Number of pages to show on each side of current page
		const range = [];
		const rangeWithDots = [];
		
		for (let i = Math.max(2, currentPage - delta); 
			 i <= Math.min(totalPages - 1, currentPage + delta); 
			 i++) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, '...');
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push('...', totalPages);
		} else if (totalPages > 1) {
			rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	}

	async function handleLogout() {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			showUserDropdown = false; // Close dropdown after logout
			goto('/');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	}

	// User dropdown functions
	function toggleUserDropdown() {
		showUserDropdown = !showUserDropdown;
	}

	function openUserDropdown() {
		showUserDropdown = true;
	}

	function closeUserDropdown() {
		showUserDropdown = false;
	}

	function handleClickOutside(event) {
		if (showUserDropdown) {
			const dropdown = event.target.closest('.user-dropdown-container');
			if (!dropdown) {
				showUserDropdown = false;
			}
		}
	}
</script>

<svelte:head>
	<title>History - Guess the Masterpiece</title>
</svelte:head>

<div class="min-h-screen p-4 relative overflow-hidden" on:click={handleClickOutside}>
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<div class="mb-8 relative">
			<!-- User Profile Button - Top Right -->
			<div class="absolute -top-4 right-0">
				{#if !$authLoading && $user}
					<div class="relative user-dropdown-container">
						<button 
							class="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full border border-white/30 shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-white/20 hover:scale-105"
							aria-label="User Profile"
							on:click={toggleUserDropdown}
							on:mouseenter={openUserDropdown}
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
						{#if showUserDropdown}
							<div 
								class="absolute top-12 right-0 w-48 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/30 py-2 opacity-100 transition-all duration-300 pointer-events-auto z-10 transform translate-y-0"
								on:mouseenter={openUserDropdown}
								on:mouseleave={closeUserDropdown}
							>
								<div class="px-4 py-2 border-b border-gray-200/50">
									<p class="text-sm font-medium text-text-primary truncate">
										{$user.email || 'Anonymous User'}
									</p>
								</div>
								<button 
									class="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-100/50 transition-colors duration-200 flex items-center gap-2"
									on:click={() => { goto('/'); showUserDropdown = false; }}
								>
									<img src="/home.svg" alt="" class="w-4 h-4" />
									Home
								</button>
								<button 
									class="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-100/50 transition-colors duration-200 flex items-center gap-2"
									on:click={handleLogout}
								>
									<img src="/sign-out.svg" alt="" class="w-4 h-4" />
									Sign Out
								</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>
			
			<h1 class="text-4xl md:text-5xl font-bold mb-4 gradient-text">
				History
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
					<h3 class="text-xl font-bold text-text-primary mb-2">No History Yet</h3>
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
						<thead class="bg-white/90 backdrop-blur-sm border-b-2 border-gray-200/70">
							<tr>
								<th class="px-6 py-4 text-left text-sm font-bold text-text-primary uppercase tracking-wider">Date</th>
								<th class="px-6 py-4 text-left text-sm font-bold text-text-primary uppercase tracking-wider">Level</th>
								<th class="px-6 py-4 text-left text-sm font-bold text-text-primary uppercase tracking-wider">Score</th>
								<th class="px-6 py-4 text-left text-sm font-bold text-text-primary uppercase tracking-wider">Grade</th>
								<th class="px-6 py-4 text-left text-sm font-bold text-text-primary uppercase tracking-wider">Percentage</th>
								<th class="px-6 py-4 text-left text-sm font-bold text-text-primary uppercase tracking-wider">Duration</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200/30">
							{#each paginatedHistory as attempt}
								{@const percentage = Math.round((attempt.score / attempt.total_questions) * 100)}
								{@const gradeInfo = getGrade(percentage)}
								{@const levelColor = getLevelColor(attempt.level)}
								<tr class="bg-white/70 backdrop-blur-sm border border-white/20 shadow-skeu hover:bg-white/90 hover:shadow-skeu-lg hover:scale-[1.01] transition-all duration-200 mb-2">
									<td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-medium">
										{formatDate(attempt.created_at)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
										<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold {levelColor.bg} {levelColor.text} shadow-sm">
											{capitalizeLevel(attempt.level)}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-bold">
										{attempt.score}/{attempt.total_questions}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm font-bold {gradeInfo.color}">
										{gradeInfo.grade}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-medium">
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

				<!-- Pagination Controls -->
				{#if totalPages > 1}
					<div class="border-t border-gray-200/50 px-6 py-4">
						<div class="flex items-center justify-between">
							<!-- Results info -->
							<div class="text-sm text-text-secondary">
								Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
							</div>
							
							<!-- Pagination buttons -->
							<div class="flex items-center space-x-2">
								<!-- Previous button -->
								<button 
									class="px-3 py-2 rounded-lg border border-gray-300/50 text-sm font-medium transition-colors duration-200 {currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-text-primary hover:bg-gray-100/50'}"
									on:click={previousPage}
									disabled={currentPage === 1}
								>
									Previous
								</button>
								
								<!-- Page numbers -->
								{#each getVisiblePageNumbers() as pageNum}
									{#if pageNum === '...'}
										<span class="px-3 py-2 text-sm text-text-secondary">...</span>
									{:else}
										<button 
											class="px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 {currentPage === pageNum ? 'bg-primary-orange text-white border-primary-orange' : 'border-gray-300/50 text-text-primary hover:bg-gray-100/50'}"
											on:click={() => goToPage(pageNum)}
										>
											{pageNum}
										</button>
									{/if}
								{/each}
								
								<!-- Next button -->
								<button 
									class="px-3 py-2 rounded-lg border border-gray-300/50 text-sm font-medium transition-colors duration-200 {currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-text-primary hover:bg-gray-100/50'}"
									on:click={nextPage}
									disabled={currentPage === totalPages}
								>
									Next
								</button>
							</div>
						</div>
					</div>
				{/if}

				<!-- Level-based Statistics -->
				<div class="border-t border-gray-200/50 p-6">
					<h3 class="text-lg font-bold text-text-primary mb-4">Statistics by Level</h3>
					
					{#each getAvailableLevels(quizHistory) as level}
						{@const levelStats = calculateLevelStats(quizHistory, level)}
						{@const levelColor = getLevelColor(level)}
						
						<div class="mb-6 last:mb-0">
							<div class="flex items-center gap-3 mb-3">
								<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold {levelColor.bg} {levelColor.text} shadow-sm">
									{capitalizeLevel(level)}
								</span>
								<div class="text-sm text-text-secondary">
									{levelStats.totalQuizzes} quiz{levelStats.totalQuizzes !== 1 ? 'es' : ''} taken
								</div>
							</div>
							
							<div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg p-4">
								<div class="text-center">
									<div class="text-xl font-bold text-text-primary">{levelStats.totalQuizzes}</div>
									<div class="text-xs text-text-secondary">Total Quizzes</div>
								</div>
								<div class="text-center">
									<div class="text-xl font-bold text-text-primary">
										{levelStats.averageScore}%
									</div>
									<div class="text-xs text-text-secondary">Average Score</div>
								</div>
								<div class="text-center">
									<div class="text-xl font-bold text-text-primary">
										{levelStats.bestScore}%
									</div>
									<div class="text-xs text-text-secondary">Best Score</div>
								</div>
								<div class="text-center">
									<div class="text-xl font-bold text-text-primary">
										{levelStats.quizzesPassed}
									</div>
									<div class="text-xs text-text-secondary">Quizzes Passed</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Navigation Buttons -->
		<div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
			<button 
				class="px-8 py-3 bg-primary-orange text-white rounded-xl font-semibold hover:bg-orange-600 transition-all duration-200 hover:scale-105 shadow-skeu hover:shadow-skeu-lg"
				on:click={() => goto('/')}
			>
				🏠 Back to Home
			</button>
			
			{#if cameFromResults}
				<button 
					class="px-8 py-3 bg-white/85 backdrop-blur-sm border border-white/20 text-text-primary rounded-xl font-semibold shadow-skeu hover:bg-white/90 hover:shadow-skeu-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
					on:click={() => goto('/results')}
				>
					<img src="/history.svg" alt="" class="w-4 h-4" />
					Back to Results
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.transition-all {
		transition-property: all;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 200ms;
	}
	
	/* Custom table styling for better row separation */
	tbody tr {
		margin-bottom: 0.5rem;
		border-radius: 0.75rem;
		display: table-row;
	}
	
	/* Ensure proper spacing between rows */
	tbody tr:not(:last-child) {
		margin-bottom: 0.75rem;
	}
	
	/* Fix for table border-spacing */
	table {
		border-spacing: 0 0.5rem;
		border-collapse: separate;
	}

	/* Gradient Text Animation */
	.gradient-text {
		background: linear-gradient(
			45deg,
			#f97316,  /* primary-orange */
			#0ea5e9,  /* sky-500 */
			#8b5cf6,  /* violet-500 */
			#f59e0b,  /* amber-500 */
			#ec4899,  /* pink-500 */
			#10b981   /* emerald-500 */
		);
		background-size: 400% 400%;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: gradientShift 4s ease-in-out infinite;
		position: relative;
		display: inline-block;
	}

	@keyframes gradientShift {
		0%, 100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	/* Add subtle glow effect */
	.gradient-text::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			45deg,
			#f97316,  /* primary-orange */
			#0ea5e9,  /* sky-500 */
			#8b5cf6,  /* violet-500 */
			#f59e0b,  /* amber-500 */
			#ec4899,  /* pink-500 */
			#10b981   /* emerald-500 */
		);
		background-size: 400% 400%;
		animation: gradientShift 4s ease-in-out infinite;
		filter: blur(20px);
		z-index: -1;
		opacity: 0.3;
	}

	/* Responsive adjustments for gradient text */
	@media (max-width: 768px) {
		.gradient-text {
			background-size: 300% 300%;
		}
		
		.gradient-text::after {
			background-size: 300% 300%;
			filter: blur(15px);
		}
	}
</style>