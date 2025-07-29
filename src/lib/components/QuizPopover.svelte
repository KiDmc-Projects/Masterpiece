<script>
	import { createEventDispatcher, onMount } from 'svelte';
	
	export let open = false;
	export let title = '';
	export let description = '';
	export let width = '320px';
	export let height = 'auto';
	export let showCloseButton = true;
	
	
	
	
	const dispatch = createEventDispatcher();
	
	let popoverElement;
	
	function close() {
		open = false;
		dispatch('close');
	}
	
	function handleKeydown(event) {
		if (event.key === 'Escape' && open) {
			close();
		}
	}
	
	onMount(() => {
		const handleOutsideClick = (event) => {
			if (popoverElement && !popoverElement.contains(event.target) && open) {
				close();
			}
		};
		
		document.addEventListener('click', handleOutsideClick);
		document.addEventListener('keydown', handleKeydown);
		
		return () => {
			document.removeEventListener('click', handleOutsideClick);
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if open}
	<div 
		bind:this={popoverElement}
		class="quiz-popover"
		style="width: {width}; height: {height};"
	>
		<!-- Close button -->
		{#if showCloseButton}
			<button 
				class="popover-close" 
				on:click={close}
				aria-label="Close popover"
			>
				<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
				</svg>
			</button>
		{/if}
		
		<!-- Popover content -->
		<div class="popover-content">
			{#if title}
				<h3 class="popover-title">{title}</h3>
			{/if}
			
			{#if description}
				<p class="popover-description">{@html description}</p>
			{/if}
			
			<slot />
		</div>
		
		<!-- Decorative cutout elements -->
		<div class="popover-cutout-left">
			<svg class="w-3 h-6" viewBox="0 0 12 24" fill="none">
				<path d="M0 0C6.627 0 12 5.373 12 12S6.627 24 0 24V0Z" fill="currentColor"/>
			</svg>
		</div>
		
		<div class="popover-cutout-right">
			<svg class="w-3 h-6" viewBox="0 0 12 24" fill="none">
				<path d="M12 0C5.373 0 0 5.373 0 12S5.373 24 12 24V0Z" fill="currentColor"/>
			</svg>
		</div>
		
		<!-- Arrow pointing to the bulb icon -->
		<div class="popover-arrow"></div>
	</div>
{/if}

<style>
	.quiz-popover {
		@apply absolute top-0 left-0 right-0 z-50 pointer-events-auto;
		@apply bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/20;
		transform-origin: top center;
		opacity: 1;
		transform: translateY(0) scale(1);
		transition: all 0.3s ease;
		margin-bottom: 1rem;
	}
	
	.popover-close {
		@apply absolute top-3 right-3 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100/50 transition-colors duration-200;
		z-index: 10;
	}
	
	.popover-content {
		@apply p-4 relative;
	}
	
	.popover-title {
		@apply text-lg font-semibold text-blue-800 mb-2;
	}
	
	.popover-description {
		@apply text-base text-blue-700 leading-relaxed;
	}
	
	.popover-cutout-left {
		@apply absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 text-white/95;
	}
	
	.popover-cutout-right {
		@apply absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 text-white/95;
	}
	
	.popover-arrow {
		@apply absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/95 border-r border-b border-white/20 rotate-45;
		backdrop-filter: blur(10px);
	}
	
</style>