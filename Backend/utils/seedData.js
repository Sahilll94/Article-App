const Article = require('../models/Article');
const User = require('../models/User');

// Seed some sample data for development
const seedData = async () => {
  try {
    // Check if data already exists
    const userCount = await User.countDocuments();
    const articleCount = await Article.countDocuments();

    if (userCount > 0 || articleCount > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    // Create sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        bio: 'Tech enthusiast and blogger',
        isVerified: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        bio: 'Writer and content creator',
        isVerified: true
      }
    ];

    const createdUsers = await User.create(sampleUsers);
    console.log(`Created ${createdUsers.length} sample users`);

    // Create sample articles
    const sampleArticles = [
      {
        title: 'Getting Started with MERN Stack',
        content: `# Getting Started with MERN Stack

The MERN stack is a popular technology stack for building modern web applications. It consists of MongoDB, Express.js, React, and Node.js.

## What is MERN?

MERN is an acronym that stands for:

- **MongoDB** - A NoSQL database
- **Express.js** - A web application framework for Node.js  
- **React** - A JavaScript library for building user interfaces
- **Node.js** - A JavaScript runtime environment

## Video Tutorial

Check out this comprehensive tutorial on MERN stack:

https://www.youtube.com/watch?v=dQw4w9WgXcQ

## Benefits of MERN Stack

The MERN stack offers several advantages for developers:

1. Full-stack JavaScript development
2. Large community support
3. Excellent performance  
4. Cost-effective development

![MERN Stack Diagram](https://via.placeholder.com/600x300/4CAF50/white?text=MERN+Stack)

## Getting Started

To get started with MERN development, you'll need:

\`\`\`bash
# Install Node.js and npm
npm install -g create-react-app
npm install -g nodemon

# Create a new React app
create-react-app my-mern-app
\`\`\`

In this comprehensive guide, we'll explore how to build a complete application using the MERN stack.`,
        contentType: 'markdown',
        author: createdUsers[0]._id,
        status: 'published',
        visibility: 'public',
        tags: ['mern', 'javascript', 'web-development', 'react', 'nodejs'],
        category: 'Web Development'
      },
      {
        title: 'Building RESTful APIs with Express.js',
        content: `# Building RESTful APIs with Express.js

Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

## What is a RESTful API?

REST (Representational State Transfer) is an architectural style for designing networked applications. 

### Demo Video

Watch this practical demonstration:

https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view

## HTTP Methods

A RESTful API follows these principles:

- **GET** - Retrieve data
- **POST** - Create new data  
- **PUT** - Update existing data
- **DELETE** - Remove data

## Setting up Express.js

To get started with Express.js, you need to install it first:

\`\`\`bash
npm install express
\`\`\`

Then create a simple server:

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

## Advanced Patterns

Here's another helpful video about advanced Express patterns:

https://www.youtube.com/watch?v=abc123example

This covers middleware, error handling, and best practices for production applications.`,
        contentType: 'markdown',
        author: createdUsers[1]._id,
        status: 'published',
        visibility: 'public',
        tags: ['express', 'nodejs', 'api', 'rest', 'backend'],
        category: 'Backend Development'
      },
      {
        title: 'Draft: Advanced React Patterns',
        content: `# Advanced React Patterns

This is a draft article about advanced React patterns including:

## Patterns to Cover

- Higher-Order Components (HOCs)
- Render Props  
- Custom Hooks
- Context API
- Compound Components

## Video Resources

Planning to include this tutorial:

https://www.youtube.com/watch?v=react-patterns-123

More content to be added...

![React Logo](https://via.placeholder.com/400x200/61DAFB/white?text=React)`,
        contentType: 'markdown',
        author: createdUsers[0]._id,
        status: 'draft',
        visibility: 'private',
        tags: ['react', 'javascript', 'patterns'],
        category: 'Frontend Development'
      }
    ];

    const createdArticles = await Article.create(sampleArticles);
    console.log(`Created ${createdArticles.length} sample articles`);

    // Update user article counts
    for (const user of createdUsers) {
      const articleCount = await Article.countDocuments({ author: user._id });
      await User.findByIdAndUpdate(user._id, { articlesCount: articleCount });
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = { seedData };
