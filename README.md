# Discourse Trend Watch

A modern web application built with React, TypeScript, and Vite for monitoring and analyzing discourse trends.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **Data Visualization**: Recharts
- **UI Components**: Radix UI primitives with shadcn/ui

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm or bun package manager

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd discourse-trend-watch
```

2. Install dependencies:
```bash
# Using npm
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and configurations
├── styles/        # Global styles and Tailwind configurations
└── types/         # TypeScript type definitions
```

## Development

This project uses:
- TypeScript for type safety
- ESLint for code linting
- Tailwind CSS for styling
- shadcn/ui for pre-built components