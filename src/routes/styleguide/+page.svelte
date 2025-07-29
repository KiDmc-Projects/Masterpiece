<script>
	import { onMount } from 'svelte';
	import { trackPageView } from '$lib/analytics';

	onMount(() => {
		trackPageView('styleguide', 'ru');
	});

	// Sample data for component examples
	const difficulties = [
		{ id: 1, name: 'Neophyte', color: 'bg-green-500', icon: 'leaf' },
		{ id: 2, name: 'Artisan', color: 'bg-teal-500', icon: 'palette' },
		{ id: 3, name: 'Master', color: 'bg-purple-500', icon: 'crown' },
		{ id: 4, name: 'Mix', color: 'bg-primary-orange', icon: 'shuffle' }
	];

	let sampleScore = 8;
	let sampleTotal = 10;
	let showGlassmorphismExample = true;
</script>

<svelte:head>
	<title>Style Guide - Masterpiece Quiz</title>
	<meta name="description" content="Design system and style guide for the Masterpiece Quiz application" />
</svelte:head>

<div class="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-orange-50">
	<div class="max-w-6xl mx-auto">
		
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold text-text-primary mb-4">🎨 Masterpiece Style Guide</h1>
			<p class="text-lg text-text-secondary max-w-2xl mx-auto mb-4">
				A comprehensive guide to the design system, components, and visual language of the Masterpiece Quiz application.
			</p>
			
			<!-- Recent Updates Badge -->
			<div class="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
				✨ Recently Updated: Quiz header design, inactive answer states, and Lato font integration
			</div>
		</div>

		<!-- Navigation -->
		<nav class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-8 shadow-skeu">
			<div class="flex flex-wrap gap-4 justify-center">
				<a href="#colors" class="px-4 py-2 rounded-lg bg-primary-orange/10 text-primary-orange hover:bg-primary-orange/20 transition-colors">Colors</a>
				<a href="#typography" class="px-4 py-2 rounded-lg bg-primary-orange/10 text-primary-orange hover:bg-primary-orange/20 transition-colors">Typography</a>
				<a href="#glassmorphism" class="px-4 py-2 rounded-lg bg-primary-orange/10 text-primary-orange hover:bg-primary-orange/20 transition-colors">Glassmorphism</a>
				<a href="#buttons" class="px-4 py-2 rounded-lg bg-primary-orange/10 text-primary-orange hover:bg-primary-orange/20 transition-colors">Buttons</a>
				<a href="#quiz-components" class="px-4 py-2 rounded-lg bg-primary-orange/10 text-primary-orange hover:bg-primary-orange/20 transition-colors">Quiz Components</a>
				<a href="#cards" class="px-4 py-2 rounded-lg bg-primary-orange/10 text-primary-orange hover:bg-primary-orange/20 transition-colors">Cards</a>
				<a href="#forms" class="px-4 py-2 rounded-lg bg-primary-orange/10 text-primary-orange hover:bg-primary-orange/20 transition-colors">Forms</a>
				<a href="#spacing" class="px-4 py-2 rounded-lg bg-primary-orange/10 text-primary-orange hover:bg-primary-orange/20 transition-colors">Spacing</a>
				<a href="#animations" class="px-4 py-2 rounded-lg bg-primary-orange/10 text-primary-orange hover:bg-primary-orange/20 transition-colors">Animations</a>
			</div>
		</nav>

		<!-- Color Palette -->
		<section id="colors" class="mb-16">
			<h2 class="text-3xl font-bold text-text-primary mb-8">🎨 Color Palette</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<!-- Primary Colors -->
				<div class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-skeu">
					<h3 class="text-xl font-semibold mb-4">Primary Colors</h3>
					<div class="space-y-3">
						<div class="flex items-center gap-4">
							<div class="w-12 h-12 bg-primary-orange rounded-lg shadow-md"></div>
							<div>
								<div class="font-medium">Primary Orange</div>
								<div class="text-sm text-text-secondary">#0ea5e9</div>
							</div>
						</div>
						<div class="flex items-center gap-4">
							<div class="w-12 h-12 bg-primary-gray rounded-lg shadow-md"></div>
							<div>
								<div class="font-medium">Primary Gray</div>
								<div class="text-sm text-text-secondary">#BBBDC0</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Difficulty Colors -->
				<div class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-skeu">
					<h3 class="text-xl font-semibold mb-4">Difficulty Colors</h3>
					<div class="space-y-3">
						<div class="flex items-center gap-4">
							<div class="w-12 h-12 bg-green-500 rounded-lg shadow-md"></div>
							<div>
								<div class="font-medium">Neophyte</div>
								<div class="text-sm text-text-secondary">Green</div>
							</div>
						</div>
						<div class="flex items-center gap-4">
							<div class="w-12 h-12 bg-teal-500 rounded-lg shadow-md"></div>
							<div>
								<div class="font-medium">Artisan</div>
								<div class="text-sm text-text-secondary">Teal</div>
							</div>
						</div>
						<div class="flex items-center gap-4">
							<div class="w-12 h-12 bg-purple-500 rounded-lg shadow-md"></div>
							<div>
								<div class="font-medium">Master</div>
								<div class="text-sm text-text-secondary">Purple</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Text Colors -->
				<div class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-skeu">
					<h3 class="text-xl font-semibold mb-4">Text Colors</h3>
					<div class="space-y-3">
						<div class="flex items-center gap-4">
							<div class="w-12 h-12 bg-text-primary rounded-lg shadow-md"></div>
							<div>
								<div class="font-medium">Primary Text</div>
								<div class="text-sm text-text-secondary">#2D3436</div>
							</div>
						</div>
						<div class="flex items-center gap-4">
							<div class="w-12 h-12 bg-text-secondary rounded-lg shadow-md"></div>
							<div>
								<div class="font-medium">Secondary Text</div>
								<div class="text-sm text-text-secondary">#636E72</div>
							</div>
						</div>
						<div class="flex items-center gap-4">
							<div class="w-12 h-12 bg-background rounded-lg shadow-md border"></div>
							<div>
								<div class="font-medium">Background</div>
								<div class="text-sm text-text-secondary">#F8F9FA</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Typography -->
		<section id="typography" class="mb-16">
			<h2 class="text-3xl font-bold text-text-primary mb-8">✍️ Typography</h2>
			
			<div class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-skeu">
				<div class="space-y-8">
					<!-- Font Family -->
					<div>
						<h3 class="text-xl font-semibold mb-4">Font Family</h3>
						<p class="text-lg mb-2" style="font-family: 'Lato', sans-serif;">Lato (Primary font stack) - Clean, modern, and highly readable</p>
						<code class="text-sm bg-gray-100 px-3 py-1 rounded">
							font-family: "Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif
						</code>
						<div class="mt-3 p-3 bg-blue-50 rounded-lg">
							<p class="text-sm text-blue-800"><strong>Recently Updated:</strong> Changed from Inter to Lato for better readability and modern aesthetics</p>
						</div>
					</div>

					<!-- Headings -->
					<div>
						<h3 class="text-xl font-semibold mb-4">Headings</h3>
						<div class="space-y-4">
							<div>
								<h1 class="text-4xl font-bold text-text-primary">Heading 1 - 4xl Bold</h1>
								<code class="text-sm text-text-secondary">text-4xl font-bold</code>
							</div>
							<div>
								<h2 class="text-3xl font-bold text-text-primary">Heading 2 - 3xl Bold</h2>
								<code class="text-sm text-text-secondary">text-3xl font-bold</code>
							</div>
							<div>
								<h3 class="text-2xl font-semibold text-text-primary">Heading 3 - 2xl Semibold</h3>
								<code class="text-sm text-text-secondary">text-2xl font-semibold</code>
							</div>
							<div>
								<h4 class="text-xl font-semibold text-text-primary">Heading 4 - xl Semibold</h4>
								<code class="text-sm text-text-secondary">text-xl font-semibold</code>
							</div>
						</div>
					</div>

					<!-- Body Text -->
					<div>
						<h3 class="text-xl font-semibold mb-4">Body Text</h3>
						<div class="space-y-3">
							<div>
								<p class="text-lg text-text-primary">Large body text - Perfect for important descriptions and highlights.</p>
								<code class="text-sm text-text-secondary">text-lg</code>
							</div>
							<div>
								<p class="text-base text-text-primary">Regular body text - The standard for most content and readable paragraphs.</p>
								<code class="text-sm text-text-secondary">text-base</code>
							</div>
							<div>
								<p class="text-sm text-text-secondary">Small text - Used for secondary information, captions, and metadata.</p>
								<code class="text-sm text-text-secondary">text-sm text-text-secondary</code>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Glassmorphism Effects -->
		<section id="glassmorphism" class="mb-16">
			<h2 class="text-3xl font-bold text-text-primary mb-8">✨ Glassmorphism Effects</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<!-- Standard Glass -->
				<div class="relative">
					<div class="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl"></div>
					<div class="relative bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-skeu">
						<h3 class="text-xl font-semibold mb-3">Standard Glass</h3>
						<p class="text-text-secondary mb-4">Most common glassmorphism effect used throughout the application.</p>
						<code class="text-sm bg-black/10 px-3 py-1 rounded">
							bg-white/85 backdrop-blur-sm border border-white/20
						</code>
					</div>
				</div>

				<!-- Enhanced Glass -->
				<div class="relative">
					<div class="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-xl"></div>
					<div class="relative bg-white/90 backdrop-blur-md border border-white/30 rounded-xl p-6 shadow-skeu-lg">
						<h3 class="text-xl font-semibold mb-3">Enhanced Glass</h3>
						<p class="text-text-secondary mb-4">Higher opacity and stronger blur for prominent elements.</p>
						<code class="text-sm bg-black/10 px-3 py-1 rounded">
							bg-white/90 backdrop-blur-md border border-white/30
						</code>
					</div>
				</div>

				<!-- Subtle Glass -->
				<div class="relative">
					<div class="absolute inset-0 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-xl"></div>
					<div class="relative bg-white/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-sm">
						<h3 class="text-xl font-semibold mb-3">Subtle Glass</h3>
						<p class="text-text-secondary mb-4">Lighter effect for background elements and secondary content.</p>
						<code class="text-sm bg-black/10 px-3 py-1 rounded">
							bg-white/70 backdrop-blur-sm border border-white/10
						</code>
					</div>
				</div>

				<!-- Interactive Glass -->
				<div class="relative cursor-pointer group">
					<div class="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-red-400/20 rounded-xl transition-all duration-300 group-hover:from-yellow-400/30 group-hover:to-red-400/30"></div>
					<div class="relative bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-skeu transition-all duration-300 group-hover:bg-white/90 group-hover:shadow-skeu-lg group-hover:scale-105">
						<h3 class="text-xl font-semibold mb-3">Interactive Glass</h3>
						<p class="text-text-secondary mb-4">Glassmorphism with hover effects for buttons and interactive elements.</p>
						<code class="text-sm bg-black/10 px-3 py-1 rounded">
							hover:bg-white/90 hover:scale-105
						</code>
					</div>
				</div>
			</div>
		</section>

		<!-- Buttons -->
		<section id="buttons" class="mb-16">
			<h2 class="text-3xl font-bold text-text-primary mb-8">🔘 Buttons</h2>
			
			<div class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-skeu">
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					
					<!-- Primary Button -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Primary Button</h3>
						<button class="w-full bg-primary-orange text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-orange/30">
							Start Quiz
						</button>
						<code class="text-xs block text-text-secondary">
							bg-primary-orange text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200
						</code>
					</div>

					<!-- Secondary Button -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Secondary Button</h3>
						<button class="w-full bg-white/85 backdrop-blur-sm border border-white/20 text-text-primary px-6 py-3 rounded-xl font-semibold shadow-skeu hover:bg-white/90 hover:shadow-skeu-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-orange/30">
							View Results
						</button>
						<code class="text-xs block text-text-secondary">
							bg-white/85 backdrop-blur-sm border border-white/20 text-text-primary
						</code>
					</div>

					<!-- Difficulty Button -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Difficulty Button</h3>
						<button class="w-full bg-green-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/30">
							🍃 Neophyte
						</button>
						<code class="text-xs block text-text-secondary">
							bg-green-500 text-white (with emoji icon)
						</code>
					</div>

					<!-- Quiz Answer Button -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Quiz Answer</h3>
						<button class="w-full bg-white/90 backdrop-blur-sm border border-gray-300/60 text-left px-6 py-4 rounded-xl hover:bg-white/95 hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-orange/30">
							<div class="flex items-center gap-4">
								<div class="w-8 h-8 bg-white/90 border border-gray-300/60 rounded-full flex items-center justify-center font-semibold text-sm">A</div>
								<span>Vincent van Gogh</span>
							</div>
						</button>
						<code class="text-xs block text-text-secondary">
							bg-white/90 backdrop-blur-sm with letter indicator
						</code>
					</div>

					<!-- Danger Button -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Danger Button</h3>
						<button class="w-full bg-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/30">
							Delete Item
						</button>
						<code class="text-xs block text-text-secondary">
							bg-red-500 text-white (for destructive actions)
						</code>
					</div>

					<!-- Home Icon Button -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Home Icon Button</h3>
						<button class="w-12 h-12 bg-primary-orange text-white rounded-xl shadow-lg hover:bg-orange-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-orange/30 flex items-center justify-center mx-auto">
							<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
								<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
							</svg>
						</button>
						<code class="text-xs block text-text-secondary">
							Square icon button with SVG home icon
						</code>
					</div>
				</div>
			</div>
		</section>

		<!-- Quiz Components -->
		<section id="quiz-components" class="mb-16">
			<h2 class="text-3xl font-bold text-text-primary mb-8">🎯 Quiz Components</h2>
			
			<div class="space-y-8">
				
				<!-- Quiz Header -->
				<div class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-skeu">
					<h3 class="text-xl font-semibold mb-6">Quiz Header</h3>
					
					<!-- Header Example -->
					<div class="bg-gradient-to-br from-blue-50 to-orange-50 p-4 rounded-xl">
						<div class="flex items-center justify-between mb-2">
							<!-- Home Icon Button -->
							<button class="w-12 h-12 bg-primary-orange text-white rounded-xl shadow-lg hover:bg-orange-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-orange/30 flex items-center justify-center">
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
									<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
								</svg>
							</button>

							<!-- Center Content -->
							<div class="text-center flex-1">
								<h4 class="text-base font-semibold text-text-primary capitalize">Artisan Level</h4>
								<p class="text-sm text-text-secondary">Question 5 of 10</p>
								<!-- Timer Example -->
								<div class="mt-1 h-8 flex justify-center">
									<div class="w-8 h-8 relative">
										<svg class="w-8 h-8 transform -rotate-90" viewBox="0 0 40 40">
											<circle cx="20" cy="20" r="16" stroke="#E5E7EB" stroke-width="3" fill="none"/>
											<circle cx="20" cy="20" r="16" stroke="#FF6B35" stroke-width="3" fill="none" stroke-dasharray="100.53" stroke-dashoffset="50.27" stroke-linecap="round"/>
										</svg>
										<div class="absolute inset-0 flex items-center justify-center">
											<span class="text-sm font-bold text-primary-orange">5</span>
										</div>
									</div>
								</div>
							</div>

							<!-- Score Section -->
							<div class="text-right w-12 flex flex-col items-center">
								<p class="text-xs text-text-secondary">Score</p>
								<p class="text-lg font-bold text-primary-orange">4/4</p>
							</div>
						</div>
						
						<!-- Progress Bar -->
						<div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden backdrop-blur border border-white/20">
							<div class="h-full bg-gradient-to-r from-primary-orange to-blue-500 transition-all duration-500 ease-out" style="width: 50%"></div>
						</div>
					</div>
					
					<code class="text-xs block text-text-secondary mt-4">
						Balanced layout: Home icon (48px) + Center content (flex-1) + Score (48px)
					</code>
				</div>

				<!-- Answer Button States -->
				<div class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-skeu">
					<h3 class="text-xl font-semibold mb-6">Answer Button States</h3>
					
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<!-- Default State -->
						<div class="space-y-3">
							<h4 class="text-sm font-semibold">Default</h4>
							<button class="w-full bg-white/70 backdrop-blur-sm border-2 border-gray-200/70 text-text-primary p-3 rounded-xl transition-all duration-200 hover:bg-white/90 hover:border-primary-orange/50 hover:shadow-lg">
								<div class="flex items-center space-x-3">
									<span class="w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm border-2 border-gray-300/70 flex items-center justify-center text-sm font-semibold shadow-md">A</span>
									<span class="flex-1 text-left">Van Gogh</span>
								</div>
							</button>
						</div>

						<!-- Correct State -->
						<div class="space-y-3">
							<h4 class="text-sm font-semibold">Correct</h4>
							<button class="w-full bg-green-100/90 border-2 border-green-400 text-green-800 p-3 rounded-xl cursor-not-allowed">
								<div class="flex items-center space-x-3">
									<span class="w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm border-2 border-gray-300/70 flex items-center justify-center text-sm font-semibold shadow-md">A</span>
									<span class="flex-1 text-left">Van Gogh</span>
								</div>
							</button>
						</div>

						<!-- Incorrect State -->
						<div class="space-y-3">
							<h4 class="text-sm font-semibold">Incorrect</h4>
							<button class="w-full bg-red-100/90 border-2 border-red-400 text-red-800 p-3 rounded-xl cursor-not-allowed">
								<div class="flex items-center space-x-3">
									<span class="w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm border-2 border-gray-300/70 flex items-center justify-center text-sm font-semibold shadow-md">B</span>
									<span class="flex-1 text-left">Picasso</span>
								</div>
							</button>
						</div>

						<!-- Inactive State -->
						<div class="space-y-3">
							<h4 class="text-sm font-semibold">Inactive</h4>
							<button class="w-full bg-gray-100/50 border-2 border-gray-300/50 text-gray-400 p-3 rounded-xl cursor-not-allowed opacity-40">
								<div class="flex items-center space-x-3">
									<span class="w-8 h-8 rounded-full bg-gray-200/50 border-2 border-gray-300/50 text-gray-400 flex items-center justify-center text-sm font-semibold shadow-md">C</span>
									<span class="flex-1 text-left">Monet</span>
								</div>
							</button>
						</div>
					</div>
					
					<div class="mt-6 pt-4 border-t border-gray-200/50">
						<code class="text-xs block text-text-secondary">
							New inactive state: Non-selected answers become visually muted when user makes a choice
						</code>
					</div>
				</div>
			</div>
		</section>

		<!-- Cards -->
		<section id="cards" class="mb-16">
			<h2 class="text-3xl font-bold text-text-primary mb-8">🃏 Cards</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				
				<!-- Quiz Question Card -->
				<div class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden shadow-skeu hover:shadow-skeu-lg transition-all duration-300">
					<div class="aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
						<div class="text-4xl">🎨</div>
					</div>
					<div class="p-6">
						<h3 class="text-lg font-semibold mb-2">Quiz Question Card</h3>
						<p class="text-text-secondary text-sm mb-4">Standard card for displaying artwork images with glassmorphism effects.</p>
						<div class="text-xs text-text-secondary">
							aspect-[4/3] with rounded corners
						</div>
					</div>
				</div>

				<!-- Difficulty Selection Card -->
				<div class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-skeu hover:shadow-skeu-lg hover:scale-105 transition-all duration-300 cursor-pointer">
					<div class="flex items-center gap-4 mb-4">
						<div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl">
							🍃
						</div>
						<div>
							<h3 class="text-lg font-semibold">Neophyte</h3>
							<p class="text-sm text-text-secondary">Perfect for art beginners</p>
						</div>
					</div>
					<div class="text-xs text-text-secondary">
						Interactive card with hover effects
					</div>
				</div>

				<!-- Results Stats Card -->
				<div class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-skeu">
					<div class="text-center">
						<div class="text-3xl font-bold text-primary-orange mb-2">{sampleScore}/{sampleTotal}</div>
						<div class="text-lg font-semibold text-text-primary mb-1">Excellent!</div>
						<div class="text-sm text-text-secondary mb-4">You scored {Math.round((sampleScore/sampleTotal) * 100)}%</div>
						<div class="w-full bg-gray-200 rounded-full h-2">
							<div class="bg-primary-orange h-2 rounded-full transition-all duration-1000" style="width: {(sampleScore/sampleTotal) * 100}%"></div>
						</div>
					</div>
					<div class="text-xs text-text-secondary mt-4 text-center">
						Results statistics card
					</div>
				</div>
			</div>
		</section>

		<!-- Forms -->
		<section id="forms" class="mb-16">
			<h2 class="text-3xl font-bold text-text-primary mb-8">📝 Forms</h2>
			
			<div class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-skeu">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					
					<!-- Text Input -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Text Input</h3>
						<div>
							<label class="block text-sm font-medium text-text-primary mb-2">Artwork Title</label>
							<input 
								type="text" 
								placeholder="Enter artwork title..."
								class="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange/50 transition-all duration-200"
								value="The Starry Night"
							/>
						</div>
						<code class="text-xs block text-text-secondary">
							bg-white/90 backdrop-blur-sm border border-gray-300/60
						</code>
					</div>

					<!-- Select Dropdown -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Select Dropdown</h3>
						<div>
							<label class="block text-sm font-medium text-text-primary mb-2">Difficulty Level</label>
							<select class="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange/50 transition-all duration-200">
								<option value="1">Neophyte</option>
								<option value="2" selected>Artisan</option>
								<option value="3">Master</option>
							</select>
						</div>
						<code class="text-xs block text-text-secondary">
							Same styling as text input
						</code>
					</div>

					<!-- Textarea -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Textarea</h3>
						<div>
							<label class="block text-sm font-medium text-text-primary mb-2">Description</label>
							<textarea 
								rows="4"
								placeholder="Enter description..."
								class="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange/50 transition-all duration-200 resize-none"
							>A beautiful post-impressionist painting featuring a swirling night sky...</textarea>
						</div>
						<code class="text-xs block text-text-secondary">
							resize-none for consistent layout
						</code>
					</div>

					<!-- File Input -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">File Input</h3>
						<div>
							<label class="block text-sm font-medium text-text-primary mb-2">Upload Image</label>
							<input 
								type="file" 
								accept="image/*"
								class="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange/50 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-orange file:text-white file:cursor-pointer"
							/>
						</div>
						<code class="text-xs block text-text-secondary">
							file: pseudo-element styling for upload button
						</code>
					</div>
				</div>
			</div>
		</section>

		<!-- Spacing -->
		<section id="spacing" class="mb-16">
			<h2 class="text-3xl font-bold text-text-primary mb-8">📐 Spacing & Shadows</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				
				<!-- Spacing Scale -->
				<div class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-skeu">
					<h3 class="text-xl font-semibold mb-6">Spacing Scale</h3>
					<div class="space-y-4">
						<div class="flex items-center gap-4">
							<div class="w-2 h-2 bg-primary-orange"></div>
							<span class="text-sm">0.5rem (2) - Small gaps</span>
						</div>
						<div class="flex items-center gap-4">
							<div class="w-4 h-4 bg-primary-orange"></div>
							<span class="text-sm">1rem (4) - Standard gaps</span>
						</div>
						<div class="flex items-center gap-4">
							<div class="w-6 h-6 bg-primary-orange"></div>
							<span class="text-sm">1.5rem (6) - Section spacing</span>
						</div>
						<div class="flex items-center gap-4">
							<div class="w-8 h-8 bg-primary-orange"></div>
							<span class="text-sm">2rem (8) - Large spacing</span>
						</div>
						<div class="flex items-center gap-4">
							<div class="w-12 h-12 bg-primary-orange"></div>
							<span class="text-sm">3rem (12) - Extra large</span>
						</div>
					</div>
				</div>

				<!-- Shadow Examples -->
				<div class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-skeu">
					<h3 class="text-xl font-semibold mb-6">Shadow System</h3>
					<div class="space-y-6">
						<div class="bg-white p-4 rounded-lg shadow-sm">
							<span class="text-sm font-medium">shadow-sm - Subtle</span>
						</div>
						<div class="bg-white p-4 rounded-lg shadow-skeu">
							<span class="text-sm font-medium">shadow-skeu - Standard</span>
						</div>
						<div class="bg-white p-4 rounded-lg shadow-skeu-lg">
							<span class="text-sm font-medium">shadow-skeu-lg - Enhanced</span>
						</div>
						<div class="bg-white p-4 rounded-lg shadow-skeu-pressed">
							<span class="text-sm font-medium">shadow-skeu-pressed - Pressed state</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Animations -->
		<section id="animations" class="mb-16">
			<h2 class="text-3xl font-bold text-text-primary mb-8">🎬 Animations</h2>
			
			<div class="bg-white/85 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-skeu">
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					
					<!-- Hover Scale -->
					<div class="text-center">
						<h3 class="text-lg font-semibold mb-4">Hover Scale</h3>
						<div class="bg-primary-orange w-16 h-16 rounded-xl mx-auto hover:scale-110 transition-transform duration-200 cursor-pointer"></div>
						<code class="text-xs block text-text-secondary mt-2">
							hover:scale-110 transition-transform duration-200
						</code>
					</div>

					<!-- Fade In -->
					<div class="text-center">
						<h3 class="text-lg font-semibold mb-4">Fade In</h3>
						<div class="bg-green-500 w-16 h-16 rounded-xl mx-auto animate-pulse cursor-pointer"></div>
						<code class="text-xs block text-text-secondary mt-2">
							animate-pulse (or custom fade-in)
						</code>
					</div>

					<!-- Bounce -->
					<div class="text-center">
						<h3 class="text-lg font-semibold mb-4">Bounce</h3>
						<div class="bg-purple-500 w-16 h-16 rounded-xl mx-auto animate-bounce cursor-pointer"></div>
						<code class="text-xs block text-text-secondary mt-2">
							animate-bounce
						</code>
					</div>

					<!-- Rotation -->
					<div class="text-center">
						<h3 class="text-lg font-semibold mb-4">Rotation</h3>
						<div class="bg-teal-500 w-16 h-16 rounded-xl mx-auto hover:rotate-12 transition-transform duration-300 cursor-pointer"></div>
						<code class="text-xs block text-text-secondary mt-2">
							hover:rotate-12 transition-transform duration-300
						</code>
					</div>

					<!-- Shadow Growth -->
					<div class="text-center">
						<h3 class="text-lg font-semibold mb-4">Shadow Growth</h3>
						<div class="bg-red-500 w-16 h-16 rounded-xl mx-auto shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"></div>
						<code class="text-xs block text-text-secondary mt-2">
							hover:shadow-xl transition-shadow duration-300
						</code>
					</div>

					<!-- Combined Effects -->
					<div class="text-center">
						<h3 class="text-lg font-semibold mb-4">Combined Effects</h3>
						<div class="bg-yellow-500 w-16 h-16 rounded-xl mx-auto hover:scale-110 hover:rotate-6 hover:shadow-xl transition-all duration-300 cursor-pointer"></div>
						<code class="text-xs block text-text-secondary mt-2">
							hover:scale-110 hover:rotate-6 hover:shadow-xl transition-all duration-300
						</code>
					</div>
				</div>

				<!-- Timing Guidelines -->
				<div class="mt-12 pt-8 border-t border-gray-200/50">
					<h3 class="text-xl font-semibold mb-4">Animation Timing Guidelines</h3>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div class="text-center">
							<div class="text-2xl font-bold text-primary-orange mb-2">200ms</div>
							<div class="text-sm">Micro-interactions</div>
							<div class="text-xs text-text-secondary">Button hovers, focus states</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-green-500 mb-2">300ms</div>
							<div class="text-sm">Standard transitions</div>
							<div class="text-xs text-text-secondary">Page transitions, modal open/close</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-purple-500 mb-2">500ms+</div>
							<div class="text-sm">Complex animations</div>
							<div class="text-xs text-text-secondary">Loading states, celebrations</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Back to Top -->
		<div class="text-center">
			<a href="#top" class="inline-flex items-center gap-2 bg-primary-orange text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
				↑ Back to Top
			</a>
		</div>
	</div>
</div>

<style>
	/* Smooth scroll behavior */
	html {
		scroll-behavior: smooth;
	}
	
	/* Custom scrollbar */
	::-webkit-scrollbar {
		width: 8px;
	}
	
	::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}
	
	::-webkit-scrollbar-thumb {
		background: rgba(14, 165, 233, 0.5);
		border-radius: 4px;
	}
	
	::-webkit-scrollbar-thumb:hover {
		background: rgba(14, 165, 233, 0.8);
	}
</style>