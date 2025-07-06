# 🔧 Environment Configuration

## Overview

The Article App frontend uses environment variables to configure different settings for development, staging, and production environments.

## 📋 Environment Variables

### Required Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` | `https://api.yoursite.com/api` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_NODE_ENV` | Environment mode | `development` | `production` |
| `VITE_APP_NAME` | Application name | `Article App` | `Your App Name` |
| `VITE_APP_VERSION` | Application version | `1.0.0` | `2.1.3` |

## 📁 Files Structure

```
Frontend/
├── .env                 # Environment variables (not in git)
├── .env.example         # Template for environment variables
├── src/utils/config.js  # Configuration utility
└── src/utils/api.js     # API client with env config
```

## 🚀 Setup Instructions

### 1. Create Environment File

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your values
nano .env
```

### 2. Configure for Different Environments

#### Development (.env)
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_NODE_ENV=development
VITE_APP_NAME=Article App (Dev)
```

#### Production (.env.production)
```bash
VITE_API_BASE_URL=https://your-api.com/api
VITE_NODE_ENV=production
VITE_APP_NAME=Article App
```

### 3. Using Environment Variables

#### In Components
```jsx
import config from '../utils/config';

const MyComponent = () => {
  console.log('API URL:', config.API_BASE_URL);
  console.log('App Name:', config.APP_NAME);
  console.log('Is Dev:', config.isDevelopment());
  
  return <div>{config.APP_NAME}</div>;
};
```

#### In API Calls
```javascript
import config from './config';

// The API client automatically uses config.API_BASE_URL
// You can also build custom URLs:
const customUrl = config.getApiUrl('/custom/endpoint');
```

## 🛠️ Configuration Utility

The `src/utils/config.js` file provides:

### Properties
- `API_BASE_URL` - Backend API URL
- `APP_NAME` - Application name
- `APP_VERSION` - Application version
- `NODE_ENV` - Environment mode

### Methods
- `isDevelopment()` - Check if in development mode
- `isProduction()` - Check if in production mode
- `debug(...args)` - Debug logging (only in development)
- `getApiUrl(endpoint)` - Build API URLs

### Example Usage
```javascript
import config from '../utils/config';

// Check environment
if (config.isDevelopment()) {
  console.log('Running in development mode');
}

// Debug logging (only shows in development)
config.debug('User logged in:', userData);

// Build API URLs
const userEndpoint = config.getApiUrl('/users/123');
// Result: http://localhost:5000/api/users/123
```

## 🔐 Security Notes

### Environment File Security
- ✅ `.env` is in `.gitignore` (not committed to git)
- ✅ Use `.env.example` as a template
- ⚠️ Only put non-sensitive data in frontend env vars
- ⚠️ Frontend env vars are visible to users

### Best Practices
```bash
# ✅ Good - API URLs, feature flags
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_ANALYTICS=true

# ❌ Bad - API keys, secrets (use backend instead)
VITE_SECRET_KEY=abc123  # This will be visible to users!
```

## 🌍 Deployment Environments

### Local Development
```bash
npm run dev
# Uses .env file
```

### Production Build
```bash
npm run build
# Uses .env.production if available, otherwise .env
```

### Environment-Specific Builds
```bash
# Development build
npm run build --mode development

# Staging build  
npm run build --mode staging

# Production build
npm run build --mode production
```

## 🐛 Troubleshooting

### Common Issues

1. **Environment variables not loading**
   ```bash
   # Check if .env exists
   ls -la .env
   
   # Restart dev server after changing .env
   npm run dev
   ```

2. **API calls failing**
   ```bash
   # Check API URL in browser console
   console.log(import.meta.env.VITE_API_BASE_URL);
   
   # Verify backend is running on the correct port
   curl http://localhost:5000/api/health
   ```

3. **Build failing**
   ```bash
   # Check for syntax errors in .env
   cat .env
   
   # Ensure no spaces around = in env vars
   VITE_API_BASE_URL=http://localhost:5000/api  # ✅ Good
   VITE_API_BASE_URL = http://localhost:5000/api # ❌ Bad
   ```

### Debug Commands

```bash
# View all environment variables
printenv | grep VITE_

# Check what Vite sees
npm run dev -- --debug

# Test API connection
curl $VITE_API_BASE_URL/health
```

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Environment Best Practices](https://12factor.net/config)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)

---

**Your API configuration is now flexible and environment-aware!** 🎉
