# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Context
This is a modern, minimalist Article App frontend built with:
- **Vite** + **React** + **JavaScript** (no TypeScript)
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Rich text editor** with markdown support
- **Image upload** functionality
- **Clean, minimalist design** philosophy

## Backend Integration
- Backend API runs on `http://localhost:5000/api`
- Uses JWT authentication with Bearer tokens
- Supports timezone-aware date formatting
- Article URLs use slugs (not MongoDB IDs) for human-readable URLs
- Supports markdown content with embedded images

## Design Guidelines
- **Minimalist**: Clean, simple, distraction-free interface
- **Typography-focused**: Emphasis on readability
- **Responsive**: Works on all device sizes
- **Accessible**: Proper contrast, keyboard navigation
- **Fast**: Optimized loading and interactions

## Code Style
- Use functional components with hooks
- Prefer const arrow functions
- Use modern ES6+ features
- Keep components small and focused
- Use custom hooks for reusable logic
- Implement proper error handling
- Use semantic HTML elements
