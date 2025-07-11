# Article App

A modern, full-stack article publishing platform built with React, Node.js, and MongoDB. Share your thoughts, connect with writers, and discover inspiring content.

## ✨ Features

### 📝 **Content Management**
- Rich markdown editor with live preview
- Article drafts and publishing workflow
- Featured image uploads with Cloudinary integration
- SEO-optimized article pages with meta tags
- Article preview functionality before publishing
- Tag and category organization

### 👥 **Social Features**
- User profiles with bio and social links
- Follow/unfollow system
- View followers and following lists
- User discovery through profiles
- Google OAuth authentication
- Traditional email/password auth

### 🎨 **User Experience**
- Responsive design for all devices
- Modern, minimalist UI
- Dark/light theme support
- Real-time connection status
- Error boundaries and graceful error handling
- Loading states and skeleton screens

### 🔧 **Technical Features**
- JWT authentication with secure token management
- File upload with Cloudinary integration
- MongoDB with Mongoose ODM
- RESTful API architecture
- Rate limiting and security middleware
- Environment-based configuration

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Firebase project (for Google OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/article-app.git
   cd article-app
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   ```

### Environment Configuration

#### Backend Environment (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/article-app

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend Environment (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_APP_ENV=development

# Firebase Client
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Running the Application

1. **Start the Backend**
   ```bash
   cd Backend
   npm start
   ```

2. **Start the Frontend**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Access the App**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## 📁 Project Structure

```
Article-App/
├── Backend/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin setup
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── upload.js            # Cloudinary uploads
│   │   └── validation.js        # Request validation
│   ├── models/
│   │   ├── Article.js           # Article schema
│   │   └── User.js              # User schema
│   ├── routes/
│   │   ├── articles.js          # Article CRUD
│   │   ├── auth.js              # Authentication
│   │   └── users.js             # User management & follow system
│   ├── utils/
│   │   └── helpers.js           # Utility functions
│   └── server.js                # Express server
├── Frontend/
│   ├── public/
│   │   ├── _redirects           # Netlify redirects
│   │   └── vercel.json          # Vercel config
│   ├── src/
│   │   ├── components/
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── FollowButton.jsx
│   │   │   ├── FollowList.jsx
│   │   │   ├── FollowModal.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── SEOHead.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state
│   │   ├── pages/
│   │   │   ├── ArticleView.jsx  # Article reading page
│   │   │   ├── Dashboard.jsx    # User dashboard
│   │   │   ├── Home.jsx         # Homepage with articles
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── NotFound.jsx     # 404 page
│   │   │   ├── Preview.jsx      # Article preview
│   │   │   ├── Profile.jsx      # User profile editor
│   │   │   ├── PublicProfile.jsx # Public user profiles
│   │   │   ├── Register.jsx     # Registration page
│   │   │   └── Write.jsx        # Article editor
│   │   ├── services/
│   │   │   └── firebaseAuth.js  # Firebase client
│   │   ├── utils/
│   │   │   ├── api.js           # API client
│   │   │   ├── config.js        # App configuration
│   │   │   └── helpers.js       # Utility functions
│   │   └── App.jsx              # Main app component
│   └── package.json
└── README.md
```

## 🔐 Authentication

The app supports two authentication methods:

### Email/Password
- User registration with email verification
- Secure password hashing with bcrypt
- JWT token-based authentication

### Google OAuth
- Firebase Google Sign-In integration
- Seamless account creation and login
- Secure token verification on backend

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth

### Articles
- `GET /api/articles` - Get published articles
- `GET /api/articles/:slug` - Get article by slug
- `POST /api/articles` - Create new article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `POST /api/articles/:id/like` - Like/unlike article

### Users & Social
- `GET /api/users/username/:username` - Get user by username
- `POST /api/users/:id/follow` - Follow/unfollow user
- `GET /api/users/:id/followers` - Get user followers
- `GET /api/users/:id/following` - Get user following
- `GET /api/users/:id/follow-status` - Check follow status

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Configure MongoDB Atlas connection
3. Set up Cloudinary and Firebase credentials
4. Deploy to platforms like Railway, Render, or Heroku

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to Netlify, Vercel, or any static hosting
3. Configure environment variables
4. Set up redirects for client-side routing

### Production Environment Variables
Ensure all sensitive keys are properly configured in your hosting platform's environment settings.

### 🔒 Security Considerations

#### Production Checklist
- [ ] All environment variables are set on hosting platform (not in code)
- [ ] Debug logging is disabled in production builds
- [ ] API keys and tokens are never logged or exposed
- [ ] CORS origins are properly configured for production domains
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced on both frontend and backend

#### Environment Variables Security
- Never commit `.env` files to version control
- Use your hosting platform's environment variable settings
- Rotate API keys and secrets regularly
- Use different Firebase projects for development and production

## 🛠 Development

### Available Scripts

#### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🤝 Support

If you have any questions or need help, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**Built with ❤️ using React, Node.js, and MongoDB**
