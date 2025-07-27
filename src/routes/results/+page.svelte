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

	// Get results from URL params
	$: score = parseInt($page.url.searchParams.get('score')) || 0;
	$: total = parseInt($page.url.searchParams.get('total')) || 10;
	$: level = $page.url.searchParams.get('level') || 'neophyte';

	// Get quiz answers from sessionStorage for review
	let userAnswers = [];
	let showReview = false;
	let reviewTab = 'wrong'; // 'wrong' or 'all'

	// Calculate percentage and grade
	$: percentage = Math.round((score / total) * 100);
	$: grade = getGrade(percentage);
	$: message = getMessage(percentage);

	// Animation states
	let showAnimation = false;
	let fireworksContainer;
	let fireworks;

	onMount(() => {
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
		if (percentage >= 90) return 'Outstanding! You\'re a true art connoisseur! 🎨';
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
		<div class="mb-8">
			<h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-4">
				Quiz Complete! 🎉
			</h1>
			<p class="text-xl text-text-secondary capitalize">
				{level} Level Challenge
			</p>
		</div>

		<!-- Score Card -->
		<div class="card mb-8 relative overflow-hidden">
			<!-- Background decoration -->
			<div class="absolute inset-0 bg-gradient-to-br from-primary-orange/5 to-transparent"></div>
			
			<div class="relative z-10">
				<!-- Score Circle -->
				<div class="mb-6">
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
				<div class="mb-6">
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

			<!-- Encouragement -->
			{#if !showReview}
				<div class="bg-white/85 rounded-xl p-6 backdrop-blur-sm border border-white/20">
					<h3 class="text-lg font-semibold text-text-primary mb-2">
						Ready for More?
					</h3>
					<p class="text-text-secondary mb-4">
						Try different difficulty levels to test your art knowledge across various periods and styles!
					</p>
					<div class="flex flex-wrap gap-2 justify-center">
						<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">🌱 Neophyte</span>
						<span class="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">🎨 Artisan</span>
						<span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">👑 Master</span>
						<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">🔄 Mix</span>
					</div>
				</div>
			{/if}
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
</style>