<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { language } from '$lib/language.js';
	import { initializeSessionTracking, trackPageView, trackDifficultySelection, DIFFICULTY_LEVELS } from '$lib/analytics';
	import { user, session, loading as authLoading, initializeAuth, authService } from '$lib/auth';
	import LoginModal from '$lib/components/LoginModal.svelte';

	let currentLanguage = 'ru';
	
	// Settings modal state
	let showSettingsModal = false;
	
	// Login modal state
	let showLoginModal = false;
	
	// Avatar loading state
	let avatarLoadError = false;
	
	// User dropdown state
	let showUserDropdown = false;
	
	// Onboarding modal state
	let showOnboardingModal = false;
	let onboardingStep = 1;
	
	// Notification state
	let showSuccessNotification = false;
	let notificationTimer = null;
	
	// Quiz settings with defaults
	let quizSettings = {
		questionCount: 10, // Default: 10 questions
		artMovements: [], // Will implement later
		difficulty: null // Will use existing difficulty system
	};

	// Subscribe to language changes
	language.subscribe(value => {
		currentLanguage = value;
	});

	onMount(() => {
		language.init();
		initializeAuth();
		initializeSessionTracking();
		trackPageView('homepage', currentLanguage);
		
		// Load quiz settings from localStorage
		loadQuizSettings();
	});
	
	function loadQuizSettings() {
		try {
			const savedSettings = localStorage.getItem('quizSettings');
			if (savedSettings) {
				quizSettings = { ...quizSettings, ...JSON.parse(savedSettings) };
			}
		} catch (error) {
			console.error('Error loading quiz settings:', error);
		}
	}
	
	function saveQuizSettings() {
		try {
			localStorage.setItem('quizSettings', JSON.stringify(quizSettings));
		} catch (error) {
			console.error('Error saving quiz settings:', error);
		}
	}

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
		// Track difficulty selection
		const difficultyLevel = difficulty.name.toLowerCase();
		trackDifficultySelection(difficultyLevel, currentLanguage);
		
		// Include question count in URL parameters
		goto(`/quiz?difficulty=${difficulty.id}&level=${difficultyLevel}&lang=${currentLanguage}&questions=${quizSettings.questionCount}`);
	}

	function switchLanguage(lang) {
		language.setLanguage(lang);
	}

	function openSettings() {
		showSettingsModal = true;
	}
	
	function closeSettings() {
		showSettingsModal = false;
	}
	
	function updateQuestionCount(count) {
		quizSettings.questionCount = count;
		saveQuizSettings();
	}
	
	function showNotification() {
		// Clear any existing timer
		if (notificationTimer) {
			clearTimeout(notificationTimer);
		}
		
		showSuccessNotification = true;
		
		// Auto-hide after 3 seconds
		notificationTimer = setTimeout(() => {
			showSuccessNotification = false;
		}, 3000);
	}
	
	function applySettings() {
		// Close modal and show success notification
		closeSettings();
		showNotification();
	}
	
	// Onboarding functions
	function openOnboarding() {
		showOnboardingModal = true;
		onboardingStep = 1;
	}
	
	function closeOnboarding() {
		showOnboardingModal = false;
	}
	
	function nextStep() {
		if (onboardingStep < onboardingSteps.length) {
			onboardingStep++;
		}
	}
	
	function skipOnboarding() {
		closeOnboarding();
	}

	
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
	
	// Close dropdown when clicking outside
	function handleClickOutside(event) {
		if (showUserDropdown) {
			const dropdown = event.target.closest('.user-dropdown-container');
			if (!dropdown) {
				showUserDropdown = false;
			}
		}
	}
	
	// Onboarding content
	const onboardingSteps = [
		{
			title: "Choose Your Level",
			description: "Select from four difficulty levels: Neophyte for beginners, Artisan for enthusiasts, Master for experts, or Mix for variety.",
			icon: "level"
		},
		{
			title: "Answer Art Questions", 
			description: "Test your knowledge with questions about famous paintings, artists, and art movements from around the world.",
			icon: "art"
		},
		{
			title: "Get Instant Feedback",
			description: "Receive immediate feedback on your answers with explanations to help you learn and improve your art knowledge.",
			icon: "feedback"
		},
		{
			title: "Track Your Progress",
			description: "See your scores, review your answers, and celebrate your achievements with beautiful animations.",
			icon: "progress"
		}
	];

	function getIcon(iconName) {
		const icons = {
			leaf: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.8,18.1L14.6,12l3.2-6.1c0.1-0.2,0.2-0.5,0-0.7s-0.5-0.2-0.7,0L12,10.7L6.9,5.2c-0.2-0.2-0.5-0.2-0.7,0 s-0.2,0.5,0,0.7L9.4,12l-3.2,6.1c-0.1,0.2-0.2,0.5,0,0.7s0.5,0.2,0.7,0L12,13.3l5.1,5.5c0.2,0.2,0.5,0.2,0.7,0 S17.9,18.3,17.8,18.1z"/></svg>`,
			palette: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2C6.49,2,2,6.49,2,12s4.49,10,10,10c1.38,0,2.5-1.12,2.5-2.5c0-0.61-0.23-1.15-0.59-1.56 c-0.36-0.41-0.59-0.94-0.59-1.56c0-1.38,1.12-2.5,2.5-2.5h2.95C19.8,14.37,22,12.17,22,9.5C22,5.36,17.64,2,12,2z M6.5,12 c-0.83,0-1.5-0.67-1.5-1.5S5.67,9,6.5,9S8,9.67,8,10.5S7.33,12,6.5,12z M9.5,8C8.67,8,8,7.33,8,6.5S8.67,5,9.5,5S11,5.67,11,6.5 S10.33,8,9.5,8z M14.5,8c-0.83,0-1.5-0.67-1.5-1.5S13.67,5,14.5,5S16,5.67,16,6.5S15.33,8,14.5,8z M17.5,12 c-0.83,0-1.5-0.67-1.5-1.5S16.67,9,17.5,9S19,9.67,19,10.5S18.33,12,17.5,12z"/></svg>`,
			crown: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12,5L16,11L20,8L19,19H5L4,8L8,11L12,5M12,2L6,8L2,5L4,21H20L22,5L18,8L12,2Z"/></svg>`,
			shuffle: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14.83,13.41L13.42,14.82L16.55,17.95L14.5,20H20V14.5L17.96,16.54L14.83,13.41M14.5,4L16.54,6.04L4,18.59L5.41,20L17.96,7.46L20,9.5V4M10.59,9.17L5.41,4L4,5.41L9.17,10.59L10.59,9.17Z"/></svg>`,
			// Onboarding icons
			target: `<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z"/></svg>`,
			trophy: `<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15H17A5,5 0 0,1 12,20A5,5 0 0,1 7,15M12,23A1,1 0 0,1 11,22H13A1,1 0 0,1 12,23M12,2L13.09,8.26L22,9L17,14L18.18,23L12,19.77L5.82,23L7,14L2,9L10.91,8.26L12,2Z"/></svg>`,
			chart: `<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z"/></svg>`
		};
		return icons[iconName] || '';
	}
	
	function getOnboardingIcon(iconName) {
		const onboardingIcons = {
			level: `<svg style="width: 100%; height: 100%;" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
				<path style="fill:#547475;" d="M156.563,503.916h-34.716c-13.147,0-23.809-10.66-23.809-23.807V31.892
					c0-13.148,10.661-23.807,23.809-23.807h268.307c13.147,0,23.806,10.659,23.806,23.807v448.217c0,13.147-10.659,23.807-23.806,23.807
					H180.272"/>
				<polyline style="fill:#53CAF9;" points="377.355,105.095 377.355,287.355 134.645,287.355 134.645,44.84 377.355,44.84 
					377.355,81.381 "/>
				<g style="opacity:0.2;">
					<rect x="134.651" y="44.84" style="fill:#231F20;" width="25.26" height="242.516"/>
				</g>
				<g>
					<rect x="230.184" y="103.801" style="fill:#EBF25F;" width="29.775" height="29.775"/>
					<rect x="259.967" y="133.573" style="fill:#EBF25F;" width="29.777" height="29.775"/>
					<rect x="259.967" y="163.344" style="fill:#EBF25F;" width="29.777" height="29.775"/>
					<rect x="259.967" y="193.126" style="fill:#EBF25F;" width="29.777" height="29.775"/>
					<rect x="134.651" y="257.585" style="fill:#EBF25F;" width="29.775" height="29.776"/>
					<rect x="164.422" y="257.585" style="fill:#EBF25F;" width="29.775" height="29.776"/>
					<rect x="164.422" y="227.802" style="fill:#EBF25F;" width="29.775" height="29.776"/>
					<rect x="164.422" y="198.031" style="fill:#EBF25F;" width="29.775" height="29.776"/>
					<rect x="194.194" y="257.585" style="fill:#EBF25F;" width="29.775" height="29.776"/>
					<rect x="347.578" y="227.802" style="fill:#EBF25F;" width="29.775" height="29.776"/>
					<rect x="317.806" y="257.585" style="fill:#EBF25F;" width="29.775" height="29.776"/>
					<rect x="347.578" y="257.585" style="fill:#EBF25F;" width="29.775" height="29.776"/>
				</g>
				<g>
					<circle style="fill:#EFBA00;" cx="357.182" cy="358.228" r="20.164"/>
					<circle style="fill:#EFBA00;" cx="318.906" cy="416.994" r="20.164"/>
				</g>
				<polygon style="fill:#F74848;" points="215.302,374.877 189.435,374.877 189.435,349.009 160.513,349.009 160.513,374.877 
					134.645,374.877 134.645,403.798 160.513,403.798 160.513,429.665 189.435,429.665 189.435,403.798 215.302,403.798 "/>
			</svg>`,
			art: `<svg style="width: 100%; height: 100%;" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
				<path d="M49.6 23.6C58.4 8.5 40.3-1.3 17.3 9.2C3.2 15.7-6.6 35.7 13 52.9c13.9 12.2 49 5.3 49-8.7c0-15.5-21.7-4.8-12.4-20.6m4.9 24.6c-2.8 2.4-7.2 2.4-10 0s-2.8-4.5 0-6.9c2.8-2.4 7.2-2.4 10 0s2.7 4.5 0 6.9" fill="#f6c799"/>
				<path d="M33.2 45.1c-3.1-2.4-8-2.4-11.1 0c-3.1 2.4-3.1 6.2 0 8.6s8 2.4 11.1 0c3-2.4 3-6.3 0-8.6" fill="#2caece"/>
				<path d="M19.6 33.6c-3.4-1.6-8-.6-10.4 2.3c-2.4 2.9-1.6 6.5 1.8 8.1c3.4 1.6 8 .6 10.4-2.3c2.4-2.9 1.6-6.5-1.8-8.1" fill="#fdf516"/>
				<path d="M17 20.6c-2.9-1.6-7.2-.9-9.4 1.6c-2.3 2.5-1.7 5.8 1.2 7.3c2.9 1.6 7.2.9 9.4-1.6s1.7-5.7-1.2-7.3" fill="#f55"/>
				<path d="M28.4 10.8c-2.8-1.6-6.9-1-9.1 1.4s-1.8 5.5 1.1 7.1c2.8 1.6 6.9 1 9.1-1.4s1.7-5.6-1.1-7.1" fill="#83bf4f"/>
				<path d="M44.7 9.7c-2.2-1.8-5.9-2.2-8.5-1c-2.5 1.2-2.8 3.7-.6 5.5c2.2 1.8 5.9 2.2 8.5 1c2.5-1.3 2.7-3.7.6-5.5" fill="#9156b7"/>
				<path d="M40 42.1c-1.9 2.1-11.5 4-11.5 4s3.8-3.5 5.5-9.2c.8-2.7 4.7-2.7 6.4-1.2c1.7 1.4 1.5 4.3-.4 6.4" fill="#947151"/>
				<path d="M58.7 12.3c1-.1 2.9 1.6 3 2.5C62 19.1 44 34.5 44 34.5L41 32s13.3-19.4 17.7-19.7" fill="#666"/>
				<path fill="#ccc" d="M38.4 34.9l3 2.5l2.6-2.9l-3-2.5z"/>
			</svg>`,
			feedback: `<svg style="width: 100%; height: 100%;" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
				<style>
					.st0{fill:#F5C0C0;}
					.st1{fill:#FF7171;}
					.st2{fill:#FFFFFF;}
				</style>
				<path class="st0" d="M58.5,43.2C59,55.8,69.2,66.2,81.7,67.2c3.5,0.2,7-0.2,10.2-1.2c1.7-0.6,8,2.6,11.6,4.4c0.9,0.4,2-0.4,1.6-1.4   c-1.3-3.5-3.2-9.2-2.3-10.2c4.3-4.9,6.8-11.5,6.3-18.7c-0.9-12.6-11.4-22.8-24.1-23.4C70.1,15.9,57.8,28.2,58.5,43.2z"/>
				<path class="st1" d="M82.2,64.8c-0.8,17.8-15.1,32.5-32.8,33.9c-5,0.3-9.8-0.3-14.4-1.7c-2.3-0.8-11.2,3.6-16.4,6.2   c-1.2,0.6-2.8-0.6-2.2-2c1.9-5,4.5-12.9,3.3-14.4c-6.1-6.9-9.5-16.2-8.9-26.4C12.1,42.7,27,28.3,44.8,27.5   C65.8,26.4,83.1,43.8,82.2,64.8z"/>
				<g>
					<path class="st2" d="M37.4,53.4h18.4c1.2,0,2.3-1.1,2.3-2.3s-1.1-2.3-2.3-2.3H37.4c-1.2,0-2.3,1.1-2.3,2.3    C34.9,52.3,36,53.4,37.4,53.4z"/>
					<path class="st2" d="M55.8,72.6H37.4c-1.2,0-2.3,1.1-2.3,2.3s1.1,2.3,2.3,2.3h18.4c1.2,0,2.3-1.1,2.3-2.3    C58.2,73.7,57.1,72.6,55.8,72.6z"/>
					<path class="st2" d="M65.2,60.6H27.9c-1.2,0-2.3,1.1-2.3,2.3s1.1,2.3,2.3,2.3H65c1.2,0,2.3-1.1,2.3-2.3    C67.5,61.7,66.4,60.6,65.2,60.6z"/>
				</g>
			</svg>`,
			progress: `<svg style="width: 100%; height: 100%;" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
				<rect x="8.477" y="58.896" style="fill:#B27214;" width="494.383" height="393.533"/>
				<rect x="46.373" y="96.804" style="fill:#F95428;" width="419.246" height="318.396"/>
				<rect x="46.373" y="296.063" style="fill:#2197D8;" width="419.246" height="119.137"/>
				<g>
					<polyline style="fill:#F7B239;" points="422.517,415.201 333.605,296.068 178.395,296.068 89.483,415.201"/>
					<path style="fill:#F7B239;" d="M345.849,296.068c0-49.621-40.227-89.848-89.848-89.848s-89.848,40.227-89.848,89.848"/>
				</g>
				<g>
					<path style="fill:#333333;" d="M503.523,50.424H8.477C3.795,50.424,0,54.219,0,58.901v394.199c0,4.681,3.795,8.477,8.477,8.477
						h495.047c4.681,0,8.477-3.795,8.477-8.477V58.901C512,54.219,508.205,50.424,503.523,50.424z M462.114,88.323H49.887L28.942,67.377
						h454.118L462.114,88.323z M457.148,105.276v301.448H54.852V105.276H457.148z M37.899,100.311V411.69l-20.945,20.945V79.364
						L37.899,100.311z M49.887,423.677h412.227l20.945,20.945H28.941L49.887,423.677z M474.101,411.69V100.311l20.945-20.945v353.27
						L474.101,411.69z"/>
					<path style="fill:#333333;" d="M80.811,304.545h350.377c4.681,0,8.477-3.795,8.477-8.477s-3.795-8.477-8.477-8.477h-77.233
						c-4.313-50.262-46.595-89.848-97.956-89.848s-93.643,39.586-97.956,89.848H80.811c-4.681,0-8.477,3.795-8.477,8.477
						S76.13,304.545,80.811,304.545z M255.999,214.696c42.006,0,76.676,31.996,80.93,72.895H175.071
						C179.324,246.692,213.993,214.696,255.999,214.696z"/>
				</g>
				<g>
					<path style="fill:#FFFFFF;" d="M363.792,339.499c0.52,0.203,1.051,0.373,1.594,0.475c0.543,0.113,1.096,0.17,1.65,0.17
						s1.108-0.056,1.661-0.17c0.543-0.102,1.074-0.271,1.582-0.475c0.509-0.215,1.006-0.475,1.469-0.78
						c0.463-0.316,0.893-0.667,1.277-1.062c0.396-0.384,0.746-0.825,1.062-1.288c0.305-0.452,0.565-0.949,0.78-1.458
						c0.203-0.509,0.373-1.051,0.475-1.582c0.113-0.554,0.17-1.108,0.17-1.661s-0.056-1.108-0.17-1.65
						c-0.102-0.543-0.271-1.085-0.475-1.594c-0.215-0.509-0.475-1.006-0.78-1.458c-0.316-0.463-0.667-0.904-1.062-1.288
						c-0.384-0.396-0.814-0.746-1.277-1.051s-0.961-0.576-1.469-0.78c-0.509-0.215-1.04-0.384-1.582-0.486
						c-1.096-0.226-2.227-0.226-3.312,0c-0.543,0.102-1.074,0.271-1.594,0.486c-0.509,0.203-1.006,0.475-1.458,0.78
						c-0.463,0.305-0.904,0.656-1.288,1.051c-0.396,0.384-0.746,0.825-1.051,1.288c-0.305,0.452-0.576,0.949-0.78,1.458
						c-0.215,0.509-0.384,1.051-0.486,1.594c-0.113,0.543-0.17,1.096-0.17,1.65c0,2.238,0.904,4.419,2.487,5.99
						c0.384,0.396,0.825,0.746,1.288,1.062C362.788,339.026,363.285,339.286,363.792,339.499z"/>
					<path style="fill:#FFFFFF;" d="M335.813,340.145c4.681,0,8.477-3.795,8.477-8.477s-3.795-8.477-8.477-8.477h-85.327
						c-4.681,0-8.477,3.795-8.477,8.477s3.795,8.477,8.477,8.477H335.813z"/>
					<path style="fill:#FFFFFF;" d="M222.231,340.145c4.681,0,8.477-3.795,8.477-8.477s-3.795-8.477-8.477-8.477h-77.269
						c-4.681,0-8.477,3.795-8.477,8.477s3.795,8.477,8.477,8.477H222.231z"/>
					<path style="fill:#FFFFFF;" d="M390.061,357.097H318.86c-4.681,0-8.477,3.795-8.477,8.477s3.795,8.477,8.477,8.477h71.201
						c4.681,0,8.477-3.795,8.477-8.477S394.743,357.097,390.061,357.097z"/>
					<path style="fill:#FFFFFF;" d="M290.041,357.097h-89.848c-4.681,0-8.477,3.795-8.477,8.477s3.795,8.477,8.477,8.477h89.848
						c4.681,0,8.477-3.795,8.477-8.477S294.722,357.097,290.041,357.097z"/>
					<path style="fill:#FFFFFF;" d="M166.287,357.097H121.94c-4.681,0-8.477,3.795-8.477,8.477s3.795,8.477,8.477,8.477h44.348
						c4.681,0,8.477-3.795,8.477-8.477S170.969,357.097,166.287,357.097z"/>
				</g>
				<g>
					<path style="fill:#333333;" d="M110.344,186.216h37.295c4.681,0,8.477-3.795,8.477-8.477c0-4.681-3.795-8.477-8.477-8.477h-37.295
						c-4.681,0-8.477,3.795-8.477,8.477C101.867,182.421,105.663,186.216,110.344,186.216z"/>
					<path style="fill:#333333;" d="M344.289,172.653h37.295c4.681,0,8.477-3.795,8.477-8.477c0-1.91-0.64-3.668-1.707-5.085h18.659
						c4.681,0,8.477-3.795,8.477-8.477c0-4.681-3.795-8.477-8.477-8.477h-37.296c-4.681,0-8.477,3.795-8.477,8.477
						c0,1.91,0.64,3.668,1.707,5.085h-18.658c-4.681,0-8.477,3.795-8.477,8.477S339.608,172.653,344.289,172.653z"/>
				</g>
			</svg>`
		};
		return onboardingIcons[iconName] || '';
	}
</script>

<svelte:head>
	<title>Masterpiece - Art Quiz Game</title>
	<meta name="description" content="Test your knowledge of famous paintings with our interactive art quiz game." />
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4 pt-2 pb-8" on:click={handleClickOutside}>
	<div class="w-full max-w-4xl mx-auto text-center">
		<!-- Header with Language Switcher and Settings -->
		<div class="mb-8 relative">
			<!-- Settings Icon - Left Side -->
			<div class="absolute -top-8 left-0">
				<button 
					class="w-11 h-11 bg-gray-100/80 backdrop-blur-sm rounded-full border border-white/30 shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-gray-200/80 hover:scale-105"
					on:click={openSettings}
					aria-label="Open Settings"
				>
					<svg class="w-5 h-5 text-text-primary" viewBox="0 0 24 24" fill="currentColor">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M14.2788 2.15224C13.9085 2 13.439 2 12.5 2C11.561 2 11.0915 2 10.7212 2.15224C10.2274 2.35523 9.83509 2.74458 9.63056 3.23463C9.53719 3.45834 9.50065 3.7185 9.48635 4.09799C9.46534 4.65568 9.17716 5.17189 8.69017 5.45093C8.20318 5.72996 7.60864 5.71954 7.11149 5.45876C6.77318 5.2813 6.52789 5.18262 6.28599 5.15102C5.75609 5.08178 5.22018 5.22429 4.79616 5.5472C4.47814 5.78938 4.24339 6.1929 3.7739 6.99993C3.30441 7.80697 3.06967 8.21048 3.01735 8.60491C2.94758 9.1308 3.09118 9.66266 3.41655 10.0835C3.56506 10.2756 3.77377 10.437 4.0977 10.639C4.57391 10.936 4.88032 11.4419 4.88029 12C4.88026 12.5581 4.57386 13.0639 4.0977 13.3608C3.77372 13.5629 3.56497 13.7244 3.41645 13.9165C3.09108 14.3373 2.94749 14.8691 3.01725 15.395C3.06957 15.7894 3.30432 16.193 3.7738 17C4.24329 17.807 4.47804 18.2106 4.79606 18.4527C5.22008 18.7756 5.75599 18.9181 6.28589 18.8489C6.52778 18.8173 6.77305 18.7186 7.11133 18.5412C7.60852 18.2804 8.2031 18.27 8.69012 18.549C9.17714 18.8281 9.46533 19.3443 9.48635 19.9021C9.50065 20.2815 9.53719 20.5417 9.63056 20.7654C9.83509 21.2554 10.2274 21.6448 10.7212 21.8478C11.0915 22 11.561 22 12.5 22C13.439 22 13.9085 22 14.2788 21.8478C14.7726 21.6448 15.1649 21.2554 15.3694 20.7654C15.4628 20.5417 15.4994 20.2815 15.5137 19.902C15.5347 19.3443 15.8228 18.8281 16.3098 18.549C16.7968 18.2699 17.3914 18.2804 17.8886 18.5412C18.2269 18.7186 18.4721 18.8172 18.714 18.8488C19.2439 18.9181 19.7798 18.7756 20.2038 18.4527C20.5219 18.2105 20.7566 17.807 21.2261 16.9999C21.6956 16.1929 21.9303 15.7894 21.9827 15.395C22.0524 14.8691 21.9088 14.3372 21.5835 13.9164C21.4349 13.7243 21.2262 13.5628 20.9022 13.3608C20.4261 13.0639 20.1197 12.558 20.1197 11.9999C20.1197 11.4418 20.4261 10.9361 20.9022 10.6392C21.2263 10.4371 21.435 10.2757 21.5836 10.0835C21.9089 9.66273 22.0525 9.13087 21.9828 8.60497C21.9304 8.21055 21.6957 7.80703 21.2262 7C20.7567 6.19297 20.522 5.78945 20.2039 5.54727C19.7799 5.22436 19.244 5.08185 18.7141 5.15109C18.4722 5.18269 18.2269 5.28136 17.8887 5.4588C17.3915 5.71959 16.7969 5.73002 16.3099 5.45096C15.8229 5.17191 15.5347 4.65566 15.5136 4.09794C15.4993 3.71848 15.4628 3.45833 15.3694 3.23463C15.1649 2.74458 14.7726 2.35523 14.2788 2.15224ZM12.5 15C14.1695 15 15.5228 13.6569 15.5228 12C15.5228 10.3431 14.1695 9 12.5 9C10.8305 9 9.47716 10.3431 9.47716 12C9.47716 13.6569 10.8305 15 12.5 15Z"/>
					</svg>
				</button>
			</div>

			<!-- Login/User Button - Center Left -->
			<div class="absolute -top-8 left-14">
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
									class="absolute top-12 left-0 w-48 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/30 py-2 opacity-100 transition-all duration-300 pointer-events-auto z-10 transform translate-y-0"
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
										on:click={() => { goto('/history'); showUserDropdown = false; }}
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

			<!-- Language Switcher - Right Side -->
			<div class="absolute -top-8 right-0">
				<div class="relative inline-flex h-11 w-24 bg-gray-100/80 backdrop-blur-sm rounded-full border border-white/30 shadow-lg overflow-hidden">
					<!-- Toggle Background/Slider -->
					<div 
						class="absolute top-0.5 left-0.5 w-11 h-10 bg-white rounded-full shadow-md transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] {currentLanguage === 'en' ? 'translate-x-12' : 'translate-x-0'}"
					></div>
					
					<!-- RU Button (Left) -->
					<button 
						class="relative flex items-center justify-center w-12 h-full z-10 transition-colors duration-200 {currentLanguage === 'ru' ? 'text-text-primary font-semibold' : 'text-text-secondary/60'}"
						on:click={() => switchLanguage('ru')}
						aria-label="Switch to Russian"
					>
						<span class="text-sm font-medium">RU</span>
					</button>
					
					<!-- EN Button (Right) -->
					<button 
						class="relative flex items-center justify-center w-12 h-full z-10 transition-colors duration-200 {currentLanguage === 'en' ? 'text-text-primary font-semibold' : 'text-text-secondary/60'}"
						on:click={() => switchLanguage('en')}
						aria-label="Switch to English"
					>
						<span class="text-sm font-medium">EN</span>
					</button>
				</div>
			</div>
			
			<h1 class="text-5xl md:text-6xl font-bold mb-4 pt-8 gradient-text">
				Masterpiece
			</h1>
			<p class="text-xl text-text-secondary">
				Test your knowledge of famous paintings across different difficulty levels
			</p>
		</div>

		<!-- Difficulty Selection Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
			{#each difficulties as difficulty}
				<button
					class="bg-white/85 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg p-6 transition-all duration-300 cursor-pointer group border border-white/20 hover:border-white/40"
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

		<!-- How to Play Button -->
		<div class="text-center">
			<button 
				class="px-6 py-3 bg-white/85 backdrop-blur-sm border border-white/20 text-text-primary rounded-xl font-medium shadow-lg hover:bg-white/90 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-orange/30"
				on:click={openOnboarding}
			>
				📖 How to Play
			</button>
		</div>
	</div>
</div>

<!-- Settings Modal -->
{#if showSettingsModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" on:click={closeSettings}>
		<div class="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 w-full max-w-md p-6" on:click|stopPropagation>
			<!-- Modal Header -->
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-bold text-text-primary">Quiz Settings</h2>
				<button 
					class="w-8 h-8 rounded-full bg-gray-100/80 hover:bg-gray-200/80 flex items-center justify-center transition-colors duration-200"
					on:click={closeSettings}
					aria-label="Close Settings"
				>
					<svg class="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
					</svg>
				</button>
			</div>

			<!-- Question Count Section -->
			<div class="mb-6">
				<h3 class="text-lg font-semibold text-text-primary mb-4">Number of Questions</h3>
				<div class="grid grid-cols-2 gap-3">
					{#each [5, 10, 15, 20] as count}
						<button
							class="p-3 rounded-xl border-2 text-center font-medium transition-all duration-200 {quizSettings.questionCount === count 
								? 'bg-primary-orange text-white border-primary-orange shadow-lg' 
								: 'bg-white/70 text-text-primary border-gray-200/70 hover:bg-white/90 hover:border-primary-orange/50'}"
							on:click={() => updateQuestionCount(count)}
						>
							{count} Questions
							{#if quizSettings.questionCount === count}
								<div class="text-xs mt-1 opacity-90">✓ Selected</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<!-- Art Movements Section (Placeholder) -->
			<div class="mb-6">
				<h3 class="text-lg font-semibold text-text-primary mb-4">Art Movements</h3>
				<div class="p-4 bg-gray-50/80 rounded-xl text-center">
					<p class="text-sm text-text-secondary">Art movement filtering coming soon...</p>
				</div>
			</div>

			<!-- Modal Actions -->
			<div class="flex gap-3">
				<button 
					class="flex-1 py-3 px-4 bg-gray-100/80 text-text-primary rounded-xl font-medium hover:bg-gray-200/80 transition-colors duration-200"
					on:click={closeSettings}
				>
					Cancel
				</button>
				<button 
					class="flex-1 py-3 px-4 bg-primary-orange text-white rounded-xl font-medium hover:bg-orange-600 transition-colors duration-200"
					on:click={applySettings}
				>
					Apply Settings
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Success Notification -->
{#if showSuccessNotification}
	<div class="fixed top-4 right-4 z-50 notification-slide-in">
		<div class="bg-white/95 backdrop-blur-lg border border-emerald-200/60 rounded-xl px-4 py-3 shadow-xl">
			<p class="text-sm text-text-primary flex items-center">
				<svg 
					class="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0" 
					fill="currentColor" 
					viewBox="0 0 24 24"
				>
					<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
				</svg>
				Settings saved successfully!
			</p>
		</div>
	</div>
{/if}

<!-- Onboarding Modal -->
{#if showOnboardingModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" on:click={closeOnboarding}>
		<div class="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 w-full max-w-lg" on:click|stopPropagation>
			<!-- Image/Icon Section -->
			<div class="p-6 pb-0">
				<div class="w-full h-48 bg-gradient-to-br from-primary-orange/10 to-blue-500/10 rounded-xl flex items-center justify-center">
					<div class="flex items-center justify-center" style="width: 65%; height: 65%;">
						{@html getOnboardingIcon(onboardingSteps[onboardingStep - 1].icon)}
					</div>
				</div>
			</div>
			
			<!-- Content Section -->
			<div class="px-6 pt-3 pb-6 space-y-6">
				<div class="text-center">
					<h2 class="text-2xl font-bold text-text-primary mb-3">
						{onboardingSteps[onboardingStep - 1].title}
					</h2>
					<p class="text-text-secondary leading-relaxed">
						{onboardingSteps[onboardingStep - 1].description}
					</p>
				</div>
				
				<!-- Step Indicators and Actions -->
				<div class="flex flex-col space-y-4">
					<!-- Step Indicators -->
					<div class="flex justify-center space-x-2">
						{#each onboardingSteps as _, index}
							<div 
								class="w-2 h-2 rounded-full transition-all duration-200 {index + 1 === onboardingStep ? 'bg-primary-orange' : 'bg-gray-300'}"
							></div>
						{/each}
					</div>
					
					<!-- Action Buttons -->
					<div class="flex justify-between items-center">
						<!-- Skip button always on left -->
						<button 
							class="px-4 py-2 text-text-secondary hover:text-text-primary active:text-text-primary transition-colors duration-200 touch-manipulation"
							on:click={skipOnboarding}
							on:touchend={(e) => e.target.blur()}
						>
							Skip
						</button>
						
						<!-- Next/Get Started button always on right -->
						{#if onboardingStep < onboardingSteps.length}
							<button 
								class="px-6 py-2 bg-primary-orange text-white rounded-lg font-medium hover:bg-orange-600 active:bg-orange-700 transition-all duration-200 flex items-center gap-2 group touch-manipulation"
								on:click={nextStep}
								on:touchend={(e) => e.target.blur()}
							>
								Next
								<svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
								</svg>
							</button>
						{:else}
							<button 
								class="px-6 py-2 bg-primary-orange text-white rounded-lg font-medium hover:bg-orange-600 active:bg-orange-700 transition-colors duration-200 touch-manipulation"
								on:click={closeOnboarding}
								on:touchend={(e) => e.target.blur()}
							>
								Get Started!
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Login Modal -->
<LoginModal bind:open={showLoginModal} on:close={closeLogin} on:success={closeLogin} />

<style>
	.notification-slide-in {
		animation: slideInFromRight 0.3s ease-out;
	}
	
	@keyframes slideInFromRight {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
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

	/* Simple mobile touch fixes */
	@media (max-width: 768px) {
		button {
			-webkit-tap-highlight-color: transparent;
		}
	}
</style>