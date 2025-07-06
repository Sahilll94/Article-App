// Mock data for development when backend is not available
export const mockArticles = [
  {
    _id: '1',
    title: 'Getting Started with React and Vite',
    content: `# Getting Started with React and Vite

Welcome to this comprehensive guide on building modern React applications with Vite!

## What is Vite?

Vite is a build tool that aims to provide a faster and leaner development experience for modern web projects. It consists of two major parts:

- A dev server that provides rich feature enhancements over native ES modules
- A build command that bundles your code with Rollup

## Why Choose Vite?

### ⚡ Lightning Fast
- Instant server start
- Lightning fast HMR (Hot Module Replacement)
- True on-demand compilation

### 🔧 Rich Features
- TypeScript support out of the box
- CSS pre-processors support
- Framework agnostic core

## Getting Started

First, create a new Vite project:

\`\`\`bash
npm create vite@latest my-react-app -- --template react
cd my-react-app
npm install
npm run dev
\`\`\`

That's it! You now have a blazing fast React development environment.

## Conclusion

Vite represents the future of frontend tooling. Its speed and simplicity make it an excellent choice for React projects of any size.`,
    excerpt: 'Learn how to build modern React applications with Vite, the lightning-fast build tool that provides an amazing development experience.',
    slug: 'getting-started-with-react-and-vite',
    author: {
      _id: 'author1',
      name: 'Alex Johnson',
      email: 'alex@example.com'
    },
    status: 'published',
    visibility: 'public',
    featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    tags: ['React', 'Vite', 'JavaScript', 'Frontend'],
    publishedAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z',
    createdAt: '2025-01-05T09:00:00Z'
  },
  {
    _id: '2',
    title: 'The Art of Minimalist Web Design',
    content: `# The Art of Minimalist Web Design

In a world of visual noise and information overload, minimalist web design stands as a beacon of clarity and purpose.

## Core Principles

### Less is More
Every element should serve a purpose. Remove anything that doesn't add value to the user experience.

### White Space is Your Friend
Don't fear empty space. It gives your content room to breathe and helps users focus on what matters.

### Typography Matters
Choose fonts carefully. Great typography can make or break a minimalist design.

## Benefits of Minimalism

- **Faster Loading**: Fewer elements mean faster page loads
- **Better UX**: Users can focus on what's important
- **Mobile Friendly**: Simpler designs work better on small screens
- **Timeless**: Minimalist designs age better than trendy ones

## Implementation Tips

1. Start with content, then add design
2. Use a limited color palette
3. Choose quality over quantity
4. Test with real users

Remember: Minimalism isn't about having less for the sake of it—it's about having just enough.`,
    excerpt: 'Discover the principles and benefits of minimalist web design, and learn how to create clean, focused user experiences.',
    slug: 'the-art-of-minimalist-web-design',
    author: {
      _id: 'author2',
      name: 'Sarah Chen',
      email: 'sarah@example.com'
    },
    status: 'published',
    visibility: 'public',
    featuredImage: 'https://images.unsplash.com/photo-1558618047-85c6c5d7ff5f?w=800&h=400&fit=crop',
    tags: ['Design', 'UI/UX', 'Minimalism', 'Web Design'],
    publishedAt: '2025-01-04T14:30:00Z',
    updatedAt: '2025-01-04T14:30:00Z',
    createdAt: '2025-01-04T13:00:00Z'
  },
  {
    _id: '3',
    title: 'Building APIs with Node.js and Express',
    content: `# Building APIs with Node.js and Express

Learn how to create robust, scalable APIs using Node.js and Express framework.

## Setting Up Express

First, let's create a basic Express server:

\`\`\`javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

## Key Concepts

### Middleware
Middleware functions execute during the request-response cycle:

\`\`\`javascript
app.use((req, res, next) => {
  console.log('Request received:', req.method, req.path);
  next();
});
\`\`\`

### Routing
Organize your routes for better maintainability:

\`\`\`javascript
const router = express.Router();

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserById);

app.use('/api', router);
\`\`\`

### Error Handling
Always implement proper error handling:

\`\`\`javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
\`\`\`

## Best Practices

1. **Use environment variables** for configuration
2. **Validate input data** before processing
3. **Implement proper authentication** and authorization
4. **Add rate limiting** to prevent abuse
5. **Use HTTPS** in production

Happy coding! 🚀`,
    excerpt: 'A comprehensive guide to building RESTful APIs with Node.js and Express, covering setup, middleware, routing, and best practices.',
    slug: 'building-apis-with-nodejs-and-express',
    author: {
      _id: 'author3',
      name: 'Mike Rodriguez',
      email: 'mike@example.com'
    },
    status: 'published',
    visibility: 'public',
    featuredImage: 'https://images.unsplash.com/photo-1558618047-85c6b5d7ff5f?w=800&h=400&fit=crop',
    tags: ['Node.js', 'Express', 'API', 'Backend', 'JavaScript'],
    publishedAt: '2025-01-03T09:15:00Z',
    updatedAt: '2025-01-03T09:15:00Z',
    createdAt: '2025-01-03T08:00:00Z'
  }
];

export const mockUser = {
  _id: 'user1',
  name: 'Demo User',
  email: 'demo@example.com'
};

// Mock user articles (articles authored by the current user)
export const mockUserArticles = [
  {
    _id: '1',
    title: 'My First Article',
    content: `# My First Article

This is my first article on this platform. I'm excited to share my thoughts and experiences with the community.

## About This Platform

This is a modern, minimalist blog platform built with React and Node.js. It features:

- Clean, distraction-free writing experience
- Markdown support with live preview
- Image upload functionality
- SEO-friendly URLs

## Getting Started

Writing on this platform is simple. Just click the "Write" button and start typing. You can use Markdown to format your content and upload images to make your articles more engaging.

Thanks for reading!`,
    excerpt: 'My first article on this platform, sharing thoughts about the writing experience and features.',
    slug: 'my-first-article',
    author: {
      _id: 'user1',
      name: 'Demo User',
      email: 'demo@example.com'
    },
    status: 'published',
    visibility: 'public',
    featuredImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop',
    tags: ['First Post', 'Welcome', 'Platform'],
    publishedAt: '2025-01-04T10:00:00Z',
    updatedAt: '2025-01-04T10:00:00Z',
    createdAt: '2025-01-04T09:30:00Z'
  },
  {
    _id: '4',
    title: 'Draft Article - Work in Progress',
    content: `# Draft Article - Work in Progress

This is a draft article that I'm still working on. It's not published yet, so only I can see it in my dashboard.

## Ideas to Explore

- Topic 1: Something interesting
- Topic 2: Another great idea
- Topic 3: Yet another concept

I'll continue working on this and publish it when it's ready.`,
    excerpt: 'A draft article that demonstrates the draft status functionality.',
    slug: 'draft-article-work-in-progress',
    author: {
      _id: 'user1',
      name: 'Demo User',
      email: 'demo@example.com'
    },
    status: 'draft',
    visibility: 'private',
    featuredImage: null,
    tags: ['Draft', 'Work in Progress'],
    publishedAt: null,
    updatedAt: '2025-01-05T14:30:00Z',
    createdAt: '2025-01-05T14:00:00Z'
  }
];
