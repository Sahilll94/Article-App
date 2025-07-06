const mongoose = require('mongoose');
const slugify = require('slugify');
const {
  parseMarkdownMedia,
  extractTextFromMarkdown,
  calculateMarkdownReadingTime,
  validateMarkdownContent
} = require('../utils/markdownUtils');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters']
  },
  contentType: {
    type: String,
    enum: ['markdown', 'html'],
    default: 'markdown'
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  featuredImage: {
    url: String,
    publicId: String,
    alt: String,
    caption: String
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'youtube', 'googledrive', 'embed'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: String, // for Cloudinary assets
    title: String,
    description: String,
    embedCode: String, // for custom embeds
    thumbnail: String,
    position: Number, // order in the article
    metadata: {
      width: Number,
      height: Number,
      duration: Number, // for videos
      size: Number, // file size
      format: String
    }
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  readTime: {
    type: Number,
    default: 0 // in minutes
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  publishedAt: {
    type: Date
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
articleSchema.index({ slug: 1 });
articleSchema.index({ author: 1 });
articleSchema.index({ status: 1, visibility: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ createdAt: -1 });

// Generate slug before saving
articleSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString().slice(-6);
    this.slug = `${this.slug}-${timestamp}`;
  }
  next();
});

// Calculate read time based on content (enhanced for markdown)
articleSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    if (this.contentType === 'markdown') {
      this.readTime = calculateMarkdownReadingTime(this.content);
      
      // Parse and store media references
      const mediaItems = parseMarkdownMedia(this.content);
      this.media = mediaItems;
    } else {
      // Fallback for HTML content
      const wordsPerMinute = 200;
      const textContent = this.content.replace(/<[^>]*>/g, '');
      const wordCount = textContent.split(/\s+/).length;
      this.readTime = Math.ceil(wordCount / wordsPerMinute);
    }
  }
  next();
});

// Set publishedAt when status changes to published
articleSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Update excerpt if not provided (enhanced for markdown)
articleSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.excerpt) {
    let textContent;
    
    if (this.contentType === 'markdown') {
      textContent = extractTextFromMarkdown(this.content);
    } else {
      textContent = this.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    }
    
    this.excerpt = textContent.substring(0, 297);
    if (textContent.length > 297) {
      this.excerpt += '...';
    }
  }
  next();
});

// Virtual for like count
articleSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
articleSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Ensure virtuals are included in JSON output
articleSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Article', articleSchema);
