<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import Eye from 'lucide-svelte/icons/eye'
  import EyeOff from 'lucide-svelte/icons/eye-off'
  import { authService, type AuthProvider } from '$lib/auth'
  
  const dispatch = createEventDispatcher()
  
  export let open = false
  
  // Form state
  let email = ''
  let password = ''
  let rememberMe = false
  let showPassword = false
  let isEmailFocused = false
  let isPasswordFocused = false
  let isEmailValid = true
  let isFormSubmitted = false
  let isSignUp = false
  let loading = false
  let error = ''
  
  // Particles animation
  let canvasElement: HTMLCanvasElement
  let animationId: number
  
  // Email validation
  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
  }
  
  // Handle email change
  const handleEmailChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    email = target.value
    if (email) {
      isEmailValid = validateEmail(email)
    } else {
      isEmailValid = true
    }
  }
  
  // Handle form submission
  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setIsFormSubmitted(true)
    
    if (!email || !password || !isEmailValid) {
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      if (isSignUp) {
        await authService.signUpWithEmail(email, password)
        setError('Check your email for a confirmation link!')
      } else {
        await authService.signInWithEmail(email, password)
        dispatch('success')
        closeModal()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle OAuth sign in
  const handleOAuthSignIn = async (provider: AuthProvider) => {
    setLoading(true)
    setError('')
    
    try {
      await authService.signInWithProvider(provider)
      // The redirect will handle the rest
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }
  
  // Reactive assignments
  $: setIsFormSubmitted = (value: boolean) => { isFormSubmitted = value }
  $: setLoading = (value: boolean) => { loading = value }
  $: setError = (value: string) => { error = value }
  
  const closeModal = () => {
    open = false
    dispatch('close')
  }
  
  const toggleMode = () => {
    isSignUp = !isSignUp
    setError('')
    setIsFormSubmitted(false)
  }
  
  // Particles animation
  onMount(() => {
    if (canvasElement) {
      initParticles()
    }
  })
  
  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  })
  
  const initParticles = () => {
    const canvas = canvasElement
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    
    setCanvasSize()
    
    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.color = `rgba(14, 165, 233, ${Math.random() * 0.3})`
      }
      
      update() {
        this.x += this.speedX
        this.y += this.speedY
        
        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }
      
      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    const particles: Particle[] = []
    const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 15000))
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }
    
    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      for (const particle of particles) {
        particle.update()
        particle.draw()
      }
      
      animationId = requestAnimationFrame(animate)
    }
    
    animate()
  }
</script>

{#if open}
  <!-- Modal Backdrop -->
  <div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 login-container"
    on:click={closeModal}
    on:keydown={(e) => e.key === 'Escape' && closeModal()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- Particles Canvas -->
    <canvas 
      bind:this={canvasElement}
      class="absolute inset-0 w-full h-full pointer-events-none particles-canvas"
    ></canvas>
    
    <!-- Login Card -->
    <div 
      class="login-card relative z-10"
      on:click|stopPropagation
      role="none"
    >
      <div class="login-card-inner">
        <!-- Close Button -->
        <button 
          class="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors z-10"
          on:click={closeModal}
          aria-label="Close modal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- Header -->
        <div class="login-header">
          <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
          <p>{isSignUp ? 'Join the art community' : 'Please sign in to continue'}</p>
        </div>
        
        <!-- Social Login -->
        <div class="social-login">
          <button 
            class="social-button google"
            on:click={() => handleOAuthSignIn('google')}
            disabled={loading}
            aria-label="Sign in with Google"
          >
            <!-- Custom Google icon -->
            <svg class="w-5 h-5" viewBox="0 0 32 32" fill="none">
              <path d="M30.0014 16.3109C30.0014 15.1598 29.9061 14.3198 29.6998 13.4487H16.2871V18.6442H24.1601C24.0014 19.9354 23.1442 21.8798 21.2394 23.1864L21.2127 23.3604L25.4536 26.58L25.7474 26.6087C28.4458 24.1665 30.0014 20.5731 30.0014 16.3109Z" fill="#4285F4"/>
              <path d="M16.2863 29.9998C20.1434 29.9998 23.3814 28.7553 25.7466 26.6086L21.2386 23.1863C20.0323 24.0108 18.4132 24.5863 16.2863 24.5863C12.5086 24.5863 9.30225 22.1441 8.15929 18.7686L7.99176 18.7825L3.58208 22.127L3.52441 22.2841C5.87359 26.8574 10.699 29.9998 16.2863 29.9998Z" fill="#34A853"/>
              <path d="M8.15964 18.769C7.85806 17.8979 7.68352 16.9645 7.68352 16.0001C7.68352 15.0356 7.85806 14.1023 8.14377 13.2312L8.13578 13.0456L3.67083 9.64746L3.52475 9.71556C2.55654 11.6134 2.00098 13.7445 2.00098 16.0001C2.00098 18.2556 2.55654 20.3867 3.52475 22.2845L8.15964 18.769Z" fill="#FBBC05"/>
              <path d="M16.2864 7.4133C18.9689 7.4133 20.7784 8.54885 21.8102 9.4978L25.8419 5.64C23.3658 3.38445 20.1435 2 16.2864 2C10.699 2 5.8736 5.1422 3.52441 9.71549L8.14345 13.2311C9.30229 9.85555 12.5086 7.4133 16.2864 7.4133Z" fill="#EB4335"/>
            </svg>
          </button>
          
          <button 
            class="social-button github"
            on:click={() => handleOAuthSignIn('github')}
            disabled={loading}
            aria-label="Sign in with GitHub"
          >
            <!-- Custom GitHub icon -->
            <svg class="w-5 h-5" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" fill="#181717"/>
              <path d="M6.81348 34.235C9.24811 38.3138 13.0939 41.4526 17.6772 42.9784C18.6779 43.1614 19.0425 42.5438 19.0425 42.0134C19.0425 41.7938 19.0388 41.4058 19.0339 40.8866C19.0282 40.2852 19.0208 39.5079 19.0155 38.6124C13.4524 39.8206 12.2787 35.931 12.2787 35.931C11.3689 33.6215 10.0576 33.0064 10.0576 33.0064C8.2417 31.7651 10.1951 31.7896 10.1951 31.7896C12.2025 31.9321 13.2584 33.8511 13.2584 33.8511C15.0424 36.9071 17.94 36.0243 19.0794 35.5135C19.2611 34.2207 19.7767 33.3391 20.3489 32.8394C15.908 32.3348 11.2387 30.6183 11.2387 22.9545C11.2387 20.7715 12.0184 18.9863 13.2977 17.5879C13.0914 17.082 12.4051 15.0488 13.4929 12.2949C13.4929 12.2949 15.1725 11.7571 18.9934 14.3453C20.5883 13.9021 22.2998 13.6798 24.0003 13.6725C25.6983 13.6798 27.4099 13.9021 29.0072 14.3453C32.8256 11.7571 34.5016 12.2949 34.5016 12.2949C35.5931 15.0488 34.9067 17.082 34.7005 17.5879C35.9823 18.9863 36.757 20.7715 36.757 22.9545C36.757 30.638 32.0804 32.3286 27.6247 32.8234C28.343 33.441 28.9827 34.6614 28.9827 36.5277C28.9827 38.3152 28.9717 39.8722 28.9644 40.9035C28.9608 41.4143 28.9581 41.7962 28.9581 42.0134C28.9581 42.5487 29.3178 43.1712 30.3332 42.976C33.9844 41.7572 37.1671 39.5154 39.5403 36.5903C35.8734 41.1108 30.274 44 23.9997 44C16.6943 44 10.3038 40.0832 6.81348 34.235Z" fill="white"/>
            </svg>
          </button>
          
          <button 
            class="social-button twitter"
            on:click={() => handleOAuthSignIn('twitter')}
            disabled={loading}
            aria-label="Sign in with X (Twitter)"
          >
            <!-- Custom X (Twitter) icon -->
            <svg class="w-5 h-5" viewBox="0 0 50 50" fill="currentColor">
              <path d="M 11 4 C 7.134 4 4 7.134 4 11 L 4 39 C 4 42.866 7.134 46 11 46 L 39 46 C 42.866 46 46 42.866 46 39 L 46 11 C 46 7.134 42.866 4 39 4 L 11 4 z M 13.085938 13 L 21.023438 13 L 26.660156 21.009766 L 33.5 13 L 36 13 L 27.789062 22.613281 L 37.914062 37 L 29.978516 37 L 23.4375 27.707031 L 15.5 37 L 13 37 L 22.308594 26.103516 L 13.085938 13 z M 16.914062 15 L 31.021484 35 L 34.085938 35 L 19.978516 15 L 16.914062 15 z"/>
            </svg>
          </button>
        </div>
        
        <div class="separator">
          <span>or continue with email</span>
        </div>
        
        <!-- Email Form -->
        <form class="login-form" on:submit={handleSubmit}>
          <!-- Email Field -->
          <div class="form-field {isEmailFocused || email ? 'active' : ''} {!isEmailValid && email ? 'invalid' : ''}">
            <input
              type="email"
              id="email"
              bind:value={email}
              on:input={handleEmailChange}
              on:focus={() => isEmailFocused = true}
              on:blur={() => isEmailFocused = false}
              required
              disabled={loading}
            />
            <label for="email">Email Address</label>
            {#if !isEmailValid && email}
              <span class="error-message">Please enter a valid email</span>
            {/if}
          </div>
          
          <!-- Password Field -->
          <div class="form-field {isPasswordFocused || password ? 'active' : ''}">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              bind:value={password}
              on:focus={() => isPasswordFocused = true}
              on:blur={() => isPasswordFocused = false}
              required
              disabled={loading}
            />
            <label for="password">Password</label>
            <button
              type="button"
              class="toggle-password"
              on:click={() => showPassword = !showPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={loading}
            >
              {#if showPassword}
                <EyeOff size={18} />
              {:else}
                <Eye size={18} />
              {/if}
            </button>
          </div>
          
          <!-- Form Options -->
          {#if !isSignUp}
            <div class="form-options">
              <label class="remember-me">
                <input
                  type="checkbox"
                  bind:checked={rememberMe}
                  disabled={loading}
                />
                <span class="checkmark"></span>
                Remember me
              </label>
              
              <button type="button" class="forgot-password" disabled={loading}>
                Forgot Password?
              </button>
            </div>
          {/if}
          
          <!-- Error Message -->
          {#if error}
            <div class="error-message text-center">
              {error}
            </div>
          {/if}
          
          <!-- Submit Button -->
          <button
            type="submit"
            class="login-button"
            disabled={loading || (isFormSubmitted && (!email || !password || !isEmailValid))}
          >
            {#if loading}
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {:else}
              {isSignUp ? 'Create Account' : 'Sign In'}
            {/if}
          </button>
        </form>
        
        <!-- Toggle Mode -->
        <p class="signup-prompt">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button type="button" on:click={toggleMode} disabled={loading}>
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .login-container {
    font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .particles-canvas {
    opacity: 0.6;
  }
  
  .login-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    width: 100%;
    max-width: 420px;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease-out;
  }
  
  .login-card-inner {
    padding: 2rem;
  }
  
  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .login-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  .login-header p {
    color: #6b7280;
    font-size: 0.95rem;
  }
  
  .social-login {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .social-button {
    flex: 1;
    height: 48px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    color: #374151;
  }
  
  .social-button:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
    transform: translateY(-1px);
  }
  
  .social-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .social-button.google:hover:not(:disabled) {
    border-color: #4285f4;
  }
  
  .social-button.github:hover:not(:disabled) {
    border-color: #24292e;
  }
  
  .social-button.twitter:hover:not(:disabled) {
    border-color: #1da1f2;
  }
  
  .separator {
    position: relative;
    text-align: center;
    margin: 1.5rem 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .separator::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, #d1d5db 25%, #d1d5db 75%, transparent);
  }
  
  .separator span {
    background: rgba(255, 255, 255, 0.98);
    padding: 0 1.5rem;
    backdrop-filter: blur(10px);
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  
  .form-field {
    position: relative;
  }
  
  .form-field input {
    width: 100%;
    height: 48px;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    outline: none;
  }
  
  .form-field input:focus {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }
  
  .form-field.invalid input {
    border-color: #ef4444;
  }
  
  .form-field label {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    font-size: 0.95rem;
    pointer-events: none;
    transition: all 0.2s ease;
    background: white;
    padding: 0 4px;
  }
  
  .form-field.active label,
  .form-field input:focus + label {
    top: 0;
    font-size: 0.75rem;
    color: #0ea5e9;
  }
  
  .form-field.invalid.active label {
    color: #ef4444;
  }
  
  .toggle-password {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: color 0.2s ease;
  }
  
  .toggle-password:hover:not(:disabled) {
    color: #374151;
  }
  
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
  }
  
  .remember-me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #374151;
    cursor: pointer;
  }
  
  .remember-me input {
    width: auto;
    height: auto;
    margin: 0;
  }
  
  .forgot-password {
    color: #0ea5e9;
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    font-size: 0.875rem;
  }
  
  .forgot-password:hover:not(:disabled) {
    color: #0284c7;
  }
  
  .login-button {
    height: 48px;
    background: #0ea5e9;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .login-button:hover:not(:disabled) {
    background: #0284c7;
    transform: translateY(-1px);
  }
  
  .login-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  .signup-prompt {
    text-align: center;
    margin-top: 1.5rem;
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .signup-prompt button {
    color: #0ea5e9;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 600;
    text-decoration: underline;
  }
  
  .signup-prompt button:hover:not(:disabled) {
    color: #0284c7;
  }
  
  .error-message {
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  /* Responsive adjustments */
  @media (max-width: 640px) {
    .login-card {
      margin: 1rem;
      max-width: calc(100vw - 2rem);
    }
    
    .login-card-inner {
      padding: 1.5rem;
    }
    
    .login-header h1 {
      font-size: 1.75rem;
    }
    
    .social-login {
      gap: 0.75rem;
    }
    
    .social-button {
      height: 44px;
    }
    
    .form-field input {
      height: 44px;
    }
    
    .login-button {
      height: 44px;
    }
    
    /* Fix mobile divider background */
    .separator span {
      background: rgba(255, 255, 255, 1);
      backdrop-filter: none;
    }
    
    .separator::before {
      background: linear-gradient(to right, transparent, #d1d5db 20%, #d1d5db 80%, transparent);
    }
  }
</style>