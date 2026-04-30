<div align="center">

# Yorùbá Lexicon

A comprehensive web application for exploring, contributing, and managing a Yorùbá dictionary.

</div>

## Overview

Yorùbá Lexicon is a full-stack web application designed to help users browse Yorùbá words, view their phonetic transcriptions, definitions, and examples in both Yorùbá and English. The platform also allows authenticated users to contribute new entries, which administrators can review, approve, or manage.

## Features

- **Browse & Search:** Easily browse the approved lexicon entries.
- **Authentication:** Secure user registration and login using Supabase Auth.
- **User Dashboard:** Authenticated users can submit new lexicon entries and view the status of their pending contributions.
- **Admin Panel:** Administrators can review pending submissions, approve them, update existing entries, and manage the lexicon.
- **Responsive Design:** A beautifully crafted, responsive user interface.

## Tech Stack

- **Frontend Framework:** React 19, Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** `motion/react`
- **Icons:** `lucide-react`
- **Routing:** React Router v7
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Auth)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- `npm` or `pnpm`
- A [Supabase](https://supabase.com/) account and project.

### Local Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add the following keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key_if_applicable
   ```

4. **Database Configuration:**
   For a detailed guide on setting up the Supabase database schema, policies, and creating an admin user, please refer to the [Supabase Setup Guide](README_SUPABASE.md).

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the Vite development server on port 3000.
- `npm run build`: Builds the application for production to the `dist` folder.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs TypeScript type-checking (`tsc --noEmit`).
- `npm run clean`: Removes the `dist` build directory.

## Project Structure

A quick look at the core structure of the source directory (`src/`):

- `/components`: Reusable UI components like `Navbar`, `Footer`, and layout wrappers.
- `/pages`: Page-level components corresponding to different routes (`Landing`, `Browse`, `Dashboard`, `Auth`, `Admin`).
- `/context`: React Context providers, such as the `AuthContext` for managing authentication state globally.
- `/lib`: Utility functions and components, including the `ProtectedRoute` wrapper for secure routing.
- `/assets`: Static assets used in the application.

## Deployment

This application is configured for deployment. Depending on your hosting provider (like Vercel, which has a `vercel.json` included, or Netlify), simply connect your repository, set up the necessary environment variables, and use `npm run build` as your build command.
