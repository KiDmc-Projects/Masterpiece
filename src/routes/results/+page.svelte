<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { Fireworks } from 'fireworks-js';
	import { 
		trackPageView, 
		trackQuizCompletion, 
		getCurrentSessionDuration,
		calculateGrade 
	} from '$lib/analytics';
	import { user, session, loading as authLoading, initializeAuth, authService } from '$lib/auth';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import { saveQuizAttempt, testQuizHistoryTable, debugAuth } from '$lib/supabase';

	// Get results from URL params
	$: score = parseInt($page.url.searchParams.get('score')) || 0;
	$: total = parseInt($page.url.searchParams.get('total')) || 10;
	$: level = $page.url.searchParams.get('level') || 'neophyte';

	// Get quiz answers from sessionStorage for review
	let userAnswers = [];
	let showReview = false;
	let reviewTab = 'wrong'; // 'wrong' or 'all'
	
	// Login modal state
	let showLoginModal = false;
	
	// Avatar loading state
	let avatarLoadError = false;
	let showUserDropdown = false;

	// Calculate percentage and grade
	$: percentage = Math.round((score / total) * 100);
	$: grade = getGrade(percentage);
	$: message = getMessage(percentage);

	// Animation states
	let showAnimation = false;
	let fireworksContainer;
	let fireworks;

	onMount(() => {
		// Initialize auth
		initializeAuth();
		
		// Track results page view
		trackPageView('results', 'ru'); // Default to Russian, could be enhanced to get from params
		
		// Load user answers from sessionStorage
		try {
			const savedAnswers = sessionStorage.getItem('quizAnswers');
			if (savedAnswers) {
				userAnswers = JSON.parse(savedAnswers);
			}
		} catch (error) {
			console.error('Error loading quiz answers:', error);
		}

		// Track quiz completion with all metrics
		const sessionDuration = getCurrentSessionDuration();
		const finalGrade = calculateGrade(score, total);
		trackQuizCompletion(level, finalGrade, score, total, sessionDuration, 'ru');

		// Test if quiz_attempts table exists
		testQuizHistoryTable().then(exists => {
			console.log('Quiz attempts table exists:', exists);
		});

		// Save quiz attempt for logged-in users (delayed to ensure user is loaded)
		setTimeout(async () => {
			const currentUser = $user;
			if (currentUser && score > 0) {
				console.log('Saving quiz attempt for user:', currentUser.id);
				
				// Debug authentication context
				const authDebug = await debugAuth();
				console.log('Auth debug info:', authDebug);
				
				try {
					const result = await saveQuizAttempt(
						currentUser.id,
						level,
						score,
						total,
						sessionDuration,
						'ru' // Could get from URL params or localStorage
					);
					console.log('Quiz attempt saved successfully:', result);
				} catch (error) {
					console.error('Failed to save quiz attempt:', error);
				}
			} else {
				console.log('No user or invalid score, skipping quiz save:', { user: currentUser, score });
			}
		}, 1000);

		// Start animations
		startFireworks();
		setTimeout(() => {
			showAnimation = true;
		}, 800);
	});

	onDestroy(() => {
		// Clean up fireworks instance
		if (fireworks) {
			fireworks.stop();
		}
	});

	function startFireworks() {
		if (fireworksContainer) {
			// Initialize fireworks with custom options
			fireworks = new Fireworks(fireworksContainer, {
				autoresize: true,
				opacity: 0.5,
				acceleration: 1.02,
				friction: 0.97,
				gravity: 1.5,
				particles: 50,
				traceLength: 3,
				traceSpeed: 10,
				explosion: 5,
				intensity: 30,
				lineStyle: 'round',
				hue: {
					min: 0,
					max: 360
				},
				delay: {
					min: 30,
					max: 60
				},
				rocketsPoint: {
					min: 50,
					max: 50
				},
				lineWidth: {
					explosion: {
						min: 1,
						max: 3
					},
					trace: {
						min: 1,
						max: 2
					}
				},
				brightness: {
					min: 50,
					max: 80
				},
				decay: {
					min: 0.015,
					max: 0.03
				},
				mouse: {
					click: false,
					max: 1
				}
			});

			// Start the fireworks
			fireworks.start();

			// Stop fireworks after 5 seconds
			setTimeout(() => {
				if (fireworks) {
					fireworks.stop();
				}
			}, 5000);
		}
	}

	function getGrade(percentage) {
		if (percentage >= 90) return 'A+';
		if (percentage >= 80) return 'A';
		if (percentage >= 70) return 'B';
		if (percentage >= 60) return 'C';
		if (percentage >= 50) return 'D';
		return 'F';
	}

	function getMessage(percentage) {
		if (percentage >= 90) return 'Outstanding! You\'re a true art connoisseur!';
		if (percentage >= 80) return 'Excellent work! Your art knowledge is impressive! 👏';
		if (percentage >= 70) return 'Great job! You have a good eye for art! 👍';
		if (percentage >= 60) return 'Not bad! Keep exploring the world of art! 🖼️';
		if (percentage >= 50) return 'Good effort! There\'s always more to learn about art! 📚';
		return 'Don\'t give up! Art appreciation comes with time and practice! 💪';
	}

	function playAgain() {
		// Clear quiz answers from sessionStorage
		sessionStorage.removeItem('quizAnswers');
		goto('/');
	}

	function toggleReview() {
		showReview = !showReview;
	}

	function setReviewTab(tab) {
		reviewTab = tab;
	}

	$: reviewAnswers = reviewTab === 'wrong' 
		? userAnswers.filter(answer => !answer.isCorrect)
		: userAnswers;
	
	// Login functions
	function openLogin() {
		showLoginModal = true;
	}
	
	function closeLogin() {
		showLoginModal = false;
	}
	
	async function handleLogout() {
		try {
			await authService.signOut();
			// User will be automatically updated via auth state change
			showUserDropdown = false; // Close dropdown after logout
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

</script>

<svelte:head>
	<title>Results - Guess the Masterpiece</title>
</svelte:head>

<div class="min-h-screen p-4 relative overflow-hidden">
	<!-- Fireworks Container -->
	<div 
		bind:this={fireworksContainer}
		class="fixed inset-0 z-40 pointer-events-none"
		style="background: transparent;"
	></div>

	<div class="max-w-6xl mx-auto">
		<div class="grid grid-cols-1 {showReview ? 'lg:grid-cols-2' : ''} gap-8">
			<!-- Results Section -->
			<div class="{showReview ? 'lg:sticky lg:top-4 lg:h-fit' : 'max-w-2xl mx-auto'} text-center">
		<!-- Header -->
		<div class="mb-8 relative">
			<!-- Login/User Button - Top Right -->
			<div class="absolute -top-4 right-0">
				{#if !$authLoading}
					{#if $user}
						<!-- User Profile Button -->
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
										on:click={() => { 
											sessionStorage.setItem('fromResults', 'true');
											goto('/history'); 
											showUserDropdown = false; 
										}}
									>
										<img src="/history.svg" alt="" class="w-4 h-4" />
										History
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
					{:else}
						<!-- Login Button -->
						<button 
							class="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full border border-white/30 shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-white/20 hover:scale-105"
							on:click={openLogin}
							aria-label="Sign In"
						>
							<!-- Custom not-logged-in user icon -->
							<svg class="w-5 h-5 text-text-primary" fill="currentColor" viewBox="0 0 492.308 492.308">
								<path d="M246.154,5.971c-66.933,0-121.385,54.452-121.385,121.375c0,66.933,54.452,121.385,121.385,121.385s121.385-54.452,121.385-121.385C367.538,60.423,313.087,5.971,246.154,5.971z M246.154,229.038c-56.072,0-101.692-45.615-101.692-101.692c0-56.067,45.62-101.683,101.692-101.683c56.072,0,101.692,45.615,101.692,101.683C347.846,183.423,302.226,229.038,246.154,229.038z"/>
								<path d="M384.394,248.019c-1.822-1.25-5.486-3.625-5.486-3.625l-7.865-5.106l-5.486,7.615c-27.649,38.385-72.284,61.308-119.404,61.308c-47.125,0-91.769-22.923-119.413-61.317l-5.495-7.635l-12.447,8.163C40.673,293.308,0,369.683,0,451.712v34.625h492.308v-34.625C492.308,370.106,451.966,293.962,384.394,248.019z M472.615,466.644H19.692v-14.933c0-74.154,36.125-143.279,96.861-185.731c31.577,38.942,79.337,61.923,129.601,61.923c50.255,0,98.019-22.99,129.596-61.923c60.716,42.423,96.865,111.625,96.865,185.731V466.644z"/>
							</svg>
						</button>
					{/if}
				{/if}
			</div>
			
			<h1 class="text-4xl md:text-5xl font-bold mb-4 gradient-text">
				Quiz Complete!
			</h1>
		</div>

		<!-- Score Card -->
		<div class="card mb-8 relative overflow-hidden">
			<!-- Background decoration -->
			<div class="absolute inset-0 bg-gradient-to-br from-primary-orange/5 to-transparent"></div>
			
			<div class="relative z-10">
				<!-- Score Circle -->
				<div class="mb-4">
					<div class="w-32 h-32 mx-auto relative">
						<!-- Background circle -->
						<svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
							<circle 
								cx="60" 
								cy="60" 
								r="50" 
								stroke="#E5E7EB" 
								stroke-width="8" 
								fill="none"
							/>
							<!-- Progress circle -->
							<circle 
								cx="60" 
								cy="60" 
								r="50" 
								stroke="#0ea5e9" 
								stroke-width="8" 
								fill="none"
								stroke-dasharray="314"
								stroke-dashoffset="{showAnimation ? 314 - (314 * percentage / 100) : 314}"
								class="transition-all duration-2000 ease-out"
								stroke-linecap="round"
							/>
						</svg>
						
						<!-- Score text -->
						<div class="absolute inset-0 flex items-center justify-center">
							<div>
								<div class="text-3xl font-bold text-primary-orange">
									{showAnimation ? score : 0}
								</div>
								<div class="text-sm text-text-secondary">out of {total}</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Grade and Percentage -->
				<div class="mb-4">
					<div class="text-6xl font-bold text-primary-orange mb-2">
						{grade}
					</div>
					<div class="text-2xl text-text-secondary">
						{percentage}% Correct
					</div>
				</div>

				<!-- Message -->
				<div class="mb-6">
					<p class="text-lg text-text-primary">
						{message}
					</p>
				</div>

				<!-- Stats -->
				<div class="grid grid-cols-3 gap-4 text-center border-t pt-6">
					<div>
						<div class="text-3xl font-bold text-green-500">{score}</div>
						<div class="text-sm text-text-secondary">Correct</div>
					</div>
					<div>
						<div class="text-3xl font-bold text-red-500">{total - score}</div>
						<div class="text-sm text-text-secondary">Incorrect</div>
					</div>
					<div>
						<div class="text-3xl font-bold text-primary-orange">{percentage}%</div>
						<div class="text-sm text-text-secondary">Accuracy</div>
					</div>
				</div>
			</div>
		</div>

			<!-- Action Buttons -->
			<div class="mb-6 space-y-3 md:space-y-0 md:space-x-4 md:flex md:justify-center">
				<button 
					class="btn-skeu btn-primary w-full md:w-auto px-6 py-3"
					on:click={playAgain}
				>
					🎮 Play Again
				</button>
				
				{#if userAnswers.length > 0}
					<button 
						class="btn-skeu btn-secondary w-full md:w-auto px-6 py-3"
						on:click={toggleReview}
					>
						{showReview ? '📊 Hide Review' : '📋 Review Answers'}
					</button>
				{/if}
			</div>

		</div>

		<!-- Answer Review Section -->
		{#if showReview && userAnswers.length > 0}
			<div class="bg-white/85 rounded-xl p-6 backdrop-blur-sm border border-white/20">
				<div class="mb-6">
					<h2 class="text-2xl font-bold text-text-primary mb-4 text-left">📋 Answer Review</h2>
					
					<!-- Review Tabs -->
					<div class="flex bg-gray-100 rounded-lg p-1 mb-4">
						<button 
							class="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors {
								reviewTab === 'wrong' 
									? 'bg-white text-red-600 shadow-sm' 
									: 'text-gray-600 hover:text-gray-800'
							}"
							on:click={() => setReviewTab('wrong')}
						>
							❌ Wrong Answers ({userAnswers.filter(a => !a.isCorrect).length})
						</button>
						<button 
							class="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors {
								reviewTab === 'all' 
									? 'bg-white text-blue-600 shadow-sm' 
									: 'text-gray-600 hover:text-gray-800'
							}"
							on:click={() => setReviewTab('all')}
						>
							📝 All Questions ({userAnswers.length})
						</button>
					</div>
				</div>

				<!-- Review Content -->
				<div class="space-y-4 max-h-96 overflow-y-auto">
					{#each reviewAnswers as answer, index}
						<div class="border rounded-lg p-4 bg-white/50 text-left">
							<div class="flex items-start gap-4">
								<!-- Question Image -->
								<div class="flex-shrink-0">
									<img 
										src={answer.imageUrl} 
										alt={answer.paintingTitle}
										class="w-16 h-16 object-cover rounded-lg"
									/>
								</div>
								
								<!-- Question Details -->
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 mb-2">
										<span class="text-sm font-medium text-gray-500">Q{answer.questionNumber}</span>
										<span class="text-lg">{answer.isCorrect ? '✅' : '❌'}</span>
									</div>
									
									<h4 class="font-semibold text-gray-900 mb-1 text-sm">
										"{answer.paintingTitle}"
									</h4>
									
									<div class="text-sm space-y-1">
										<div class="{answer.isCorrect ? 'text-green-600' : 'text-red-600'}">
											<strong>Your answer:</strong> {answer.userAnswer}
										</div>
										{#if !answer.isCorrect}
											<div class="text-green-600">
												<strong>Correct answer:</strong> {answer.correctAnswer}
											</div>
										{/if}
									</div>
								</div>
							</div>
						</div>
					{/each}
					
					{#if reviewAnswers.length === 0}
						<div class="text-center py-8 text-gray-500">
							{reviewTab === 'wrong' ? 'Great! No wrong answers to review! 🎉' : 'No questions to review.'}
						</div>
					{/if}
				</div>
			</div>
		{/if}
		</div> <!-- Close grid container -->
	</div> <!-- Close content wrapper -->
</div> <!-- Close main container -->

<!-- Login Modal -->
<LoginModal bind:open={showLoginModal} on:close={closeLogin} on:success={closeLogin} />

<style>
	.transition-all {
		transition-property: all;
	}
	
	.duration-2000 {
		transition-duration: 2s;
	}
	
	.ease-out {
		transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
	}

	/* Gradient Text Animation */
	.gradient-text {
		background: linear-gradient(
			45deg,
			#f97316,  /* primary-orange */
			#0ea5e9,  /* primary-blue */
			#8b5cf6,  /* purple-500 */
			#f59e0b,  /* amber-500 */
			#ec4899,  /* pink-500 */
			#10b981,  /* emerald-500 */
			#f97316   /* back to primary-orange */
		);
		background-size: 400% 400%;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: gradientFlow 4s ease-in-out infinite;
		position: relative;
	}

	@keyframes gradientFlow {
		0% {
			background-position: 0% 50%;
		}
		25% {
			background-position: 100% 50%;
		}
		50% {
			background-position: 100% 100%;
		}
		75% {
			background-position: 0% 100%;
		}
		100% {
			background-position: 0% 50%;
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
			rgba(249, 115, 22, 0.1),
			rgba(14, 165, 233, 0.1),
			rgba(139, 92, 246, 0.1),
			rgba(245, 158, 11, 0.1),
			rgba(236, 72, 153, 0.1),
			rgba(16, 185, 129, 0.1)
		);
		background-size: 400% 400%;
		animation: gradientFlow 4s ease-in-out infinite;
		border-radius: 12px;
		z-index: -1;
		filter: blur(20px);
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