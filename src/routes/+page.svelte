<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { language } from '$lib/language.js';

	let currentLanguage = 'ru';

	// Subscribe to language changes
	language.subscribe(value => {
		currentLanguage = value;
	});

	onMount(() => {
		language.init();
	});

	const difficulties = [
		{
			id: 1,
			name: 'Neophyte',
			description: 'Perfect for art beginners',
			color: 'bg-green-500',
			icon: 'leaf'
		},
		{
			id: 2,
			name: 'Artisan',
			description: 'For art enthusiasts',
			color: 'bg-teal-500',
			icon: 'palette'
		},
		{
			id: 3,
			name: 'Master',
			description: 'Challenge for art experts',
			color: 'bg-purple-500',
			icon: 'crown'
		},
		{
			id: 4,
			name: 'Mix',
			description: 'Questions from all levels',
			color: 'bg-primary-orange',
			icon: 'shuffle'
		}
	];

	function startQuiz(difficulty) {
		goto(`/quiz?difficulty=${difficulty.id}&level=${difficulty.name.toLowerCase()}&lang=${currentLanguage}`);
	}

	function switchLanguage(lang) {
		language.setLanguage(lang);
	}

	function getIcon(iconName) {
		const icons = {
			leaf: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.8,18.1L14.6,12l3.2-6.1c0.1-0.2,0.2-0.5,0-0.7s-0.5-0.2-0.7,0L12,10.7L6.9,5.2c-0.2-0.2-0.5-0.2-0.7,0 s-0.2,0.5,0,0.7L9.4,12l-3.2,6.1c-0.1,0.2-0.2,0.5,0,0.7s0.5,0.2,0.7,0L12,13.3l5.1,5.5c0.2,0.2,0.5,0.2,0.7,0 S17.9,18.3,17.8,18.1z"/></svg>`,
			palette: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2C6.49,2,2,6.49,2,12s4.49,10,10,10c1.38,0,2.5-1.12,2.5-2.5c0-0.61-0.23-1.15-0.59-1.56 c-0.36-0.41-0.59-0.94-0.59-1.56c0-1.38,1.12-2.5,2.5-2.5h2.95C19.8,14.37,22,12.17,22,9.5C22,5.36,17.64,2,12,2z M6.5,12 c-0.83,0-1.5-0.67-1.5-1.5S5.67,9,6.5,9S8,9.67,8,10.5S7.33,12,6.5,12z M9.5,8C8.67,8,8,7.33,8,6.5S8.67,5,9.5,5S11,5.67,11,6.5 S10.33,8,9.5,8z M14.5,8c-0.83,0-1.5-0.67-1.5-1.5S13.67,5,14.5,5S16,5.67,16,6.5S15.33,8,14.5,8z M17.5,12 c-0.83,0-1.5-0.67-1.5-1.5S16.67,9,17.5,9S19,9.67,19,10.5S18.33,12,17.5,12z"/></svg>`,
			crown: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12,5L16,11L20,8L19,19H5L4,8L8,11L12,5M12,2L6,8L2,5L4,21H20L22,5L18,8L12,2Z"/></svg>`,
			shuffle: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14.83,13.41L13.42,14.82L16.55,17.95L14.5,20H20V14.5L17.96,16.54L14.83,13.41M14.5,4L16.54,6.04L4,18.59L5.41,20L17.96,7.46L20,9.5V4M10.59,9.17L5.41,4L4,5.41L9.17,10.59L10.59,9.17Z"/></svg>`
		};
		return icons[iconName] || '';
	}
</script>

<svelte:head>
	<title>Guess the Masterpiece - Art Quiz Game</title>
	<meta name="description" content="Test your knowledge of famous paintings with our interactive art quiz game." />
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="w-full max-w-4xl mx-auto text-center">
		<!-- Header with Language Switcher -->
		<div class="mb-12 relative">
			<!-- Language Switcher - repositioned -->
			<div class="absolute top-0 right-0">
				<div class="flex items-center space-x-1 bg-white rounded-lg shadow-md p-1">
					<span class="text-xs text-text-secondary font-medium px-2">Language:</span>
					<button 
						class="px-2 py-1 rounded text-xs font-medium transition-colors duration-200 {currentLanguage === 'ru' ? 'bg-primary-orange text-white' : 'text-text-secondary hover:bg-gray-100'}"
						on:click={() => switchLanguage('ru')}
					>
						🇷🇺 Ru
					</button>
					<button 
						class="px-2 py-1 rounded text-xs font-medium transition-colors duration-200 {currentLanguage === 'en' ? 'bg-primary-orange text-white' : 'text-text-secondary hover:bg-gray-100'}"
						on:click={() => switchLanguage('en')}
					>
						🇺🇸 En
					</button>
				</div>
			</div>
			
			<h1 class="text-5xl md:text-6xl font-bold text-text-primary mb-4 pt-24">
				Guess the <span class="text-primary-orange">Masterpiece</span>
			</h1>
			<p class="text-xl text-text-secondary">
				Test your knowledge of famous paintings across different difficulty levels
			</p>
		</div>

		<!-- Difficulty Selection Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
			{#each difficulties as difficulty}
				<button
					class="bg-white rounded-2xl shadow-md hover:shadow-lg p-6 transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-gray-200"
					on:click={() => startQuiz(difficulty)}
				>
					<div class="flex items-center space-x-4 text-left">
						<!-- Icon -->
						<div class="w-12 h-12 {difficulty.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200">
							{@html getIcon(difficulty.icon)}
						</div>
						
						<!-- Content -->
						<div class="flex-1">
							<h3 class="text-xl font-bold text-text-primary mb-1">
								{difficulty.name}
							</h3>
							<p class="text-sm text-text-secondary">
								{difficulty.description}
							</p>
						</div>
						
						<!-- Arrow -->
						<div class="text-primary-orange text-xl group-hover:translate-x-1 transition-transform duration-200">
							→
						</div>
					</div>
				</button>
			{/each}
		</div>

		<!-- How to Play - Redesigned -->
		<div class="max-w-2xl mx-auto">
			<h2 class="text-2xl font-bold text-text-primary mb-8">How to Play</h2>
			<div class="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-8">
				<div class="flex flex-col items-center text-center">
					<div class="w-16 h-16 bg-primary-orange rounded-full flex items-center justify-center mb-3 shadow-lg">
						<span class="text-white text-2xl font-bold">1</span>
					</div>
					<p class="text-text-secondary font-medium">Choose your<br/>difficulty level</p>
				</div>
				
				<div class="hidden md:block text-primary-orange text-2xl">→</div>
				
				<div class="flex flex-col items-center text-center">
					<div class="w-16 h-16 bg-primary-orange rounded-full flex items-center justify-center mb-3 shadow-lg">
						<span class="text-white text-2xl font-bold">2</span>
					</div>
					<p class="text-text-secondary font-medium">Answer 10 questions<br/>about famous paintings</p>
				</div>
				
				<div class="hidden md:block text-primary-orange text-2xl">→</div>
				
				<div class="flex flex-col items-center text-center">
					<div class="w-16 h-16 bg-primary-orange rounded-full flex items-center justify-center mb-3 shadow-lg">
						<span class="text-white text-2xl font-bold">3</span>
					</div>
					<p class="text-text-secondary font-medium">Get instant feedback<br/>and see your score</p>
				</div>
			</div>
		</div>
	</div>
</div>