# Article App Frontend

A modern, minimalist blogging platform frontend built with Vite + React + JavaScript.

## Features

- 🎨 **Minimalist Design** - Clean, distraction-free interface
- 📝 **Rich Markdown Editor** - Write with live preview and image uploads
- 🔐 **Authentication** - Secure login/register system
- 📱 **Responsive** - Works perfectly on all devices
- ⚡ **Fast** - Built with Vite for optimal performance
- 🏷️ **SEO-Friendly** - Human-readable URLs with slugs
- 🖼️ **Image Support** - Featured images and inline content images
- 🏷️ **Tagging System** - Organize articles with tags

## Tech Stack

- **Vite** - Build tool and dev server
- **React** - UI library
- **JavaScript** - No TypeScript for simplicity
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Markdown** - Markdown rendering
- **@uiw/react-md-editor** - Markdown editor with preview

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:5000/api`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navigation.jsx   # Main navigation
│   └── ProtectedRoute.jsx # Auth guard component
├── pages/              # Page components
│   ├── Home.jsx        # Article listing page
│   ├── ArticleView.jsx # Individual article view
│   ├── Write.jsx       # Article editor
│   ├── Dashboard.jsx   # User dashboard
│   ├── Login.jsx       # Login page
│   └── Register.jsx    # Registration page
├── context/            # React contexts
│   └── AuthContext.jsx # Authentication state
├── utils/              # Utility functions
│   ├── api.js          # API client and endpoints
│   └── helpers.js      # Helper functions
├── hooks/              # Custom React hooks
└── index.css           # Global styles with Tailwind
```

## API Integration

The frontend integrates with the backend API for:

- **Authentication** - JWT-based login/register
- **Articles** - CRUD operations with slug-based URLs
- **Images** - Featured and inline image uploads
- **User Management** - Profile and dashboard features

## Design Philosophy

- **Minimalism** - Focus on content, remove distractions
- **Typography** - Emphasis on readability with Inter font
- **Accessibility** - Proper contrast, keyboard navigation
- **Performance** - Optimized loading and interactions
- **Mobile-First** - Responsive design for all devices

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Configuration

The frontend is configured to work with:
- Backend API: `http://localhost:5000/api`
- Development server: `http://localhost:5174`

## Contributing

1. Follow the existing code style
2. Use functional components with hooks
3. Maintain the minimalist design philosophy
4. Ensure responsive design
5. Test on multiple devices+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
