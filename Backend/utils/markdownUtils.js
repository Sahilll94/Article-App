// Rich content utilities for handling markdown with embeds
const { marked } = require('marked');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create a DOMPurify instance
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// YouTube URL patterns
const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

// Google Drive patterns
const GOOGLE_DRIVE_REGEX = /(?:https?:\/\/)?(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=)([a-zA-Z0-9_-]+)/;

// General video file patterns
const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i;

// Image patterns
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;

/**
 * Extract YouTube video ID from URL
 */
const extractYouTubeId = (url) => {
  const match = url.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
};

/**
 * Extract Google Drive file ID from URL
 */
const extractGoogleDriveId = (url) => {
  const match = url.match(GOOGLE_DRIVE_REGEX);
  return match ? match[1] : null;
};

/**
 * Generate YouTube embed code
 */
const generateYouTubeEmbed = (videoId, options = {}) => {
  const { width = 560, height = 315, autoplay = false, start = 0 } = options;
  
  let embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const params = [];
  
  if (autoplay) params.push('autoplay=1');
  if (start > 0) params.push(`start=${start}`);
  
  if (params.length > 0) {
    embedUrl += '?' + params.join('&');
  }
  
  return {
    embedCode: `<iframe width="${width}" height="${height}" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    url: embedUrl,
    type: 'youtube'
  };
};

/**
 * Generate Google Drive embed code for videos
 */
const generateGoogleDriveEmbed = (fileId, options = {}) => {
  const { width = 640, height = 480 } = options;
  
  const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  
  return {
    embedCode: `<iframe src="${embedUrl}" width="${width}" height="${height}" allow="autoplay"></iframe>`,
    url: embedUrl,
    type: 'googledrive'
  };
};

/**
 * Parse markdown content and extract media references
 */
const parseMarkdownMedia = (markdownContent) => {
  const mediaItems = [];
  
  // Find YouTube links (both URLs and custom syntax)
  const youtubeMatches = markdownContent.match(new RegExp(YOUTUBE_REGEX.source, 'g'));
  if (youtubeMatches) {
    youtubeMatches.forEach((url, index) => {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        const embed = generateYouTubeEmbed(videoId);
        mediaItems.push({
          type: 'youtube',
          url: url,
          embedCode: embed.embedCode,
          thumbnail: embed.thumbnail,
          position: index,
          metadata: {
            videoId: videoId
          }
        });
      }
    });
  }
  
  // Also find custom YouTube embed syntax {{youtube:videoId}}
  const customYoutubeRegex = /\{\{youtube:([a-zA-Z0-9_-]{11})\}\}/g;
  let customYoutubeMatch;
  while ((customYoutubeMatch = customYoutubeRegex.exec(markdownContent)) !== null) {
    const videoId = customYoutubeMatch[1];
    const embed = generateYouTubeEmbed(videoId);
    
    // Check if this video isn't already in the media items
    const existingVideo = mediaItems.find(item => item.metadata?.videoId === videoId);
    if (!existingVideo) {
      mediaItems.push({
        type: 'youtube',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        embedCode: embed.embedCode,
        thumbnail: embed.thumbnail,
        position: mediaItems.length,
        metadata: {
          videoId: videoId
        }
      });
    }
  }
  
  // Find Google Drive links
  const driveMatches = markdownContent.match(new RegExp(GOOGLE_DRIVE_REGEX.source, 'g'));
  if (driveMatches) {
    driveMatches.forEach((url, index) => {
      const fileId = extractGoogleDriveId(url);
      if (fileId) {
        const embed = generateGoogleDriveEmbed(fileId);
        mediaItems.push({
          type: 'googledrive',
          url: url,
          embedCode: embed.embedCode,
          position: mediaItems.length,
          metadata: {
            fileId: fileId
          }
        });
      }
    });
  }
  
  // Also find custom Google Drive embed syntax {{googledrive:fileId}}
  const customDriveRegex = /\{\{googledrive:([a-zA-Z0-9_-]+)\}\}/g;
  let customDriveMatch;
  while ((customDriveMatch = customDriveRegex.exec(markdownContent)) !== null) {
    const fileId = customDriveMatch[1];
    const embed = generateGoogleDriveEmbed(fileId);
    
    // Check if this file isn't already in the media items
    const existingFile = mediaItems.find(item => item.metadata?.fileId === fileId);
    if (!existingFile) {
      mediaItems.push({
        type: 'googledrive',
        url: `https://drive.google.com/file/d/${fileId}/view`,
        embedCode: embed.embedCode,
        position: mediaItems.length,
        metadata: {
          fileId: fileId
        }
      });
    }
  }
  
  // Find image references
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let imageMatch;
  while ((imageMatch = imageRegex.exec(markdownContent)) !== null) {
    const [fullMatch, alt, src] = imageMatch;
    mediaItems.push({
      type: 'image',
      url: src,
      title: alt,
      position: mediaItems.length
    });
  }
  
  return mediaItems;
};

/**
 * Generate enhanced markdown with proper embed syntax
 */
const enhanceMarkdownWithEmbeds = (content) => {
  let enhancedContent = content;
  
  // Replace YouTube URLs with custom embed syntax
  enhancedContent = enhancedContent.replace(YOUTUBE_REGEX, (match, videoId) => {
    return `\n\n{{youtube:${videoId}}}\n\n`;
  });
  
  // Replace Google Drive URLs with custom embed syntax
  enhancedContent = enhancedContent.replace(GOOGLE_DRIVE_REGEX, (match, fileId) => {
    return `\n\n{{googledrive:${fileId}}}\n\n`;
  });
  
  return enhancedContent;
};

/**
 * Process markdown content for frontend rendering
 */
const processMarkdownForRendering = (content, media = []) => {
  let processedContent = content;
  
  // First, replace custom embed syntax with actual embeds from media array
  media.forEach((item) => {
    if (item.type === 'youtube' && item.metadata?.videoId) {
      const embedSyntax = `{{youtube:${item.metadata.videoId}}}`;
      processedContent = processedContent.replace(embedSyntax, item.embedCode);
    }
    
    if (item.type === 'googledrive' && item.metadata?.fileId) {
      const embedSyntax = `{{googledrive:${item.metadata.fileId}}}`;
      processedContent = processedContent.replace(embedSyntax, item.embedCode);
    }
  });
  
  // Handle any remaining custom embed syntax that wasn't in the media array
  // (for backward compatibility with existing articles)
  
  // Process remaining YouTube embeds
  const remainingYoutubeRegex = /\{\{youtube:([a-zA-Z0-9_-]{11})\}\}/g;
  processedContent = processedContent.replace(remainingYoutubeRegex, (match, videoId) => {
    const embed = generateYouTubeEmbed(videoId);
    return embed.embedCode;
  });
  
  // Process remaining Google Drive embeds
  const remainingDriveRegex = /\{\{googledrive:([a-zA-Z0-9_-]+)\}\}/g;
  processedContent = processedContent.replace(remainingDriveRegex, (match, fileId) => {
    const embed = generateGoogleDriveEmbed(fileId);
    return embed.embedCode;
  });
  
  // Convert markdown to HTML
  try {
    // Configure marked options
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
      sanitize: false, // We'll use DOMPurify instead
      highlight: function(code, lang) {
        // Basic code highlighting placeholder
        return `<code class="language-${lang || 'text'}">${code}</code>`;
      }
    });
    
    // Convert markdown to HTML
    const htmlContent = marked(processedContent);
    
    // Sanitize the HTML for security
    const sanitizedHtml = purify.sanitize(htmlContent, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'em', 'u', 's', 'del',
        'a', 'img', 'figure', 'figcaption',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'iframe', 'div', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'width', 'height', 'frameborder', 'allowfullscreen',
        'allow', 'data-*'
      ],
      ALLOW_DATA_ATTR: true
    });
    
    return sanitizedHtml;
  } catch (error) {
    console.error('Error processing markdown:', error);
    // Fallback: return processed content without HTML conversion
    return processedContent;
  }
};

/**
 * Extract plain text from markdown for search and excerpts
 */
const extractTextFromMarkdown = (markdown) => {
  return markdown
    // Remove headers
    .replace(/#{1,6}\s+/g, '')
    // Remove emphasis
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove custom embeds
    .replace(/\{\{[^}]+\}\}/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Calculate reading time for markdown content
 */
const calculateMarkdownReadingTime = (markdown) => {
  const plainText = extractTextFromMarkdown(markdown);
  const wordsPerMinute = 200;
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
  
  // Add extra time for media content
  const mediaCount = (markdown.match(/\{\{[^}]+\}\}/g) || []).length;
  const mediaTimeMinutes = mediaCount * 0.5; // 30 seconds per media item
  
  const readingTimeMinutes = wordCount / wordsPerMinute + mediaTimeMinutes;
  return Math.max(1, Math.ceil(readingTimeMinutes));
};

/**
 * Validate markdown content
 */
const validateMarkdownContent = (content) => {
  const errors = [];
  
  // Check for malformed YouTube embeds
  const youtubeMatches = content.match(/\{\{youtube:[^}]*\}\}/g);
  if (youtubeMatches) {
    youtubeMatches.forEach(match => {
      const videoId = match.match(/youtube:([^}]+)/)?.[1];
      if (!videoId || videoId.length !== 11) {
        errors.push(`Invalid YouTube video ID in: ${match}`);
      }
    });
  }
  
  // Check for malformed Google Drive embeds
  const driveMatches = content.match(/\{\{googledrive:[^}]*\}\}/g);
  if (driveMatches) {
    driveMatches.forEach(match => {
      const fileId = match.match(/googledrive:([^}]+)/)?.[1];
      if (!fileId || fileId.length < 10) {
        errors.push(`Invalid Google Drive file ID in: ${match}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  extractYouTubeId,
  extractGoogleDriveId,
  generateYouTubeEmbed,
  generateGoogleDriveEmbed,
  parseMarkdownMedia,
  enhanceMarkdownWithEmbeds,
  processMarkdownForRendering,
  extractTextFromMarkdown,
  calculateMarkdownReadingTime,
  validateMarkdownContent,
  YOUTUBE_REGEX,
  GOOGLE_DRIVE_REGEX,
  VIDEO_EXTENSIONS,
  IMAGE_EXTENSIONS
};
