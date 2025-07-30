<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getQuestionsByDifficulty, getMixQuestions, supabase } from '$lib/supabase.js';
	import { 
		trackPageView, 
		trackQuestionAnswer, 
		trackQuizAbandonment, 
		getCurrentSessionDuration,
		calculateGrade 
	} from '$lib/analytics';
	import QuizPopover from '$lib/components/QuizPopover.svelte';

	// Quiz state
	let currentQuestion = 1;
	let totalQuestions = 10; // Default fallback
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
	
	// Popover state
	let showPopover = false;
	let popoverTitle = '';
	let popoverDescription = '';
	
	
	let popoverTimer = null;
	
	// Get difficulty and language from URL params
	$: difficulty = $page.url.searchParams.get('difficulty') || '1';
	$: level = $page.url.searchParams.get('level') || 'neophyte';
	$: selectedLang = $page.url.searchParams.get('lang') || 'ru';
	$: {
		// Update totalQuestions from URL parameter
		const questionsParam = $page.url.searchParams.get('questions');
		if (questionsParam) {
			totalQuestions = parseInt(questionsParam);
		}
	}

	let answers = [];
	let quizAnswers = []; // Store user answers for review
	let questionStartTime = 0; // Track time spent on each question
	
	// Image loading state
	let imageLoading = true;
	let imageError = false;
	let currentImageUrl = '';
	let imagePreloadCache = new Map(); // Cache for preloaded images

	onMount(async () => {
		// Clear any previous quiz answers
		sessionStorage.removeItem('quizAnswers');
		
		// Track quiz page view
		trackPageView('quiz', selectedLang);
		
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
				questionStartTime = Date.now(); // Track question start time
				
				// Load current image and start preloading
				await loadCurrentImage();
				preloadNextImages();
				
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
				await loadCurrentImage();
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
			await loadCurrentImage();
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

	// Image loading functions
	function preloadImage(url) {
		return new Promise((resolve, reject) => {
			// Check if already cached
			if (imagePreloadCache.has(url)) {
				resolve(imagePreloadCache.get(url));
				return;
			}
			
			const img = new Image();
			img.onload = () => {
				imagePreloadCache.set(url, img);
				resolve(img);
			};
			img.onerror = reject;
			img.src = url;
		});
	}

	async function loadCurrentImage() {
		if (!currentQuestionData?.image_url) return;
		
		const newImageUrl = currentQuestionData.image_url;
		
		// If it's the same image, no need to reload
		if (currentImageUrl === newImageUrl) {
			imageLoading = false;
			return;
		}
		
		// Set loading state
		imageLoading = true;
		imageError = false;
		
		try {
			await preloadImage(newImageUrl);
			// Small delay to ensure smooth transition
			await new Promise(resolve => setTimeout(resolve, 100));
			currentImageUrl = newImageUrl;
			imageLoading = false;
		} catch (error) {
			console.error('Error loading image:', error);
			imageError = true;
			imageLoading = false;
			currentImageUrl = newImageUrl; // Still set the URL to try displaying
		}
	}

	// Preload next images for smoother experience
	function preloadNextImages() {
		if (questions.length === 0) return;
		
		// Preload next 2-3 images
		const preloadCount = Math.min(3, questions.length - currentQuestion);
		for (let i = 0; i < preloadCount; i++) {
			const nextIndex = currentQuestion + i;
			if (nextIndex < questions.length && questions[nextIndex]?.image_url) {
				preloadImage(questions[nextIndex].image_url).catch(() => {
					// Silently fail for preloading - not critical
				});
			}
		}
	}

	function startTimer() {
		// Timer only active on Master difficulty (level 3)
		if (difficulty !== '3') {
			return;
		}
		
		timeLeft = 10;
		isTimerActive = true;
		
		questionTimer = setInterval(() => {
			timeLeft--;
			
			if (timeLeft <= 0) {
				// Timer expired - treat as incorrect answer
				stopTimer();
				selectedAnswer = ''; // No answer selected
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
		
		// Calculate time spent on this question
		const timeToAnswer = (Date.now() - questionStartTime) / 1000; // in seconds
		
		// Check if correct
		const isCorrect = answer === currentQuestionData.correct_answer;
		if (isCorrect) {
			score++;
		}
		
		// Show popover with feedback
		showAnswerPopover(isCorrect);
		
		// Track the answer analytics
		trackQuestionAnswer(
			currentQuestion,
			isCorrect,
			level,
			currentQuestionData.painting_artist || 'Unknown Artist',
			currentQuestionData.painting_title || 'Unknown Artwork',
			timeToAnswer,
			selectedLang
		);
		
		// Clear any existing timer
		if (autoAdvanceTimer) {
			clearTimeout(autoAdvanceTimer);
		}
		
		// Auto-advance - longer delay for incorrect answers to allow reading
		const delay = isCorrect ? 2000 : 5000; // 2s for correct, 5s for incorrect
		autoAdvanceTimer = setTimeout(() => {
			nextQuestion();
		}, delay);
	}

	function showAnswerPopover(isCorrect) {
		// Only show popover for incorrect answers
		if (!isCorrect) {
			popoverTitle = '';
			popoverDescription = `Correct answer is - <strong>${currentQuestionData.correct_answer}</strong>`;
			showPopover = true;
			
			// Clear any existing popover timer
			if (popoverTimer) {
				clearTimeout(popoverTimer);
			}
			
			// Hide popover after 4.5 seconds with fade out (before next question)
			popoverTimer = setTimeout(() => {
				showPopover = false;
			}, 4500);
		}
	}

	function nextQuestion() {
		// Store current answer for review
		if (currentQuestionData) {
			quizAnswers.push({
				questionNumber: currentQuestion,
				paintingTitle: currentQuestionData.painting_title,
				paintingArtist: currentQuestionData.painting_artist,
				imageUrl: currentQuestionData.image_url,
				userAnswer: selectedAnswer || 'No answer (time expired)',
				correctAnswer: currentQuestionData.correct_answer,
				isCorrect: selectedAnswer === currentQuestionData.correct_answer,
				explanation: currentQuestionData.explanation
			});
		}

		// Clear auto-advance timer
		if (autoAdvanceTimer) {
			clearTimeout(autoAdvanceTimer);
			autoAdvanceTimer = null;
		}
		
		// Clear popover timer and hide popover for new question
		if (popoverTimer) {
			clearTimeout(popoverTimer);
			popoverTimer = null;
		}
		showPopover = false;
		
		// Stop any existing question timer
		stopTimer();
		
		if (currentQuestion >= totalQuestions || currentQuestion >= questions.length) {
			// Save quiz answers to sessionStorage for review
			try {
				sessionStorage.setItem('quizAnswers', JSON.stringify(quizAnswers));
			} catch (error) {
				console.error('Error saving quiz answers:', error);
			}
			
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
				questionStartTime = Date.now(); // Reset question start time
				
				// Load new image and continue preloading
				loadCurrentImage();
				preloadNextImages();
				
				startTimer(); // Start timer for new question
			}
		}
	}

	function goHome() {
		// Track quiz abandonment if leaving mid-quiz
		if (currentQuestion < totalQuestions) {
			const sessionDuration = getCurrentSessionDuration();
			trackQuizAbandonment(level, currentQuestion, totalQuestions, sessionDuration, selectedLang);
		}
		
		// Clear quiz answers when going back to home
		sessionStorage.removeItem('quizAnswers');
		goto('/');
	}

	$: progress = (currentQuestion / totalQuestions) * 100;
</script>

<svelte:head>
	<title>Quiz - Guess the Masterpiece</title>
</svelte:head>

<div class="min-h-screen p-2 md:p-4">
	<!-- Header with Progress -->
	<div class="max-w-6xl mx-auto mb-4">
		<div class="flex items-center justify-between mb-2">
			<!-- Home Icon Button -->
			<button 
				class="btn-home-icon w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/30"
				on:click={goHome}
				aria-label="Go home"
			>
				<svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
					<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
				</svg>
			</button>

			<!-- Center Content -->
			<div class="text-center flex-1">
				<h2 class="text-base font-semibold text-text-primary capitalize">{level} Level</h2>
				<p class="text-sm text-text-secondary">Question {currentQuestion} of {totalQuestions}</p>
				<!-- Timer - Fixed container to prevent jump -->
				<div class="mt-1 h-8 flex justify-center">
					{#if difficulty === '3' && isTimerActive && !showResult}
						<div class="w-8 h-8 relative">
							<svg class="w-8 h-8 transform -rotate-90" viewBox="0 0 40 40">
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

			<!-- Score Section -->
			<div class="text-right w-12 flex flex-col items-center">
				<p class="text-xs text-text-secondary">Score</p>
				<p class="text-lg font-bold text-primary-orange">{score}/{currentQuestion - 1}</p>
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
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<!-- Image Section - Now first on mobile -->
				<div class="order-1 lg:order-1 relative">
					<div class="painting-container">
						{#if imageLoading}
							<!-- Skeleton Loading State -->
							<div class="image-skeleton">
								<div class="skeleton-shimmer"></div>
								<div class="absolute inset-0 flex items-center justify-center">
									<div class="flex flex-col items-center space-y-3 text-text-secondary">
										<div class="w-8 h-8 border-3 border-primary-orange border-t-transparent rounded-full animate-spin"></div>
										<p class="text-sm font-medium">Loading artwork...</p>
									</div>
								</div>
							</div>
						{:else if imageError}
							<!-- Error State -->
							<div class="image-error">
								<div class="flex flex-col items-center space-y-3 text-text-secondary">
									<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
									</svg>
									<p class="text-sm font-medium">Unable to load artwork</p>
									<p class="text-xs text-gray-400">Please check your connection</p>
								</div>
							</div>
						{:else}
							<!-- Actual Image with fade-in -->
							<img 
								src={currentImageUrl} 
								alt="Famous painting to identify"
								class="painting-image image-fade-in"
								on:load={() => imageLoading = false}
								on:error={() => {
									imageError = true;
									imageLoading = false;
								}}
							/>
						{/if}
					</div>
					
					<!-- Quiz Popover positioned above painting -->
					<QuizPopover 
						bind:open={showPopover}
						title={popoverTitle}
						description={popoverDescription}
						width="100%"
						on:close={() => showPopover = false}
					>
						{#if currentQuestionData.explanation}
							<div class="mt-3 pt-3 border-t border-blue-200/30">
								<p class="text-sm text-blue-600">
									💡 {currentQuestionData.explanation}
								</p>
							</div>
						{/if}
					</QuizPopover>
				</div>

				<!-- Question Section - Now second on mobile -->
				<div class="order-2 lg:order-2">
					<div class="card h-full flex flex-col">
						<!-- Question -->
						<div class="mb-4 relative">
							<div class="flex items-start gap-3 mb-2">
								<h1 class="text-2xl md:text-3xl font-bold text-text-primary flex-1">
									{currentQuestionData.question_text}
								</h1>
								{#if showPopover}
									<svg 
										class="w-7 h-7 text-amber-500 bulb-icon flex-shrink-0 mt-1" 
										fill="currentColor" 
										viewBox="-4.93 0 122.88 122.88"
									>
										<path d="M44.13,102.06c-1.14,0.03-2.14-0.81-2.3-1.96c-0.17-1.2,0.64-2.31,1.82-2.54c-1.3-7.37-4.85-11.43-8.6-15.72 c-2.92-3.34-5.95-6.81-8.34-11.92c-2.35-5.03-3.64-10.23-3.6-15.63c0.05-5.4,1.42-10.96,4.4-16.71c0.02-0.04,0.04-0.07,0.06-0.11 l0,0c3.91-6.62,9.38-11.04,15.47-13.52c5.11-2.09,10.66-2.8,16.1-2.3c5.42,0.5,10.73,2.2,15.37,4.94 c5.9,3.49,10.75,8.67,13.42,15.21c1.44,3.54,2.42,7.49,2.54,11.82c0.12,4.31-0.62,8.96-2.61,13.88 c-2.66,6.59-6.18,10.68-9.47,14.51c-3.03,3.53-5.85,6.81-7.42,11.84c0.89,0.21,1.59,0.94,1.73,1.9c0.17,1.24-0.7,2.39-1.94,2.56 l-0.77,0.11c-0.14,1.09-0.23,2.26-0.27,3.51l0.25-0.04c1.24-0.17,2.39,0.7,2.56,1.94c0.17,1.24-0.7,2.39-1.94,2.56l-0.78,0.11 c0.01,0.15,0.02,0.3,0.03,0.45l0,0c0.07,0.88,0.08,1.73,0.03,2.54l0.13-0.02c1.25-0.15,2.38,0.74,2.54,1.98 c0.15,1.25-0.74,2.38-1.98,2.54l-1.68,0.21c-1.2,3.11-3.34,5.48-5.87,6.94c-1.74,1.01-3.67,1.59-5.61,1.71 c-1.97,0.12-3.96-0.25-5.78-1.13c-2.08-1.02-3.94-2.71-5.29-5.14c-0.65-0.33-1.13-0.97-1.23-1.75c-0.04-0.31-0.01-0.61,0.07-0.89 c-0.39-1.16-0.68-2.43-0.87-3.83l-0.07,0.01c-1.24,0.17-2.39-0.7-2.56-1.94c-0.17-1.24,0.7-2.39,1.94-2.56l0.54-0.08 C44.19,104.32,44.18,103.16,44.13,102.06L44.13,102.06z M2.18,58.86C1.01,58.89,0.04,57.98,0,56.81c-0.04-1.17,0.88-2.14,2.05-2.18 l8.7-0.3c1.17-0.04,2.14,0.88,2.18,2.05c0.04,1.17-0.88,2.14-2.05,2.18L2.18,58.86L2.18,58.86z M110.68,50.25 c1.16-0.12,2.2,0.73,2.32,1.89c0.12,1.16-0.73,2.2-1.89,2.32l-8.66,0.91c-1.16,0.12-2.2-0.73-2.32-1.89 c-0.12-1.16,0.73-2.2,1.89-2.32L110.68,50.25L110.68,50.25z M94.91,14.78c0.65-0.97,1.96-1.23,2.93-0.58 c0.97,0.65,1.23,1.96,0.58,2.93l-4.84,7.24c-0.65,0.97-1.96,1.23-2.93,0.58c-0.97-0.65-1.23-1.96-0.58-2.93L94.91,14.78 L94.91,14.78z M57.63,2.06c0.03-1.17,1-2.09,2.16-2.06c1.17,0.03,2.09,1,2.06,2.16l-0.22,8.7c-0.03,1.17-1,2.09-2.16,2.06 c-1.17-0.03-2.09-1-2.06-2.16L57.63,2.06L57.63,2.06z M13.88,15.53c-0.86-0.8-0.9-2.14-0.11-2.99c0.8-0.86,2.14-0.9,2.99-0.11 l6.37,5.94c0.86,0.8,0.9,2.14,0.11,2.99c-0.8,0.86-2.14,0.9-2.99,0.11L13.88,15.53L13.88,15.53z M47.88,96.95l18.49-2.63 c1.59-6.7,5.05-10.73,8.8-15.08c3.08-3.58,6.36-7.4,8.76-13.34c1.76-4.35,2.41-8.43,2.31-12.19c-0.1-3.75-0.96-7.21-2.24-10.34 c-2.3-5.63-6.51-10.11-11.65-13.15c-4.11-2.43-8.8-3.94-13.59-4.37c-4.77-0.44-9.64,0.19-14.13,2.02 c-5.26,2.15-9.99,5.97-13.39,11.72c-2.64,5.12-3.86,10.02-3.9,14.73c-0.04,4.74,1.11,9.33,3.2,13.8c2.13,4.56,4.97,7.8,7.69,10.92 C42.47,83.9,46.48,88.49,47.88,96.95L47.88,96.95z M65.62,99.02l-17.27,2.45c0.05,1.1,0.07,2.25,0.05,3.47l17.05-2.42 C65.47,101.29,65.52,100.12,65.62,99.02L65.62,99.02z M48.49,109.52c0.12,0.92,0.3,1.76,0.53,2.54l16.55-2.04 c0.11-0.86,0.13-1.77,0.05-2.74l0,0l0-0.02l-0.01-0.17L48.49,109.52L48.49,109.52z M51.37,116.36c0.64,0.67,1.35,1.19,2.1,1.55 c1.15,0.56,2.42,0.79,3.67,0.72c1.29-0.08,2.57-0.47,3.74-1.15c1.1-0.64,2.09-1.53,2.88-2.65L51.37,116.36L51.37,116.36z"/>
									</svg>
								{/if}
							</div>
						</div>

						<!-- Answer Options -->
						<div class="space-y-2 flex-1">
							{#each answers as answer, index (currentQuestion + '-' + index)}
								<button
									class="btn-answer w-full {selectedAnswer === answer ? (answer === currentQuestionData.correct_answer ? 'correct' : 'incorrect') : (showResult && selectedAnswer !== answer ? 'inactive' : '')}"
									on:click={(event) => {
										event.stopPropagation();
										selectAnswer(answer);
									}}
									disabled={showResult}
								>
									<div class="flex items-center space-x-3">
										<span class="w-8 h-8 rounded-full {showResult && selectedAnswer !== answer ? 'bg-gray-200/50 border-gray-300/50 text-gray-400' : 'bg-white/70 border-gray-300/70'} backdrop-blur-sm border-2 flex items-center justify-center text-sm font-semibold shadow-md">
											{String.fromCharCode(65 + index)}
										</span>
										<span class="flex-1 text-left">{answer}</span>
									</div>
								</button>
							{/each}
						</div>


					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.progress-bar {
		@apply w-full bg-gray-200 rounded-full h-2 overflow-hidden;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.progress-fill {
		@apply h-full bg-gradient-to-r from-primary-orange to-blue-500 transition-all duration-500 ease-out;
	}

	.card {
		@apply bg-white/85 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20;
	}

	.btn-primary {
		@apply bg-primary-orange text-white font-medium;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.btn-primary:hover {
		@apply bg-orange-600;
	}

	.btn-home-icon {
		@apply bg-primary-orange text-white;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.btn-home-icon:hover {
		@apply bg-orange-600;
		transform: scale(1.05);
	}

	.painting-container {
		@apply bg-white/90 backdrop-blur-lg rounded-2xl p-3 shadow-xl border border-white/20 h-full;
	}

	.painting-image {
		@apply w-full h-auto rounded-xl shadow-lg transition-transform duration-300 hover:scale-105;
		max-height: 400px;
		object-fit: contain;
	}

	.btn-answer {
		@apply bg-white/70 backdrop-blur-sm border-2 border-gray-200/70 text-text-primary p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-orange/30;
	}
	
	.btn-answer:hover:not(.correct):not(.incorrect):not(.inactive) {
		@apply bg-white/90 border-primary-orange/50 shadow-lg;
	}

	.btn-answer.correct {
		@apply bg-green-100/90 border-green-400 text-green-800;
	}

	.btn-answer.incorrect {
		@apply bg-red-100/90 border-red-400 text-red-800;
	}

	.btn-answer.inactive {
		@apply bg-gray-100/50 border-gray-300/50 text-gray-400;
		opacity: 0.4;
		transform: none !important;
		box-shadow: none !important;
	}

	.btn-answer.inactive:hover {
		@apply bg-gray-100/50 border-gray-300/50;
		transform: none !important;
		box-shadow: none !important;
	}

	.btn-answer:disabled {
		@apply cursor-not-allowed;
	}

	.bulb-icon {
		@apply transition-all duration-200 hover:text-amber-600;
		drop-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
	}
	
	.bulb-icon:hover {
		drop-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
		transform: scale(1.05);
	}

	/* Image Loading States */
	.image-skeleton {
		@apply w-full rounded-xl relative overflow-hidden bg-gray-200/50;
		min-height: 300px;
		max-height: 400px;
	}

	.skeleton-shimmer {
		@apply absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent;
		animation: shimmer 2s infinite linear;
	}

	.image-error {
		@apply w-full rounded-xl flex items-center justify-center bg-gray-100/50;
		min-height: 300px;
		max-height: 400px;
	}

	.image-fade-in {
		animation: fadeIn 0.3s ease-in-out;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>