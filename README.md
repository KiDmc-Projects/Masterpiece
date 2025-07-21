# Guess the Masterpiece 🎨

A modern quiz application that tests your knowledge of famous paintings. Challenge yourself across three difficulty levels and discover the world's most celebrated artworks.

## 🌟 Features

- **Three Difficulty Levels**: Neophyte, Artisan, Master, and Mix
- **Beautiful UI**: Clean, modern skeuomorphic design
- **Responsive Design**: Optimized for desktop and mobile devices
- **Instant Feedback**: Visual confirmation for correct/incorrect answers
- **Progress Tracking**: Real-time quiz progression display
- **High-Quality Images**: Crisp, detailed artwork displays

## 🛠️ Technology Stack

- **Frontend**: [SvelteKit](https://kit.svelte.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/) (Database & Storage)
- **Functions**: Supabase Edge Functions
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

## 🎮 How to Play

1. **Choose Your Level**: Select from Neophyte, Artisan, Master, or Mix difficulty
2. **Answer Questions**: View famous paintings and identify the artist, title, or period
3. **Get Instant Feedback**: See immediate visual confirmation of your answers
4. **Track Progress**: Monitor your advancement through 10 questions
5. **View Results**: Check your final score and play again

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable Svelte components
│   ├── stores/             # Application state management
│   └── utils/              # Utility functions and Supabase client
├── routes/
│   ├── +layout.svelte      # Main layout template
│   ├── +page.svelte        # Start view (difficulty selection)
│   ├── quiz/               # Quiz gameplay view
│   └── results/            # Results and score display
└── app.html                # HTML template
```

## 🎨 Design System

The application features a clean, modern interface with:

- **Skeuomorphic Elements**: Subtle shadows and depth
- **Responsive Layout**: Mobile-first design approach
- **Color Palette**: Ocean blue primary (#0ea5e9), neutral grays
- **Typography**: System font stack for optimal readability
- **Interactive States**: Hover effects and smooth transitions

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KiDmc-Projects/Masterpiece.git
   cd Masterpiece
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Screenshots

The `design-Reference/` folder contains UI mockups for both desktop and mobile layouts, showcasing the intended user experience and visual design.

## 🗄️ Database Schema

The application uses Supabase with the following main entities:

- **Paintings**: Artwork information and image URLs
- **Questions**: Quiz questions linked to paintings
- **Difficulty Levels**: Question categorization
- **User Scores**: Game results and statistics

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Style

This project follows standard SvelteKit conventions with:

- ESLint for code quality
- Prettier for formatting
- Tailwind CSS for styling
- TypeScript for type safety

## 🚀 Deployment

The application is configured for deployment on Cloudflare Pages with automatic builds from the main branch.

---

**Built with ❤️ using SvelteKit and Supabase**