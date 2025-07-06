const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');

// Default timezone (you can change this to your preferred timezone)
const DEFAULT_TIMEZONE = 'Asia/Tokyo'; // Eastern Time
// You can also use: 'UTC', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', etc.

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Create pagination object
const createPagination = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / itemsPerPage);
  const skip = (currentPage - 1) * itemsPerPage;

  return {
    currentPage,
    totalPages,
    totalItems: total,
    itemsPerPage,
    skip,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

// Format error response
const formatErrorResponse = (message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode,
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

// Format success response with timezone handling
const formatSuccessResponse = (message, data = null, meta = null, timezone = DEFAULT_TIMEZONE) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    // Handle arrays
    if (Array.isArray(data)) {
      response.data = data.map(item => formatObjectDates(item, timezone));
    } else {
      // Handle single objects
      response.data = formatObjectDates(data, timezone);
    }
  }

  if (meta) {
    response.meta = meta;
  }

  return response;
};

// Generate random string
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Sanitize HTML content (basic)
const sanitizeContent = (content) => {
  // This is a basic sanitization - in production, use a library like DOMPurify
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '');
};

// Calculate reading time
const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Extract text from HTML
const extractTextFromHTML = (html) => {
  return html.replace(/<[^>]*>/g, '').trim();
};

// Generate article excerpt
const generateExcerpt = (content, maxLength = 297) => {
  const textContent = extractTextFromHTML(content);
  if (textContent.length <= maxLength) {
    return textContent;
  }
  return textContent.substring(0, maxLength) + '...';
};

// Format date with timezone
const formatDateWithTimezone = (date, timezone = DEFAULT_TIMEZONE) => {
  if (!date) return null;
  return moment(date).tz(timezone).format();
};

// Get current timestamp in specified timezone
const getCurrentTimestamp = (timezone = DEFAULT_TIMEZONE) => {
  return moment().tz(timezone).format();
};

// Convert UTC date to specified timezone
const convertToTimezone = (utcDate, timezone = DEFAULT_TIMEZONE) => {
  if (!utcDate) return null;
  return moment.utc(utcDate).tz(timezone).format();
};

// Format object dates with timezone
const formatObjectDates = (obj, timezone = DEFAULT_TIMEZONE) => {
  if (!obj) return obj;
  
  const dateFields = ['createdAt', 'updatedAt', 'publishedAt', 'lastLoginAt', 'timestamp'];
  let formatted = { ...obj };
  
  // Handle nested objects (like in toJSON())
  if (typeof obj.toJSON === 'function') {
    try {
      formatted = obj.toJSON();
    } catch (error) {
      console.error('Error calling toJSON:', error);
      // Fall back to the original object if toJSON fails
      formatted = { ...obj };
    }
  }
  
  // Process date fields at current level
  dateFields.forEach(field => {
    if (formatted[field]) {
      formatted[field] = convertToTimezone(formatted[field], timezone);
    }
  });
  
  // Recursively process nested objects
  Object.keys(formatted).forEach(key => {
    if (formatted[key] && typeof formatted[key] === 'object' && !Array.isArray(formatted[key]) && !(formatted[key] instanceof Date)) {
      // Skip MongoDB ObjectIds - they should remain as strings
      if (formatted[key].constructor && formatted[key].constructor.name === 'ObjectId') {
        formatted[key] = formatted[key].toString();
        return;
      }
      
      // Skip if it looks like an ObjectId that was already converted incorrectly
      if (typeof formatted[key] === 'object' && formatted[key]['0'] && formatted[key]['23'] && Object.keys(formatted[key]).length === 24) {
        // This looks like an ObjectId that was converted to character indices
        // Convert it back to a proper string
        const objectIdString = Object.keys(formatted[key]).sort((a, b) => parseInt(a) - parseInt(b)).map(k => formatted[key][k]).join('');
        formatted[key] = objectIdString;
        return;
      }
      
      // Handle Mongoose documents
      if (typeof formatted[key].toJSON === 'function') {
        try {
          formatted[key] = formatObjectDates(formatted[key].toJSON(), timezone);
        } catch (error) {
          console.error(`Error processing nested object ${key}:`, error);
          // Fall back to processing the object directly
          formatted[key] = formatObjectDates(formatted[key], timezone);
        }
      } else {
        formatted[key] = formatObjectDates(formatted[key], timezone);
      }
    }
  });
  
  return formatted;
};

// Middleware to add timezone to request
const addTimezoneToRequest = (req, res, next) => {
  // Get timezone from header, query param, or use default
  req.timezone = req.headers['x-timezone'] || 
                req.query.timezone || 
                req.body.timezone || 
                DEFAULT_TIMEZONE;
  next();
};

module.exports = {
  generateToken,
  createPagination,
  formatErrorResponse,
  formatSuccessResponse,
  generateRandomString,
  sanitizeContent,
  calculateReadingTime,
  extractTextFromHTML,
  generateExcerpt,
  formatDateWithTimezone,
  getCurrentTimestamp,
  convertToTimezone,
  formatObjectDates,
  addTimezoneToRequest
};
