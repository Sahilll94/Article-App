# Article App Backend

A robust backend API for a Medium-like blog application built with Node.js, Express.js, MongoDB, and Cloudinary.

## Features

- 🔐 **User Authentication**: JWT-based authentication with secure password hashing
- 📝 **Article Management**: Full CRUD operations for articles with draft/published status
- 🔒 **Privacy Controls**: Public/private article visibility settings
- 🏷️ **Content Organization**: Tags and categories for articles
- 🖼️ **Image Upload**: Cloudinary integration for image storage
- 💬 **Social Features**: Comments, likes, and user following system
- 🔍 **Search & Filtering**: Advanced search and filtering capabilities
- 📊 **Analytics**: View counts and engagement metrics
- 🚦 **SEO-Friendly URLs**: Automatic slug generation for articles
- 🛡️ **Security**: Rate limiting, input validation, and security headers
- 📑 **Rich Markdown Support**: Enhanced markdown with YouTube, Google Drive embeds
- 🎥 **Media Embeds**: Automatic conversion of video URLs to embeds
- 📖 **Content Processing**: Advanced markdown parsing with syntax highlighting
- 🔗 **Link Extraction**: Automatic link detection and processing

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs
- **Markdown Processing**: Marked.js with DOMPurify sanitization
- **Rich Content**: YouTube & Google Drive embed support

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Fill in your environment variables:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/article-app
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current user | Private |
| PUT | `/profile` | Update user profile | Private |
| POST | `/upload-avatar` | Upload user avatar | Private |
| POST | `/change-password` | Change password | Private |

### Article Routes (`/api/articles`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all published articles | Public |
| GET | `/my-articles` | Get current user's articles | Private |
| GET | `/:slug` | Get article by slug | Public/Private |
| POST | `/` | Create new article | Private |
| PUT | `/:id` | Update article | Private (Author) |
| DELETE | `/:id` | Delete article | Private (Author) |
| POST | `/:id/upload-image` | Upload article image | Private (Author) |
| POST | `/:id/like` | Like/unlike article | Private |
| POST | `/:id/comments` | Add comment | Private |
| DELETE | `/:id/comments/:commentId` | Delete comment | Private |

### User Routes (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all users | Public |
| GET | `/search` | Search users | Public |
| GET | `/:id` | Get user profile | Public |
| GET | `/:id/articles` | Get user's articles | Public |
| POST | `/:id/follow` | Follow/unfollow user | Private |
| GET | `/:id/followers` | Get user's followers | Public |
| GET | `/:id/following` | Get user's following | Public |

## Data Models

### User Model
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  bio: String,
  avatar: String,
  isVerified: Boolean,
  role: String,
  socialLinks: Object,
  followers: [ObjectId],
  following: [ObjectId],
  articlesCount: Number,
  timestamps: true
}
```

### Article Model
```javascript
{
  title: String,
  slug: String,
  content: String,
  contentType: String, // 'markdown' | 'html'
  excerpt: String,
  featuredImage: Object,
  media: [Object], // Embedded media items
  author: ObjectId,
  status: String, // 'draft' | 'published'
  visibility: String, // 'public' | 'private'
  tags: [String],
  category: String,
  readTime: Number,
  views: Number,
  likes: [Object],
  comments: [Object],
  publishedAt: Date,
  timestamps: true
}
```

## Rich Markdown Features

### Supported Content Types

1. **Markdown**: Enhanced markdown with rich media support
2. **HTML**: Traditional HTML content with sanitization

### Media Embed Support

#### YouTube Videos
- Paste any YouTube URL format
- Automatically converted to responsive embeds
- Supported formats:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://youtube.com/embed/VIDEO_ID`

#### Google Drive Videos
- Paste Google Drive file sharing URLs
- Automatically converted to preview embeds
- Supported format:
  - `https://drive.google.com/file/d/FILE_ID/view`

#### Images
- Standard markdown syntax: `![alt text](image-url)`
- Cloudinary integration for uploaded images
- Support for captions and alt text

#### Code Blocks
- Syntax highlighting support
- Multiple language support
- Inline and block code formatting

### Content Processing Pipeline

1. **Input**: Raw markdown or HTML content
2. **Validation**: Syntax validation and error checking
3. **Enhancement**: URL detection and embed conversion
4. **Storage**: Enhanced content with custom embed syntax
5. **Rendering**: Final HTML with actual embed codes

### Example Markdown Usage

```markdown
# My Article Title

This is a paragraph with **bold** and *italic* text.

## Embedded YouTube Video

https://www.youtube.com/watch?v=dQw4w9WgXcQ

## Google Drive Video

https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view

## Code Example

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});
```

## Image

![Article Banner](https://example.com/banner.jpg)

## Links and Lists

- [External Link](https://example.com)
- Another list item

1. Numbered list
2. Second item
```

### Media Processing

The system automatically:
- Detects YouTube and Google Drive URLs
- Generates responsive embed codes
- Creates thumbnails for videos
- Calculates enhanced reading time
- Validates embed accessibility

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for specific frontend origin
- **Helmet**: Security headers for protection
- **Input Validation**: Comprehensive validation using express-validator
- **Password Security**: bcrypt with salt rounds
- **JWT Security**: Secure token generation and verification

## File Upload

- **Storage**: Cloudinary for scalable image storage
- **Image Processing**: Automatic resizing and optimization
- **File Types**: Support for jpg, jpeg, png, gif, webp
- **Size Limits**: 5MB for avatars, 10MB for article images

## Error Handling

- Centralized error handling middleware
- Consistent error response format
- Environment-specific error details
- Comprehensive logging

## Response Format

All API responses follow a consistent format:

```javascript
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "meta": {...} // pagination info when applicable
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": [...] // validation errors when applicable
}
```

## Development

### Running Tests
```bash
npm test
```

### Code Style
- Follow JavaScript ES6+ standards
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Database Indexing
The following indexes are created for optimal performance:
- User: email, name
- Article: slug, author, status+visibility, tags, category, publishedAt, createdAt

## Deployment

1. Set environment variables in production
2. Use PM2 or similar for process management
3. Set up MongoDB with proper authentication
4. Configure Cloudinary for production use
5. Use HTTPS in production
6. Set up proper logging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
