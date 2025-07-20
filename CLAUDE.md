# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a quiz application called "Guess the Masterpiece" where users test their knowledge of famous paintings. The app features three difficulty levels (Neophyte, Artisan, Master, and Mix) with a clean, modern skeuomorphic design.

## Technology Stack

- **Framework:** SvelteKit
- **Styling:** Tailwind CSS  
- **Backend/Database:** Supabase (database and image storage)
- **Serverless Functions:** Supabase Edge Functions
- **Deployment:** Cloudflare Pages

## Project Structure

The project is currently in initial setup phase. The codebase contains:
- `Project Overview` - Complete project specifications and requirements
- `design-Reference/` - UI/UX design examples for desktop and mobile layouts

## Application Architecture

The application follows a three-view structure:

1. **Start View** - Landing page with difficulty selection buttons
2. **Quiz View** - Main quiz interface with progress bar, image display, and answer options
3. **Results View** - Score display and replay functionality

## Design Requirements

- Clean, modern, centered layout with skeuomorphic design
- Responsive design (desktop and mobile layouts available in design-Reference/)
- Progress tracking (Question X of 10)
- Immediate visual feedback (green for correct, red for incorrect answers)
- Auto-progression between questions after user feedback

## Setup Instructions

This project needs initial SvelteKit setup:
1. Initialize SvelteKit project
2. Configure Tailwind CSS
3. Set up Supabase integration
4. Implement the three main views according to specifications

## Data Flow

All quiz data (paintings, questions, answers) will be fetched from Supabase backend. The app will support different difficulty levels with appropriate content filtering.