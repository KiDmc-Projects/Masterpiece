<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getQuestionsByDifficulty, getMixQuestions, supabase } from '$lib/supabase.js';

	// Quiz state
	let currentQuestion = 1;
	let totalQuestions = 10;
	let score = 0;
	let selectedAnswer = '';
	let showResult = false;
	let isLoading = true;
	let questions = [];
	let currentQuestionData = null;
	let autoAdvanceTimer = null;
	
	// Timer state
	let timeLeft = 10;
	let questionTimer = null;
	let isTimerActive = false;
	
	// Get difficulty and language from URL params
	$: difficulty = $page.url.searchParams.get('difficulty') || '1';
	$: level = $page.url.searchParams.get('level') || 'neophyte';
	$: selectedLang = $page.url.searchParams.get('lang') || 'ru';

	let answers = [];

	onMount(async () => {
		try {
			console.log('Loading questions for difficulty:', difficulty);
			console.log('Supabase URL:', import.meta.env.VITE_PUBLIC_SUPABASE_URL || 'NOT SET');
			
			// Test basic connection first
			const { data: testData, error: testError } = await supabase
				.from('difficulty_levels')
				.select('*')
				.limit(1);
			
			console.log('Connection test result:', { testData, testError });
			
			// Load questions based on difficulty
			if (difficulty === '4') {
				// Mix difficulty - get random questions from all levels
				console.log('Fetching mix questions...');
				questions = await getMixQuestions(totalQuestions, selectedLang);
			} else {
				// Specific difficulty level
				console.log('Fetching questions for difficulty level:', parseInt(difficulty));
				questions = await getQuestionsByDifficulty(parseInt(difficulty), totalQuestions, selectedLang);
			}
			
			console.log('Questions loaded:', questions);
			console.log('Questions length:', questions.length);
			
			if (questions.length > 0) {
				currentQuestionData = questions[0];
				updateAnswers();
				startTimer(); // Start timer for first question
				console.log('Current question data:', currentQuestionData);
			} else {
				console.error('No questions loaded - database might be empty');
				// Fallback to mock data for testing
				currentQuestionData = {
					id: '1',
					question_text: 'Who painted this masterpiece?',
					painting_title: 'Test Artwork',
					painting_artist: 'Test Artist',
					image_url: 'https://via.placeholder.com/400x300?text=No+Database+Data',
					correct_answer: 'Test Artist',
					option_a: 'Test Artist',
					option_b: 'Wrong Artist 1',
					option_c: 'Wrong Artist 2',
					explanation: 'Database is empty. Please run the SQL statements to populate your artwork data.'
				};
				updateAnswers();
				startTimer(); // Start timer for fallback question
			}
		} catch (error) {
			console.error('Error loading questions:', error);
			// Fallback to mock data on error
			currentQuestionData = {
				id: '1',
				question_text: 'Database Error - Who painted this masterpiece?',
				painting_title: 'Test Artwork',
				painting_artist: 'Test Artist',
				image_url: 'https://via.placeholder.com/400x300?text=Database+Error',
				correct_answer: 'Test Artist',
				option_a: 'Test Artist',
				option_b: 'Wrong Artist 1',
				option_c: 'Wrong Artist 2',
				explanation: 'Error connecting to database: ' + error.message
			};
			updateAnswers();
			startTimer(); // Start timer for error fallback question
		} finally {
			isLoading = false;
		}
	});

	function updateAnswers() {
		if (currentQuestionData) {
			// Create answers array with all unique options
			answers = [
				currentQuestionData.option_a,
				currentQuestionData.option_b,
				currentQuestionData.option_c
			];
			
			// Remove duplicates and ensure we have the correct answer included
			answers = [...new Set(answers)];
			
			// Make sure correct answer is included (replace one option if needed)
			if (!answers.includes(currentQuestionData.correct_answer)) {
				answers[0] = currentQuestionData.correct_answer;
			}
			
			// Shuffle answers so correct answer isn't always in same position
			answers = answers.sort(() => Math.random() - 0.5);
		}
	}

	function startTimer() {
		timeLeft = 10;
		isTimerActive = true;
		
		questionTimer = setInterval(() => {
			timeLeft--;
			
			if (timeLeft <= 0) {
				// Timer expired - treat as incorrect answer
				stopTimer();
				showResult = true;
				// Auto-advance after 2 seconds
				autoAdvanceTimer = setTimeout(() => {
					nextQuestion();
				}, 2000);
			}
		}, 1000);
	}

	function stopTimer() {
		if (questionTimer) {
			clearInterval(questionTimer);
			questionTimer = null;
		}
		isTimerActive = false;
	}

	function selectAnswer(answer) {
		if (showResult) return;
		
		stopTimer(); // Stop the question timer
		selectedAnswer = answer;
		showResult = true;
		
		// Check if correct
		if (answer === currentQuestionData.correct_answer) {
			score++;
		}
		
		// Clear any existing timer
		if (autoAdvanceTimer) {
			clearTimeout(autoAdvanceTimer);
		}
		
		// Auto-advance after 2 seconds
		autoAdvanceTimer = setTimeout(() => {
			nextQuestion();
		}, 2000);
	}

	function nextQuestion() {
		// Clear auto-advance timer
		if (autoAdvanceTimer) {
			clearTimeout(autoAdvanceTimer);
			autoAdvanceTimer = null;
		}
		
		// Stop any existing question timer
		stopTimer();
		
		if (currentQuestion >= totalQuestions || currentQuestion >= questions.length) {
			// Go to results page
			goto(`/results?score=${score}&total=${totalQuestions}&level=${level}`);
		} else {
			currentQuestion++;
			selectedAnswer = '';
			showResult = false;
			// Load next question from array
			if (questions[currentQuestion - 1]) {
				currentQuestionData = questions[currentQuestion - 1];
				updateAnswers();
				startTimer(); // Start timer for new question
			}
		}
	}

	function goHome() {
		goto('/');
	}

	$: progress = (currentQuestion / totalQuestions) * 100;
</script>

<svelte:head>
	<title>Quiz - Guess the Masterpiece</title>
</svelte:head>

<div class="min-h-screen p-4">
	<!-- Header with Progress -->
	<div class="max-w-6xl mx-auto mb-8">
		<div class="flex items-center justify-between mb-4">
			<button 
				class="btn-primary px-4 py-2 text-sm rounded-xl transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/30"
				on:click={goHome}
			>
				← Home
			</button>
			<div class="text-center">
				<h2 class="text-lg font-semibold text-text-primary capitalize">{level} Level</h2>
				<p class="text-text-secondary">Question {currentQuestion} of {totalQuestions}</p>
				<!-- Timer - Fixed container to prevent jump -->
				<div class="mt-2 h-12 flex justify-center">
					{#if isTimerActive && !showResult}
						<div class="w-12 h-12 relative">
							<svg class="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
								<!-- Background circle -->
								<circle cx="20" cy="20" r="16" stroke="#E5E7EB" stroke-width="3" fill="none"/>
								<!-- Timer circle -->
								<circle 
									cx="20" 
									cy="20" 
									r="16" 
									stroke={timeLeft <= 4 ? "#EF4444" : "#FF6B35"} 
									stroke-width="3" 
									fill="none" 
									stroke-dasharray="100.53" 
									stroke-dashoffset={100.53 - (timeLeft / 10) * 100.53}
									stroke-linecap="round"
									class="transition-all duration-1000 ease-linear"
								/>
							</svg>
							<div class="absolute inset-0 flex items-center justify-center">
								<span class="text-sm font-bold {timeLeft <= 4 ? 'text-red-500' : 'text-primary-orange'}">{timeLeft}</span>
							</div>
						</div>
					{/if}
				</div>
			</div>
			<div class="text-right">
				<p class="text-sm text-text-secondary">Score</p>
				<p class="text-xl font-bold text-primary-orange">{score}/{currentQuestion - 1}</p>
			</div>
		</div>
		
		<!-- Progress Bar -->
		<div class="progress-bar">
			<div class="progress-fill" style="width: {progress}%"></div>
		</div>
	</div>

	{#if isLoading}
		<!-- Loading State -->
		<div class="max-w-6xl mx-auto flex items-center justify-center">
			<div class="card text-center">
				<div class="animate-spin w-8 h-8 border-4 border-primary-orange border-t-transparent rounded-full mx-auto mb-4"></div>
				<p class="text-text-secondary">Loading next question...</p>
			</div>
		</div>
	{:else}
		<!-- Quiz Content -->
		<div class="max-w-6xl mx-auto">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<!-- Image Section -->
				<div class="order-2 lg:order-1">
					<div class="painting-container">
						<img 
							src={currentQuestionData.image_url} 
							alt="Famous painting to identify"
							class="painting-image"
						/>
					</div>
				</div>

				<!-- Question Section -->
				<div class="order-1 lg:order-2">
					<div class="card h-full flex flex-col">
						<!-- Question -->
						<div class="mb-6">
							<h1 class="text-2xl md:text-3xl font-bold text-text-primary mb-4">
								{currentQuestionData.question_text}
							</h1>
						</div>

						<!-- Answer Options -->
						<div class="space-y-3 flex-1">
							{#each answers as answer, index}
								<button
									class="btn-answer w-full {selectedAnswer === answer ? (answer === currentQuestionData.correct_answer ? 'correct' : 'incorrect') : ''}"
									on:click={() => selectAnswer(answer)}
									disabled={showResult}
								>
									<div class="flex items-center space-x-3">
										<span class="w-8 h-8 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center text-sm font-semibold shadow-sm">
											{String.fromCharCode(65 + index)}
										</span>
										<span class="flex-1 text-left">{answer}</span>
									</div>
								</button>
							{/each}
						</div>

						<!-- Explanation (shown after answer) -->
						{#if showResult}
							<div class="mt-6 p-4 bg-gray-50 rounded-xl">
								<h3 class="font-semibold text-text-primary mb-2">
									{selectedAnswer === currentQuestionData.correct_answer ? '✅ Correct!' : '❌ Incorrect'}
								</h3>
								<p class="text-text-secondary text-sm">
									{currentQuestionData.explanation}
								</p>
							</div>
						{/if}

					</div>
				</div>
			</div>
		</div>
	{/if}
</div>