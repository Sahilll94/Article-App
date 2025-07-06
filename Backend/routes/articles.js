const express = require('express');
const Article = require('../models/Article');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const { uploadArticleImage, deleteImage } = require('../middleware/upload');
const {
  validateArticleCreate,
  validateArticleUpdate,
  validateComment
} = require('../middleware/validation');
const {
  createPagination,
  formatErrorResponse,
  formatSuccessResponse,
  sanitizeContent
} = require('../utils/helpers');
const {
  validateMarkdownContent,
  processMarkdownForRendering,
  enhanceMarkdownWithEmbeds
} = require('../utils/markdownUtils');

const router = express.Router();

// @route   GET /api/articles
// @desc    Get all published articles (public)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      tag,
      category,
      author,
      search,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {
      status: 'published',
      visibility: 'public'
    };

    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (author) {
      const authorUser = await User.findOne({ name: new RegExp(author, 'i') });
      if (authorUser) {
        query.author = authorUser._id;
      }
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { excerpt: new RegExp(search, 'i') }
      ];
    }

    // Count total documents
    const total = await Article.countDocuments(query);
    const pagination = createPagination(page, limit, total);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get articles
    const articles = await Article.find(query)
      .populate('author', 'name email avatar bio username')
      .sort(sortOptions)
      .skip(pagination.skip)
      .limit(pagination.itemsPerPage)
      .select('title slug excerpt featuredImage author status visibility tags category readTime views likeCount commentCount publishedAt createdAt updatedAt');

    res.json(
      formatSuccessResponse('Articles retrieved successfully', articles, pagination, req.timezone)
    );
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while retrieving articles')
    );
  }
});

// @route   GET /api/articles/my-articles
// @desc    Get current user's articles
// @access  Private
router.get('/my-articles', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      visibility,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { author: req.user.id };

    if (status) {
      query.status = status;
    }

    if (visibility) {
      query.visibility = visibility;
    }

    // Count total documents
    const total = await Article.countDocuments(query);
    const pagination = createPagination(page, limit, total);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get articles
    const articles = await Article.find(query)
      .populate('author', 'name email avatar username')
      .sort(sortOptions)
      .skip(pagination.skip)
      .limit(pagination.itemsPerPage);

    res.json(
      formatSuccessResponse('Your articles retrieved successfully', articles, pagination, req.timezone)
    );
  } catch (error) {
    console.error('Get my articles error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while retrieving your articles')
    );
  }
});

// @route   GET /api/articles/:slug
// @desc    Get article by slug (public for published articles)
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    // Build query - try to match by slug first, then by _id if it's a valid ObjectId
    let query = { slug };
    
    // If the parameter looks like an ObjectId, also try to find by _id
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ slug }, { _id: slug }] };
    }
    
    if (!req.user) {
      // Public access - only published and public articles
      query = { ...query, status: 'published', visibility: 'public' };
      // Handle the $or case
      if (query.$or) {
        query = {
          $and: [
            { $or: query.$or },
            { status: 'published', visibility: 'public' }
          ]
        };
      }
    }

    const article = await Article.findOne(query)
      .populate('author', 'name email avatar bio socialLinks username')
      .populate('comments.user', 'name avatar username')
      .populate('likes.user', 'name avatar username');

    if (!article) {
      return res.status(404).json(
        formatErrorResponse('Article not found', 404)
      );
    }

    // Check if user can access this article
    if (req.user) {
      const canAccess = 
        article.visibility === 'public' || 
        article.author._id.toString() === req.user.id ||
        req.user.role === 'admin';
      
      if (!canAccess) {
        return res.status(403).json(
          formatErrorResponse('Access denied', 403)
        );
      }
    }

    // Increment view count (only for published articles)
    if (article.status === 'published') {
      await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });
    }

    res.json(
      formatSuccessResponse('Article retrieved successfully', article, null, req.timezone)
    );
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while retrieving article')
    );
  }
});

// @route   POST /api/articles
// @desc    Create new article
// @access  Private
router.post('/', auth, validateArticleCreate, async (req, res) => {
  try {
    const { title, content, excerpt, status, visibility, tags, category, contentType, featuredImage } = req.body;

    // Validate content type
    const articleContentType = contentType || 'markdown';
    
    // Process content based on type
    let processedContent = content;
    
    if (articleContentType === 'markdown') {
      // Validate markdown content
      const validation = validateMarkdownContent(content);
      if (!validation.isValid) {
        return res.status(400).json(
          formatErrorResponse('Invalid markdown content', 400, validation.errors)
        );
      }
      
      // Enhance markdown with proper embed syntax
      processedContent = enhanceMarkdownWithEmbeds(content);
    } else {
      // Sanitize HTML content
      processedContent = sanitizeContent(content);
    }

    // Prepare featured image data
    let featuredImageData = null;
    if (featuredImage) {
      if (typeof featuredImage === 'string') {
        // If it's a string URL, convert to object format
        featuredImageData = {
          url: featuredImage,
          publicId: null // Will be null for URLs from content upload
        };
      } else if (typeof featuredImage === 'object') {
        // If it's already an object, use as is
        featuredImageData = featuredImage;
      }
    }

    const article = new Article({
      title,
      content: processedContent,
      contentType: articleContentType,
      excerpt,
      featuredImage: featuredImageData,
      author: req.user.id,
      status: status || 'draft',
      visibility: visibility || 'public',
      tags: tags || [],
      category: category || ''
    });

    await article.save();
    
    // Update user's articles count
    await User.findByIdAndUpdate(req.user.id, { $inc: { articlesCount: 1 } });

    // Populate author info
    await article.populate('author', 'name email avatar username');

    res.status(201).json(
      formatSuccessResponse('Article created successfully', article, null, req.timezone)
    );
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while creating article')
    );
  }
});

// @route   PUT /api/articles/:id
// @desc    Update article
// @access  Private (Author only)
router.put('/:id', auth, validateArticleUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, status, visibility, tags, category, featuredImage } = req.body;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json(
        formatErrorResponse('Article not found', 404)
      );
    }

    // Check if user is the author
    if (article.author.toString() !== req.user.id) {
      return res.status(403).json(
        formatErrorResponse('Access denied', 403)
      );
    }

    // Update fields
    const updateData = {};
    if (title) updateData.title = title;
    
    if (content) {
      // Process content based on article's content type
      if (article.contentType === 'markdown') {
        // Validate markdown content
        const validation = validateMarkdownContent(content);
        if (!validation.isValid) {
          return res.status(400).json(
            formatErrorResponse('Invalid markdown content', 400, validation.errors)
          );
        }
        
        // Enhance markdown with proper embed syntax
        updateData.content = enhanceMarkdownWithEmbeds(content);
      } else {
        // Sanitize HTML content
        updateData.content = sanitizeContent(content);
      }
    }
    
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (status) updateData.status = status;
    if (visibility) updateData.visibility = visibility;
    if (tags) updateData.tags = tags;
    if (category !== undefined) updateData.category = category;
    
    // Handle featured image update
    if (featuredImage !== undefined) {
      if (featuredImage === null || featuredImage === '') {
        // Remove featured image
        updateData.featuredImage = null;
      } else if (typeof featuredImage === 'string') {
        // If it's a string URL, convert to object format
        updateData.featuredImage = {
          url: featuredImage,
          publicId: null // Will be null for URLs from content upload
        };
      } else if (typeof featuredImage === 'object') {
        // If it's already an object, use as is
        updateData.featuredImage = featuredImage;
      }
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar username');

    res.json(
      formatSuccessResponse('Article updated successfully', updatedArticle, null, req.timezone)
    );
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while updating article')
    );
  }
});

// @route   DELETE /api/articles/:id
// @desc    Delete article
// @access  Private (Author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json(
        formatErrorResponse('Article not found', 404)
      );
    }

    // Check if user is the author
    if (article.author.toString() !== req.user.id) {
      return res.status(403).json(
        formatErrorResponse('Access denied', 403)
      );
    }

    // Delete featured image from Cloudinary if exists
    if (article.featuredImage && article.featuredImage.publicId) {
      try {
        await deleteImage(article.featuredImage.publicId);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    await Article.findByIdAndDelete(id);
    
    // Update user's articles count
    await User.findByIdAndUpdate(req.user.id, { $inc: { articlesCount: -1 } });

    res.json(
      formatSuccessResponse('Article deleted successfully')
    );
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while deleting article')
    );
  }
});

// @route   POST /api/articles/:id/upload-image
// @desc    Upload article featured image
// @access  Private (Author only)
router.post('/:id/upload-image', auth, uploadArticleImage.single('image'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json(
        formatErrorResponse('No file uploaded', 400)
      );
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json(
        formatErrorResponse('Article not found', 404)
      );
    }

    // Check if user is the author
    if (article.author.toString() !== req.user.id) {
      return res.status(403).json(
        formatErrorResponse('Access denied', 403)
      );
    }

    // Delete old image if exists
    if (article.featuredImage && article.featuredImage.publicId) {
      try {
        await deleteImage(article.featuredImage.publicId);
      } catch (err) {
        console.error('Error deleting old image:', err);
      }
    }

    // Update article with new image
    article.featuredImage = {
      url: req.file.path,
      publicId: req.file.filename
    };

    await article.save();

    res.json(
      formatSuccessResponse('Image uploaded successfully', {
        featuredImage: article.featuredImage
      })
    );
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while uploading image')
    );
  }
});

// @route   POST /api/articles/upload-content-image
// @desc    Upload image for article content (to be embedded while writing)
// @access  Private
router.post('/upload-content-image', auth, uploadArticleImage.single('image'), async (req, res) => {
  try {
    console.log('Content image upload request received');
    console.log('User:', req.user?.id);
    console.log('File:', req.file ? 'File received' : 'No file');
    
    if (!req.file) {
      console.log('No file provided in request');
      return res.status(400).json(
        formatErrorResponse('No image file provided', 400)
      );
    }

    console.log('File details:', {
      filename: req.file.filename,
      path: req.file.path,
      originalname: req.file.originalname
    });

    // Return the image URL that can be embedded in markdown
    const imageData = {
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      markdownSyntax: `![${req.file.originalname}](${req.file.path})`,
      htmlSyntax: `<img src="${req.file.path}" alt="${req.file.originalname}" />`
    };

    console.log('Returning image data:', imageData);
    res.json(
      formatSuccessResponse('Content image uploaded successfully', imageData)
    );
  } catch (error) {
    console.error('Upload content image error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while uploading content image')
    );
  }
});

// @route   POST /api/articles/:id/like
// @desc    Like/Unlike article
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json(
        formatErrorResponse('Article not found', 404)
      );
    }

    // Check if article is published and public
    if (article.status !== 'published' || article.visibility !== 'public') {
      return res.status(403).json(
        formatErrorResponse('Cannot like this article', 403)
      );
    }

    // Check if user already liked the article
    const existingLike = article.likes.find(
      like => like.user.toString() === req.user.id
    );

    if (existingLike) {
      // Unlike
      article.likes = article.likes.filter(
        like => like.user.toString() !== req.user.id
      );
    } else {
      // Like
      article.likes.push({ user: req.user.id });
    }

    await article.save();

    res.json(
      formatSuccessResponse(
        existingLike ? 'Article unliked' : 'Article liked',
        {
          liked: !existingLike,
          likeCount: article.likes.length
        }
      )
    );
  } catch (error) {
    console.error('Like article error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while processing like')
    );
  }
});

// @route   POST /api/articles/:id/comments
// @desc    Add comment to article
// @access  Private
router.post('/:id/comments', auth, validateComment, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json(
        formatErrorResponse('Article not found', 404)
      );
    }

    // Check if article is published and public
    if (article.status !== 'published' || article.visibility !== 'public') {
      return res.status(403).json(
        formatErrorResponse('Cannot comment on this article', 403)
      );
    }

    const comment = {
      user: req.user.id,
      content: content.trim()
    };

    article.comments.push(comment);
    await article.save();

    // Populate the new comment
    await article.populate('comments.user', 'name avatar');
    const newComment = article.comments[article.comments.length - 1];

    res.status(201).json(
      formatSuccessResponse('Comment added successfully', newComment, null, req.timezone)
    );
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while adding comment')
    );
  }
});

// @route   DELETE /api/articles/:id/comments/:commentId
// @desc    Delete comment
// @access  Private (Comment author only)
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json(
        formatErrorResponse('Article not found', 404)
      );
    }

    const comment = article.comments.id(commentId);

    if (!comment) {
      return res.status(404).json(
        formatErrorResponse('Comment not found', 404)
      );
    }

    // Check if user is the comment author or article author
    if (comment.user.toString() !== req.user.id && article.author.toString() !== req.user.id) {
      return res.status(403).json(
        formatErrorResponse('Access denied', 403)
      );
    }

    article.comments.pull(commentId);
    await article.save();

    res.json(
      formatSuccessResponse('Comment deleted successfully')
    );
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while deleting comment')
    );
  }
});

// @route   GET /api/articles/:slug/render
// @desc    Get article with processed markdown for frontend rendering
// @access  Public
router.get('/:slug/render', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    // Build query based on authentication
    let query = { slug };
    
    if (!req.user) {
      // Public access - only published and public articles
      query.status = 'published';
      query.visibility = 'public';
    }

    const article = await Article.findOne(query)
      .populate('author', 'name email avatar bio socialLinks username')
      .populate('comments.user', 'name avatar username')
      .populate('likes.user', 'name avatar username');

    if (!article) {
      return res.status(404).json(
        formatErrorResponse('Article not found', 404)
      );
    }

    // Check if user can access this article
    if (req.user) {
      const canAccess = 
        article.visibility === 'public' || 
        article.author._id.toString() === req.user.id ||
        req.user.role === 'admin';
      
      if (!canAccess) {
        return res.status(403).json(
          formatErrorResponse('Access denied', 403)
        );
      }
    }

    // Process content for rendering
    let renderedContent = article.content;
    
    if (article.contentType === 'markdown') {
      renderedContent = processMarkdownForRendering(article.content, article.media);
    }

    // Increment view count (only for published articles)
    if (article.status === 'published') {
      await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });
    }

    const articleData = {
      ...article.toJSON(),
      renderedContent
    };

    res.json(
      formatSuccessResponse('Article rendered successfully', articleData, null, req.timezone)
    );
  } catch (error) {
    console.error('Render article error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while rendering article')
    );
  }
});

// Test endpoint for Cloudinary
router.get('/test-cloudinary', auth, (req, res) => {
  const cloudinary = require('cloudinary').v2;
  
  // Test Cloudinary configuration
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT_SET'
  };
  
  res.json({
    success: true,
    message: 'Cloudinary test endpoint',
    config: config
  });
});

module.exports = router;
