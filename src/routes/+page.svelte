<script>
	import { goto } from '$app/navigation';

	const difficulties = [
		{
			id: 1,
			name: 'Neophyte',
			description: 'Perfect for art beginners',
			color: 'bg-green-500',
			icon: '🌱'
		},
		{
			id: 2,
			name: 'Artisan',
			description: 'For art enthusiasts',
			color: 'bg-blue-500',
			icon: '🎨'
		},
		{
			id: 3,
			name: 'Master',
			description: 'Challenge for art experts',
			color: 'bg-purple-500',
			icon: '👑'
		},
		{
			id: 4,
			name: 'Mix',
			description: 'Questions from all levels',
			color: 'bg-primary-orange',
			icon: '🔄'
		}
	];

	function startQuiz(difficulty) {
		goto(`/quiz?difficulty=${difficulty.id}&level=${difficulty.name.toLowerCase()}`);
	}
</script>

<svelte:head>
	<title>Guess the Masterpiece - Art Quiz Game</title>
	<meta name="description" content="Test your knowledge of famous paintings with our interactive art quiz game." />
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="w-full max-w-2xl mx-auto text-center">
		<!-- Header -->
		<div class="mb-12">
			<h1 class="text-5xl md:text-6xl font-bold text-text-primary mb-4">
				Guess the <span class="text-primary-orange">Masterpiece</span>
			</h1>
			<p class="text-xl text-text-secondary">
				Test your knowledge of famous paintings across different difficulty levels
			</p>
		</div>

		<!-- Difficulty Selection Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
			{#each difficulties as difficulty}
				<button
					class="card hover:scale-105 transition-all duration-300 cursor-pointer group"
					on:click={() => startQuiz(difficulty)}
				>
					<div class="flex items-center space-x-4 text-left">
						<!-- Icon -->
						<div class="w-16 h-16 {difficulty.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
							{difficulty.icon}
						</div>
						
						<!-- Content -->
						<div class="flex-1">
							<h3 class="text-2xl font-bold text-text-primary mb-1">
								{difficulty.name}
							</h3>
							<p class="text-text-secondary">
								{difficulty.description}
							</p>
						</div>
						
						<!-- Arrow -->
						<div class="text-primary-orange text-2xl group-hover:translate-x-1 transition-transform duration-200">
							→
						</div>
					</div>
				</button>
			{/each}
		</div>

		<!-- Game Info -->
		<div class="bg-white/50 rounded-xl p-6 backdrop-blur-sm">
			<h2 class="text-lg font-semibold text-text-primary mb-2">How to Play</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
				<div class="flex items-center space-x-2">
					<span class="w-6 h-6 bg-primary-orange rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
					<span>Choose your difficulty level</span>
				</div>
				<div class="flex items-center space-x-2">
					<span class="w-6 h-6 bg-primary-orange rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
					<span>Answer 10 questions about famous paintings</span>
				</div>
				<div class="flex items-center space-x-2">
					<span class="w-6 h-6 bg-primary-orange rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
					<span>Get instant feedback and see your score</span>
				</div>
			</div>
		</div>
	</div>
</div>