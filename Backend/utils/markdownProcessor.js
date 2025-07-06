const { marked } = require('marked');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  highlight: function(code, lang) {
    // For syntax highlighting, we'll let the frontend handle this
    return `<pre><code class="language-${lang || 'text'}">${code}</code></pre>`;
  }
});

/**
 * Convert markdown to HTML with enhanced features
 */
const convertMarkdownToHTML = (markdown) => {
  try {
    // First convert markdown to HTML
    let html = marked(markdown);
    
    // Sanitize HTML to prevent XSS attacks
    html = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'div', 'span',
        'strong', 'b', 'em', 'i', 'u', 's', 'strike',
        'ul', 'ol', 'li',
        'a', 'img',
        'blockquote', 'pre', 'code',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'iframe' // For embeds
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'alt', 'src', 'width', 'height',
        'class', 'id', 'style',
        'frameborder', 'allow', 'allowfullscreen',
        'target', 'rel'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
    });
    
    return html;
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return markdown; // Return original markdown if conversion fails
  }
};

/**
 * Process article content for final rendering
 */
const processArticleContent = (article) => {
  let content = article.content;
  
  if (article.contentType === 'markdown') {
    // Convert markdown to HTML
    content = convertMarkdownToHTML(content);
    
    // Process media embeds
    if (article.media && article.media.length > 0) {
      article.media.forEach(mediaItem => {
        if (mediaItem.embedCode) {
          // Replace custom syntax with actual embed codes
          if (mediaItem.type === 'youtube' && mediaItem.metadata?.videoId) {
            const embedSyntax = `{{youtube:${mediaItem.metadata.videoId}}}`;
            content = content.replace(new RegExp(embedSyntax, 'g'), mediaItem.embedCode);
          }
          
          if (mediaItem.type === 'googledrive' && mediaItem.metadata?.fileId) {
            const embedSyntax = `{{googledrive:${mediaItem.metadata.fileId}}}`;
            content = content.replace(new RegExp(embedSyntax, 'g'), mediaItem.embedCode);
          }
        }
      });
    }
  }
  
  return content;
};

/**
 * Generate table of contents from markdown headings
 */
const generateTableOfContents = (markdown) => {
  const headings = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    headings.push({
      level,
      text,
      id,
      anchor: `#${id}`
    });
  }
  
  return headings;
};

/**
 * Extract all links from markdown content
 */
const extractLinks = (markdown) => {
  const links = [];
  
  // Markdown links: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = markdownLinkRegex.exec(markdown)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      type: 'markdown'
    });
  }
  
  // Plain URLs
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  const plainUrls = markdown.match(urlRegex) || [];
  
  plainUrls.forEach(url => {
    // Skip if already captured as markdown link
    const alreadyCaptured = links.some(link => link.url === url);
    if (!alreadyCaptured) {
      links.push({
        text: url,
        url: url,
        type: 'plain'
      });
    }
  });
  
  return links;
};

/**
 * Validate markdown syntax
 */
const validateMarkdownSyntax = (markdown) => {
  const errors = [];
  const warnings = [];
  
  // Check for unmatched brackets
  const openBrackets = (markdown.match(/\[/g) || []).length;
  const closeBrackets = (markdown.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push('Unmatched square brackets in markdown links');
  }
  
  // Check for unmatched parentheses in links
  const linkRegex = /\[([^\]]*)\]\(([^)]*)\)/g;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(markdown)) !== null) {
    const url = linkMatch[2];
    if (!url.trim()) {
      warnings.push(`Empty URL in link: ${linkMatch[0]}`);
    }
  }
  
  // Check for potential malformed code blocks
  const codeBlockMatches = markdown.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    errors.push('Unmatched code block delimiters (```)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Estimate reading time more accurately for rich content
 */
const estimateReadingTime = (markdown, mediaCount = 0) => {
  // Extract text content
  const textContent = markdown
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // Remove emphasis
    .replace(/\{\{[^}]+\}\}/g, '') // Remove custom embeds
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  const wordsPerMinute = 200;
  const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
  
  // Base reading time
  let readingTimeMinutes = wordCount / wordsPerMinute;
  
  // Add time for media content
  readingTimeMinutes += mediaCount * 0.5; // 30 seconds per media item
  
  // Add time for code blocks
  const codeBlocks = (markdown.match(/```[\s\S]*?```/g) || []).length;
  readingTimeMinutes += codeBlocks * 0.5; // 30 seconds per code block
  
  return Math.max(1, Math.ceil(readingTimeMinutes));
};

module.exports = {
  convertMarkdownToHTML,
  processArticleContent,
  generateTableOfContents,
  extractLinks,
  validateMarkdownSyntax,
  estimateReadingTime
};
