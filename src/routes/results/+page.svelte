<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Get results from URL params
	$: score = parseInt($page.url.searchParams.get('score')) || 0;
	$: total = parseInt($page.url.searchParams.get('total')) || 10;
	$: level = $page.url.searchParams.get('level') || 'neophyte';

	// Calculate percentage and grade
	$: percentage = Math.round((score / total) * 100);
	$: grade = getGrade(percentage);
	$: message = getMessage(percentage);

	let showAnimation = false;

	onMount(() => {
		setTimeout(() => {
			showAnimation = true;
		}, 500);
	});

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
		goto('/');
	}

	function shareFacebook() {
		const url = encodeURIComponent(window.location.origin);
		const text = encodeURIComponent(`I just scored ${score}/${total} on the Guess the Masterpiece quiz! Can you beat my score?`);
		window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
	}

	function shareTwitter() {
		const url = encodeURIComponent(window.location.origin);
		const text = encodeURIComponent(`I just scored ${score}/${total} on the Guess the Masterpiece quiz! 🎨 Can you beat my score?`);
		window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
	}
</script>

<svelte:head>
	<title>Results - Guess the Masterpiece</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="w-full max-w-2xl mx-auto text-center">
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
								stroke="#E85A4F" 
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
						<div class="text-2xl font-bold text-primary-orange">{score}</div>
						<div class="text-sm text-text-secondary">Correct</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-red-500">{total - score}</div>
						<div class="text-sm text-text-secondary">Incorrect</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-blue-500">{percentage}%</div>
						<div class="text-sm text-text-secondary">Accuracy</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="space-y-4 mb-8">
			<button 
				class="btn-skeu btn-primary w-full md:w-auto px-8"
				on:click={playAgain}
			>
				🎮 Play Again
			</button>
			
			<div class="flex flex-col md:flex-row gap-4 justify-center">
				<button 
					class="btn-skeu btn-secondary px-6"
					on:click={shareFacebook}
				>
					📱 Share on Facebook
				</button>
				<button 
					class="btn-skeu btn-secondary px-6"
					on:click={shareTwitter}
				>
					🐦 Share on Twitter
				</button>
			</div>
		</div>

		<!-- Encouragement -->
		<div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
			<h3 class="text-lg font-semibold text-text-primary mb-2">
				Ready for More?
			</h3>
			<p class="text-text-secondary mb-4">
				Try different difficulty levels to test your art knowledge across various periods and styles!
			</p>
			<div class="flex flex-wrap gap-2 justify-center">
				<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">🌱 Neophyte</span>
				<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">🎨 Artisan</span>
				<span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">👑 Master</span>
				<span class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">🔄 Mix</span>
			</div>
		</div>
	</div>
</div>

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