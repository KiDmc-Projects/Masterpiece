# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Guess the Masterpiece** is a sophisticated, multilingual quiz application where users test their knowledge of famous paintings. The app features four difficulty levels (Neophyte, Artisan, Master, and Mix) with a professional glassmorphism design, celebration animations, and comprehensive learning tools.

**Current Version:** v0.5.0 - Production Ready
**Live Application:** https://art.oqva.cloud (Cloudflare Pages)

## Technology Stack

- **Framework:** SvelteKit 5 with TypeScript
- **Styling:** Tailwind CSS with custom glassmorphism design system
- **Backend/Database:** Supabase (PostgreSQL database and image storage)
- **Animations:** Fireworks-js library for celebration effects
- **Version Control:** Git (GitHub repository)
- **Deployment:** Cloudflare Pages with automatic builds
- **Package Manager:** npm

## Project Structure

This is a **production-ready application** with the following implemented features:

### 🎯 Core Components
- **`src/routes/+page.svelte`** - Start view with difficulty selection and language switcher
- **`src/routes/quiz/+page.svelte`** - Interactive quiz interface with answer tracking
- **`src/routes/results/+page.svelte`** - Results with fireworks animation and answer review
- **`src/routes/admin/+page.svelte`** - Administrative panel for content management
- **`src/lib/`** - Shared utilities (language switching, Supabase client)

### 📁 Key Files
- **`PROJECT_OVERVIEW.md`** - Comprehensive feature documentation
- **`RELEASE_NOTES.md`** - Version history and feature changelog
- **`package.json`** - Dependencies including fireworks-js v2.10.8
- **`wrangler.toml`** - Cloudflare Pages deployment configuration
- **`.env.example`** - Environment variable template (with placeholders)

## Application Architecture

The application implements a **three-view structure** with advanced features:

### 1. **Start View** (`/`)
- **Glassmorphism Design:** Professional translucent containers
- **Multilingual Support:** Russian (default) and English with persistent preferences
- **Four Difficulty Levels:** Neophyte, Artisan, Master, and Mix
- **Responsive Background System:** Desktop/mobile optimized images
- **"How to Play" Section:** Visual instructions with flow indicators

### 2. **Quiz View** (`/quiz`)
- **Dynamic Progress Tracking:** "Question X of 10" with visual progress bar
- **High-Quality Image Display:** Glassmorphism container with hover effects
- **Smart Answer System:** Intelligent wrong answer generation
- **Immediate Feedback:** Green/red visual indicators with smooth transitions
- **Session Data Collection:** Complete answer tracking for review system
- **Auto-progression:** Smooth transitions between questions
- **Multilingual Content:** Dynamic language-based content delivery

### 3. **Results View** (`/results`)
- **🎆 Professional Fireworks Animation:** 5-second celebration using fireworks-js
- **Comprehensive Score Display:** Animated progress circle with grade system (A+ to F)
- **📋 Answer Review System:**
  - Toggle-based interface with smooth transitions
  - **"Wrong Answers" Tab:** Learning-focused default view
  - **"All Questions" Tab:** Complete session review
  - Visual thumbnails and detailed answer comparisons
  - Color-coded feedback with ✅/❌ indicators
- **Responsive Layout:** Adaptive grid system (desktop/mobile)
- **Performance Statistics:** Detailed accuracy and learning analytics

### 4. **Admin Panel** (`/admin`)
- **Secure Authentication:** Password-protected access
- **Advanced Filtering:** By difficulty level and artist name with auto-complete
- **Bulk Upload System:** Multi-artwork processing with progress tracking
- **Professional Pagination:** 50 items per page with navigation
- **Full CRUD Operations:** Complete artwork management capabilities

## Current Implementation Status

### ✅ **Fully Implemented Features**

#### 🎨 **Design System**
- **Glassmorphism Effects:** Consistent 85-95% opacity with backdrop blur
- **Responsive Backgrounds:** Desktop (`bg-desktop.webp`) and mobile (`bg-mobile.webp`)
- **Professional Animations:** Smooth transitions and hover effects
- **Accessibility Compliance:** WCAG standards with focus management

#### 🌍 **Multilingual Platform**
- **Complete Language Support:** Russian and English throughout application
- **Dynamic Content Switching:** Real-time language changes
- **Persistent Preferences:** Language selection stored in localStorage
- **Database Integration:** Bilingual artwork metadata

#### 🎮 **Advanced Quiz Features**
- **Four Difficulty Levels:** Fully implemented with appropriate content
- **100+ Artworks:** Curated database across all difficulty levels
- **Smart Answer Generation:** Intelligent wrong answer system
- **Session Management:** Complete quiz state tracking
- **Performance Analytics:** Detailed answer collection and analysis

#### 🎆 **Celebration System**
- **Fireworks-js Integration:** Professional particle animation library
- **Custom Configuration:** Realistic physics (gravity: 1.5, acceleration: 1.02)
- **Hardware Acceleration:** Canvas-based rendering for smooth performance
- **Auto-cleanup:** Memory management and resource disposal

#### 📊 **Answer Review System**
- **Dual-Tab Interface:** Wrong Answers (default) and All Questions
- **Visual Feedback:** Question thumbnails with ✅/❌ indicators
- **Educational Focus:** Learning-oriented wrong answer analysis
- **Responsive Design:** Adapts to desktop and mobile layouts

#### 🛠️ **Administrative Tools**
- **Bulk Processing:** Multi-artwork upload capabilities
- **Advanced Search:** Auto-complete artist filtering
- **Professional UI:** Clean, organized content management interface
- **Error Handling:** Comprehensive success/failure reporting

### 🗄️ **Database Schema (Implemented)**
- **`artworks`** - Multilingual painting metadata with image URLs
- **`difficulty_levels`** - Quiz difficulty configuration
- **Artist metadata** - Complete artist information in both languages
- **Session tracking** - Quiz attempt logging and analytics

### 🔧 **Technical Infrastructure**
- **Production Deployment:** Live on Cloudflare Pages
- **Environment Management:** Secure credential handling
- **Build Pipeline:** Automated deployment from GitHub
- **Performance Optimization:** Static site generation with CDN distribution

## Development Guidelines

### 🎯 **Code Standards**
- **TypeScript:** Strict typing throughout the application
- **SvelteKit 5:** Using latest reactive patterns and syntax
- **Component Architecture:** Modular, reusable component design
- **Error Handling:** Comprehensive error boundaries and user feedback

### 🎨 **Design Patterns**
- **Glassmorphism:** Consistent opacity levels and backdrop blur
- **Color System:** Primary orange (#f97316), secondary blue (#0ea5e9)
- **Animation Timing:** 200ms micro-interactions, 300ms state changes
- **Responsive Breakpoints:** Mobile-first with desktop enhancements

### 📱 **Responsive Design**
- **Mobile Optimization:** Touch-friendly interactions and layouts
- **Desktop Enhancement:** Extended features and side-by-side layouts
- **Cross-platform:** Consistent experience across all devices

## Key Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # ESLint and Prettier checks
npm run format       # Auto-format code
npm run check        # TypeScript and Svelte checks

# Deployment
wrangler pages deploy .svelte-kit/output/static --project-name=masterpiece-quiz-pages
```

## Environment Variables (Required)

The application requires these environment variables (configured in Cloudflare Pages):

```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PUBLIC_SUPABASE_STORAGE_BUCKET=artwork-images
```

## Data Flow Architecture

### 🔄 **Quiz Session Flow**
1. **Language Selection:** Persistent preference in localStorage
2. **Difficulty Selection:** Filters appropriate artwork from database
3. **Question Generation:** Random selection with smart wrong answers
4. **Answer Tracking:** Complete session data collection in sessionStorage
5. **Results Calculation:** Score, grade, and statistics generation
6. **Review System:** Detailed answer analysis with visual feedback

### 📊 **Answer Review Data Structure**
```javascript
quizAnswers = [{
  questionNumber: 1,
  paintingTitle: "The Starry Night",
  paintingArtist: "Vincent van Gogh",
  imageUrl: "artwork_image_url",
  userAnswer: "Vincent van Gogh",
  correctAnswer: "Vincent van Gogh",
  isCorrect: true,
  explanation: "Educational context..."
}]
```

### 🎆 **Animation Configuration**
```javascript
fireworks = new Fireworks(container, {
  autoresize: true,
  opacity: 0.5,
  acceleration: 1.02,
  friction: 0.97,
  gravity: 1.5,
  particles: 50,
  // ... professional configuration
});
```

## Deployment Information

- **Production URL:** https://art.oqva.cloud
- **Staging URL:** https://masterpiece-quiz-pages.pages.dev
- **GitHub Repository:** Connected for automatic deployments
- **Build Command:** `npm run build`
- **Output Directory:** `.svelte-kit/output/static`

## Troubleshooting

### Common Issues:
1. **GitHub Auto-deployment:** May require manual Wrangler deployment
2. **Environment Variables:** Ensure all required variables are set in Cloudflare
3. **Image Loading:** Verify Supabase storage permissions and URLs
4. **Animation Performance:** Fireworks require hardware acceleration

### Debug Commands:
```bash
# Check build output
ls -la .svelte-kit/output/static

# Test production build locally  
npm run preview

# Deploy manually if needed
wrangler pages deploy .svelte-kit/output/static --project-name=masterpiece-quiz-pages
```

This is a **production-ready, feature-complete application** with professional-grade animations, comprehensive learning tools, and multilingual support. All major features are implemented and thoroughly tested.
