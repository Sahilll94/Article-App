# Article App API Documentation - Postman Ready

## Base Configuration
- **Base URL**: `http://localhost:5000/api`
- **Content-Type**: `application/json` (for all POST/PUT requests)
- **Authorization**: `Bearer {{token}}` (use Postman variable)
- **Timezone**: `America/New_York` (default - can be overridden with headers)

## Environment Variables for Postman
Create these variables in your Postman environment:
- `baseUrl`: `http://localhost:5000/api`
- `token`: `your_jwt_token_here` (will be set after login)

---

## 🔐 Authentication Endpoints

### 1. Register User
**Method**: `POST`  
**URL**: `{{baseUrl}}/auth/register`  
**Headers**: 
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```
**Expected Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john@example.com",
      "bio": "",
      "avatar": "",
      "isVerified": false,
      "role": "user",
      "socialLinks": {
        "twitter": "",
        "linkedin": "",
        "website": ""
      },
      "followers": [],
      "following": [],
      "articlesCount": 0,
      "createdAt": "2024-01-01T05:00:00-05:00",
      "updatedAt": "2024-01-01T05:00:00-05:00"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
**Note**: Dates shown in Eastern Time (default). Add `x-timezone: Your/Timezone` header for your preferred timezone.

### 2. Login User
**Method**: `POST`  
**URL**: `{{baseUrl}}/auth/login`  
**Headers**: 
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```
**Expected Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
**Post-request Script** (to save token):
```javascript
if (responseCode.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
}
```

### 3. Get Current User
**Method**: `GET`  
**URL**: `{{baseUrl}}/auth/me`  
**Headers**: 
```
Authorization: Bearer {{token}}
```
**Expected Response** (200):
```json
{
  "success": true,
  "message": "User data retrieved",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "",
    "avatar": "",
    "followers": [],
    "following": []
  }
}
```

### 4. Update Profile
**Method**: `PUT`  
**URL**: `{{baseUrl}}/auth/profile`  
**Headers**: 
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "name": "John Updated",
  "bio": "Software Developer and Tech Blogger",
  "socialLinks": {
    "twitter": "https://twitter.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "website": "https://johndoe.dev"
  }
}
```

### 5. Upload Avatar
**Method**: `POST`  
**URL**: `{{baseUrl}}/auth/upload-avatar`  
**Headers**: 
```
Authorization: Bearer {{token}}
```
**Body** (form-data):
- Key: `avatar` (File)
- Value: Select image file

### 6. Change Password
**Method**: `POST`  
**URL**: `{{baseUrl}}/auth/change-password`  
**Headers**: 
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword123"
}
```

---

## 📝 Article Endpoints

### 7. Get All Published Articles
**Method**: `GET`  
**URL**: `{{baseUrl}}/articles`  
**Query Parameters**:
- `page`: 1 (optional)
- `limit`: 10 (optional)
- `search`: "react" (optional)
- `category`: "tech" (optional)
- `tag`: "javascript" (optional)
- `sortBy`: "publishedAt" (optional)
- `sortOrder`: "desc" (optional)

**Example URL**: `{{baseUrl}}/articles?page=1&limit=5&search=react`

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Articles retrieved successfully",
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Getting Started with React",
      "slug": "getting-started-with-react",
      "excerpt": "Learn the basics of React in this comprehensive guide...",
      "featuredImage": {
        "url": "https://res.cloudinary.com/...",
        "publicId": "article-app/articles/..."
      },
      "author": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": ""
      },
      "status": "published",
      "visibility": "public",
      "tags": ["react", "javascript", "tutorial"],
      "category": "Frontend Development",
      "readTime": 5,
      "views": 150,
      "likeCount": 12,
      "commentCount": 3,
      "publishedAt": "2024-01-01T00:00:00-05:00",
      "createdAt": "2024-01-01T00:00:00-05:00"
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 8. Get My Articles
**Method**: `GET`  
**URL**: `{{baseUrl}}/articles/my-articles`  
**Headers**: 
```
Authorization: Bearer {{token}}
```
**Query Parameters**:
- `page`: 1 (optional)
- `limit`: 10 (optional)
- `status`: "draft" or "published" (optional)
- `visibility`: "public" or "private" (optional)

### 9. Create Article (Markdown)
**Method**: `POST`  
**URL**: `{{baseUrl}}/articles`  
**Headers**: 
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "title": "My First Markdown Article",
  "content": "# Welcome to My Blog\n\nThis is **markdown** content with a [link](https://example.com).\n\n## Embedded Video\n\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\n\n## Code Example\n\n```javascript\nconsole.log('Hello World!');\n```\n\n![Sample Image](https://via.placeholder.com/600x300)",
  "contentType": "markdown",
  "excerpt": "A brief introduction to my blog with embedded content",
  "status": "published",
  "visibility": "public",
  "tags": ["markdown", "tutorial", "blog"],
  "category": "Tech"
}
```

### 10. Create Article (HTML)
**Method**: `POST`  
**URL**: `{{baseUrl}}/articles`  
**Headers**: 
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "title": "My HTML Article",
  "content": "<h1>Welcome</h1><p>This is <strong>HTML</strong> content with <a href='https://example.com'>a link</a>.</p>",
  "contentType": "html",
  "status": "draft",
  "visibility": "private",
  "tags": ["html", "web"],
  "category": "Web Development"
}
```

### 11. Get Article by Slug
**Method**: `GET`  
**URL**: `{{baseUrl}}/articles/{{articleSlug}}`  
**Headers** (optional for public articles): 
```
Authorization: Bearer {{token}}
```
**Description**: Use the `slug` from article creation response or article list  
**Example URL**: `{{baseUrl}}/articles/getting-started-with-react`

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Article retrieved successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Getting Started with React",
    "slug": "getting-started-with-react",
    "content": "# Getting Started with React\n\nThis is the full content...",
    "contentType": "markdown",
    "author": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "avatar": ""
    },
    "status": "published",
    "visibility": "public",
    "tags": ["react", "javascript"],
    "views": 150,
    "likes": [],
    "comments": []
  }
}
```

### 12. Get Rendered Article
**Method**: `GET`  
**URL**: `{{baseUrl}}/articles/{{articleSlug}}/render`  
**Description**: Returns article with fully processed content - converts markdown to HTML and embeds YouTube/Google Drive videos as iframes  
**Example URL**: `{{baseUrl}}/articles/getting-started-with-react/render`

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Article rendered successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Getting Started with React",
    "slug": "getting-started-with-react",
    "content": "# Getting Started with React\n\nThis is the original markdown...",
    "renderedContent": "<h1>Getting Started with React</h1><p>This is the processed HTML with YouTube/Drive embeds as iframes...</p>",
    "author": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe"
    }
  }
}
```

**What the render endpoint does:**
- ✅ Converts markdown syntax to HTML (`**bold**` → `<strong>bold</strong>`)
- ✅ Converts YouTube URLs to embedded iframes
- ✅ Converts Google Drive URLs to embedded iframes  
- ✅ Processes code blocks with syntax highlighting
- ✅ Sanitizes HTML for security
- ✅ Returns both original markdown (`content`) and processed HTML (`renderedContent`)

### 13. Update Article
**Method**: `PUT`  
**URL**: `{{baseUrl}}/articles/{{articleId}}`  
**Headers**: 
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Description**: Use the `_id` from article creation response or article list  
**Example URL**: `{{baseUrl}}/articles/60f7b3b3b3b3b3b3b3b3b3b3`

**Body** (raw JSON):
```json
{
  "title": "Updated Article Title",
  "content": "# Updated Content\n\nThis is the updated markdown content.",
  "status": "published",
  "visibility": "public"
}
```

### 14. Delete Article
**Method**: `DELETE`  
**URL**: `{{baseUrl}}/articles/{{articleId}}`  
**Headers**: 
```
Authorization: Bearer {{token}}
```
**Description**: Use the `_id` from article creation response or article list  
**Example URL**: `{{baseUrl}}/articles/60f7b3b3b3b3b3b3b3b3b3b3`

### 15. Upload Content Image (While Writing)
**Method**: `POST`  
**URL**: `{{baseUrl}}/articles/upload-content-image`  
**Headers**: 
```
Authorization: Bearer {{token}}
```
**Body** (form-data):
- Key: `image` (File)
- Value: Select image file

**Description**: Upload an image to embed in your article content while writing. Returns markdown and HTML syntax to insert into your article.

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Content image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/article-app/content/abc123.jpg",
    "publicId": "article-app/content/abc123",
    "originalName": "my-screenshot.png",
    "markdownSyntax": "![my-screenshot.png](https://res.cloudinary.com/your-cloud/image/upload/v1234567890/article-app/content/abc123.jpg)",
    "htmlSyntax": "<img src=\"https://res.cloudinary.com/your-cloud/image/upload/v1234567890/article-app/content/abc123.jpg\" alt=\"my-screenshot.png\" />"
  }
}
```

**How to use**:
1. Upload image using this endpoint
2. Copy the `markdownSyntax` from response
3. Paste it into your article content where you want the image
4. Save article as draft or publish

**💡 Article Writing Workflow with Images:**
1. Upload image using endpoint #15 above
2. Copy `markdownSyntax` from response: `![image.png](https://cloudinary.com/...)`
3. Paste it into your article content where you want the image
4. Create/save article with the embedded image markdown
5. Image will appear when article is rendered

### 16. Upload Featured Image (Article Cover)
**Method**: `POST`  
**URL**: `{{baseUrl}}/articles/{{articleId}}/upload-image`  
**Headers**: 
```
Authorization: Bearer {{token}}
```
**Body** (form-data):
- Key: `image` (File)
- Value: Select image file

**Description**: Upload a featured image (cover photo) for an existing article. This appears as the article's main image in listings and previews.

### 17. Like/Unlike Article
**Method**: `POST`  
**URL**: `{{baseUrl}}/articles/{{articleId}}/like`  
**Headers**: 
```
Authorization: Bearer {{token}}
```
**Expected Response** (200):
```json
{
  "success": true,
  "message": "Article liked",
  "data": {
    "liked": true,
    "likeCount": 13
  }
}
```

### 18. Add Comment
**Method**: `POST`  
**URL**: `{{baseUrl}}/articles/{{articleId}}/comments`  
**Headers**: 
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "content": "Great article! Thanks for sharing this valuable information."
}
```

### 19. Delete Comment
**Method**: `DELETE`  
**URL**: `{{baseUrl}}/articles/{{articleId}}/comments/{{commentId}}`  
**Headers**: 
```
Authorization: Bearer {{token}}
```

---

## 👥 User Endpoints

### 20. Get User Profile
**Method**: `GET`  
**URL**: `{{baseUrl}}/users/{{userId}}`  
**Headers** (optional): 
```
Authorization: Bearer {{token}}
```
**Expected Response** (200):
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Software Developer and Tech Blogger",
    "avatar": "https://res.cloudinary.com/...",
    "socialLinks": {
      "twitter": "https://twitter.com/johndoe",
      "linkedin": "https://linkedin.com/in/johndoe",
      "website": "https://johndoe.dev"
    },
    "followers": [],
    "following": [],
    "publishedArticlesCount": 5,
    "followersCount": 10,
    "followingCount": 15,
    "createdAt": "2024-01-01T05:00:00-05:00"
  }
}
```

### 21. Get User Articles
**Method**: `GET`  
**URL**: `{{baseUrl}}/users/{{userId}}/articles`  
**Query Parameters**:
- `page`: 1 (optional)
- `limit`: 10 (optional)

### 22. Follow/Unfollow User
**Method**: `POST`  
**URL**: `{{baseUrl}}/users/{{userId}}/follow`  
**Headers**: 
```
Authorization: Bearer {{token}}
```
**Expected Response** (200):
```json
{
  "success": true,
  "message": "User followed successfully",
  "data": {
    "isFollowing": true,
    "followersCount": 11
  }
}
```

### 23. Get User Followers
**Method**: `GET`  
**URL**: `{{baseUrl}}/users/{{userId}}/followers`  
**Query Parameters**:
- `page`: 1 (optional)
- `limit`: 20 (optional)

### 24. Get User Following
**Method**: `GET`  
**URL**: `{{baseUrl}}/users/{{userId}}/following`  
**Query Parameters**:
- `page`: 1 (optional)
- `limit`: 20 (optional)

### 25. Search Users
**Method**: `GET`  
**URL**: `{{baseUrl}}/users/search`  
**Query Parameters**:
- `q`: "john" (required, min 2 characters)
- `page`: 1 (optional)
- `limit`: 10 (optional)

**Example URL**: `{{baseUrl}}/users/search?q=john&page=1&limit=5`

### 26. Get All Users
**Method**: `GET`  
**URL**: `{{baseUrl}}/users`  
**Query Parameters**:
- `page`: 1 (optional)
- `limit`: 10 (optional)
- `sortBy`: "createdAt" (optional)
- `sortOrder`: "desc" (optional)

---

## 🏥 Health Check

### 27. Health Check
**Method**: `GET`  
**URL**: `{{baseUrl}}/health`  
**Headers** (optional):
```
X-Timezone: America/Los_Angeles
```
**Expected Response** (200):
```json
{
  "message": "Server is running!",
  "timestamp": "2024-01-01T00:00:00-05:00"
}
```
*Note: Timestamp will be in the timezone specified in headers, or Eastern Time (default)*

---

## � How to Get Article Slug and Article ID

### Getting Article Slug
The **slug** is automatically generated when you create an article and can be found in:

**Note**: Slugs are now clean and SEO-friendly (e.g., `my-first-article`) without random numbers. If you create articles with identical titles, the system will automatically append a number (e.g., `my-first-article-2`) to ensure uniqueness.

1. **Article Creation Response** (endpoint #9 or #10):
```json
{
  "success": true,
  "message": "Article created successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "My First Article",
    "slug": "my-first-article",  // ← Use this for slug-based endpoints
    "content": "...",
    // ... rest of article data
  }
}
```

2. **Get All Articles Response** (endpoint #7):
```json
{
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "slug": "my-first-article",  // ← Use this for slug-based endpoints
      "title": "My First Article"
    }
  ]
}
```

3. **Get My Articles Response** (endpoint #8):
```json
{
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "slug": "my-first-article",  // ← Use this for slug-based endpoints
      "title": "My First Article"
    }
  ]
}
```

### Getting Article ID
The **_id** (articleId) is the unique MongoDB ObjectId and can be found in:

1. **Article Creation Response** (endpoint #9 or #10):
```json
{
  "success": true,
  "message": "Article created successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",  // ← Use this for ID-based endpoints
    "title": "My First Article",
    "slug": "my-first-article",
    // ... rest of article data
  }
}
```

2. **Any Article List Response**:
```json
{
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",  // ← Use this for ID-based endpoints
      "slug": "my-first-article",
      "title": "My First Article"
    }
  ]
}
```

### Postman Environment Variables Setup
To make testing easier, you can save these values as Postman variables:

**After creating an article, add this to your Tests tab:**
```javascript
if (responseCode.code === 201) {
    const response = pm.response.json();
    pm.environment.set("articleId", response.data._id);
    pm.environment.set("articleSlug", response.data.slug);
}
```

**After getting articles list, add this to save the first article:**
```javascript
if (responseCode.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.length > 0) {
        pm.environment.set("articleId", response.data[0]._id);
        pm.environment.set("articleSlug", response.data[0].slug);
    }
}
```

### Example Testing Flow

1. **Create Article** → Save `articleId` and `articleSlug` from response
2. **Get Article by Slug** → Use saved `{{articleSlug}}` (returns raw markdown)
3. **Get Rendered Article** → Use saved `{{articleSlug}}/render` (returns processed HTML)
4. **Update Article** → Use saved `{{articleId}}`
5. **Delete Article** → Use saved `{{articleId}}`

### When to Use Slug vs ID

**Use Slug for:**
- ✅ Public article viewing (shareable URLs)
- ✅ SEO-friendly URLs  
- ✅ Getting raw markdown content
- ✅ Getting rendered HTML content (with `/render`)

**Use ID for:**
- ✅ Article management (update, delete)
- ✅ Admin operations
- ✅ API operations that modify the article

---

### 1. Setup Environment
Create a new environment with:
- `baseUrl`: `http://localhost:5000/api`
- `token`: (leave empty, will be auto-filled)

### 2. Authentication Flow
1. **Register** a new user
2. **Login** with credentials (token will be saved automatically)
3. **Get Current User** to verify authentication

### 3. Article Management Flow
1. **Create Article** with markdown content
2. **Get All Articles** to see your article
3. **Get Article by Slug** to view details
4. **Update Article** to modify content
5. **Upload Image** for featured image
6. **Get Rendered Article** to see processed content

### 4. Social Features Flow
1. **Like Article** to test engagement
2. **Add Comment** to test discussions
3. **Follow User** to test social features

### 5. Test Different Content Types
1. Create article with **YouTube URL** in markdown
2. Create article with **Google Drive URL** in markdown
3. Create article with **HTML content**
4. Use **render endpoint** to see processed embeds

---

## 📚 Reference Information

### Supported Content Types
- **markdown**: Enhanced markdown with auto-embed detection
- **html**: Traditional HTML with sanitization

### Article Status Values
- **draft**: Not published, only visible to author
- **published**: Published and visible based on visibility setting

### Article Visibility Values  
- **public**: Visible to everyone, shareable without login
- **private**: Only visible to author

### User Roles
- **user**: Regular user (default)
- **admin**: Administrator with extended permissions

### Supported YouTube URL Formats
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID&t=30s`

### Supported Google Drive URL Formats
- `https://drive.google.com/file/d/FILE_ID/view`
- `https://drive.google.com/open?id=FILE_ID`

### Example Markdown with Embeds
```markdown
# My Tech Article

This is a comprehensive guide about **React development**.

## Video Tutorial

Check out this helpful tutorial:
https://www.youtube.com/watch?v=dQw4w9WgXcQ

## Demo Video

Here's a demo I recorded:
https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view

## Code Example

```javascript
import React from 'react';

function App() {
  return <h1>Hello World!</h1>;
}

export default App;
```

## Important Image

![React Architecture](https://via.placeholder.com/600x300/61DAFB/white?text=React)

[Learn more about React](https://reactjs.org)
```

**After rendering with `/render` endpoint:**
```html
<h1>My Tech Article</h1>
<p>This is a comprehensive guide about <strong>React development</strong>.</p>

<h2>Video Tutorial</h2>
<p>Check out this helpful tutorial:</p>
<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>

<h2>Demo Video</h2>
<p>Here's a demo I recorded:</p>
<iframe src="https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview" width="640" height="480" allow="autoplay"></iframe>

<h2>Code Example</h2>
<pre><code class="language-javascript">import React from 'react';

function App() {
  return &lt;h1&gt;Hello World!&lt;/h1&gt;;
}

export default App;
</code></pre>

<h2>Important Image</h2>
<p><img src="https://via.placeholder.com/600x300/61DAFB/white?text=React" alt="React Architecture"></p>

<p><a href="https://reactjs.org">Learn more about React</a></p>
```

### Error Response Examples

**Validation Error (400)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errors": [
    {
      "field": "title",
      "message": "Title must be between 5 and 200 characters"
    },
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

**Authentication Error (401)**:
```json
{
  "success": false,
  "message": "No token, authorization denied",
  "statusCode": 401
}
```

**Not Found Error (404)**:
```json
{
  "success": false,
  "message": "Article not found",
  "statusCode": 404
}
```

**Server Error (500)**:
```json
{
  "success": false,
  "message": "Server error while creating article",
  "statusCode": 500
}
```

---

## 🚀 Quick Start with Postman

1. **Import Collection**: Copy endpoints into new Postman collection
2. **Set Environment**: Create environment with `baseUrl` and `token` variables
3. **Test Health**: Start with health check endpoint
4. **Register/Login**: Create account and get authentication token
5. **Create Content**: Test article creation with markdown
6. **Test Embeds**: Create article with YouTube/Google Drive URLs
7. **Social Features**: Test likes, comments, and following

### Pro Tips for Testing
- Use `{{$randomEmail}}` for dynamic email generation
- Use `{{$randomFirstName}}` for dynamic names
- Set up test scripts to automatically save tokens
- Create test data sets for bulk testing
- Use Postman's pre-request scripts for dynamic data

---

## 🌍 Timezone Support

**All date/time fields in API responses are timezone-aware!**

### Default Timezone
- **Default**: `America/New_York` (Eastern Time)
- Applied when no timezone is specified in requests

### How to Specify Timezone
You can specify your preferred timezone in **any of these ways**:

**1. Request Header** (Recommended):
```
x-timezone: Asia/Tokyo
```

**2. Query Parameter**:
```
?timezone=Europe/London
```

**3. Request Body** (for POST/PUT requests):
```json
{
  "timezone": "Australia/Sydney",
  "title": "My Article"
}
```

### Supported Timezone Examples
- `UTC` - Coordinated Universal Time
- `America/New_York` - Eastern Time (US)
- `America/Los_Angeles` - Pacific Time (US)
- `America/Chicago` - Central Time (US)
- `Europe/London` - British Time
- `Europe/Paris` - Central European Time
- `Asia/Tokyo` - Japan Standard Time
- `Asia/Kolkata` - India Standard Time
- `Australia/Sydney` - Australian Eastern Time

### Date Fields Affected
All these fields are automatically converted to your specified timezone:
- `createdAt` - When the record was created
- `updatedAt` - When the record was last modified
- `publishedAt` - When the article was published
- `timestamp` - General timestamp fields

### Example: Health Check with Timezone
**Without timezone** (uses default):
```bash
GET /api/health
Response: {"timestamp": "2025-07-05T12:20:01-04:00"}  // Eastern Time
```

**With timezone header**:
```bash
GET /api/health
Headers: x-timezone: Asia/Tokyo
Response: {"timestamp": "2025-07-06T01:20:01+09:00"}  // Tokyo Time
```

**With query parameter**:
```bash
GET /api/health?timezone=Europe/London
Response: {"timestamp": "2025-07-05T17:20:01+01:00"}  // London Time
```

### Postman Setup for Timezone Testing
Add this to your Postman environment:
- `timezone`: `Asia/Tokyo` (or your preferred timezone)

Then use in headers:
```
x-timezone: {{timezone}}
```

---

## ⚙️ Configuration & Administration

### Changing Default Timezone
To change the default timezone for your server:

1. **Edit** `utils/helpers.js`
2. **Change** the `DEFAULT_TIMEZONE` constant:
```javascript
const DEFAULT_TIMEZONE = 'Your/Preferred_Timezone'; // Change this line
```

**Popular timezone options:**
- `UTC` - For global applications
- `America/New_York` - US Eastern Time
- `America/Los_Angeles` - US Pacific Time
- `Europe/London` - UK Time
- `Asia/Tokyo` - Japan Time
- `Asia/Kolkata` - India Time
- `Australia/Sydney` - Australian Time

3. **Restart** your server after making changes

### Environment Variables
Make sure these are set in your `.env` file:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLOUDINARY_CLOUD_NAME` - Cloudinary account name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `FRONTEND_URL` - Your frontend URL for CORS

### MongoDB Timezone Handling
- **Storage**: All dates are stored in UTC in MongoDB (recommended practice)
- **API Response**: Dates are converted to your specified timezone before sending
- **AWS Hosting**: Works seamlessly with MongoDB hosted on AWS
- **Consistency**: Ensures consistent date handling across different server locations

---