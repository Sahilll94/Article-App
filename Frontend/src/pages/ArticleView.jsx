import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { articlesAPI } from '../utils/api';
import { formatDate, calculateReadingTime, extractTextFromMarkdown } from '../utils/helpers';
import { Calendar, Clock, ArrowLeft, Share2, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/SEOHead';

const ArticleView = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const response = await articlesAPI.getRenderedArticle(slug);
        
        // Backend returns { success: true, data: {...} }
        if (response.data && response.data.success) {
          setArticle(response.data.data);
        } else {
          setError('Article not found');
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching article:', err);
        if (err.response?.status === 404) {
          setError('Article not found');
        } else {
          setError('Failed to load article');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.share({
        title: article.title,
        text: article.excerpt || 'Check out this article',
        url: url,
      });
    } catch (err) {
      // Fallback to copying URL to clipboard
      try {
        await navigator.clipboard.writeText(url);
        // Could show a toast notification here
        alert('Article URL copied to clipboard!');
      } catch (clipboardErr) {
        console.error('Failed to share or copy URL:', clipboardErr);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <Link to="/" className="btn-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!article) return null;

  const plainTextContent = extractTextFromMarkdown(article.content || '');
  const readingTime = calculateReadingTime(plainTextContent);
  const isAuthor = isAuthenticated && user && user._id === article.author?._id;
  
  // Create excerpt for meta description (clean and concise)
  const createExcerpt = (text, maxLength = 160) => {
    if (!text) return 'Read this article on Article App';
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxLength) return cleaned;
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > maxLength - 30 ? truncated.substring(0, lastSpace) : truncated) + '...';
  };
  
  const excerpt = article.excerpt || createExcerpt(plainTextContent);
  const featuredImageUrl = article.featuredImage?.url || article.featuredImage;
  const articleUrl = window.location.href;

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title={article.title}
        description={excerpt}
        image={featuredImageUrl}
        url={articleUrl}
        type="article"
        author={article.author?.name}
        publishedTime={article.publishedAt || article.createdAt}
        modifiedTime={article.updatedAt}
        tags={article.tags || []}
      />
      
      <div className="min-h-screen bg-white">
      {/* Minimal Navigation Bar */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleShare} 
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {isAuthor && (
                <Link 
                  to={`/write?edit=${article.slug}`} 
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all"
                >
                  Edit
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Article Header */}
        <header className="mb-12">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            {article.title}
          </h1>

          {/* Author and Meta */}
          <div className="flex items-center mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 overflow-hidden rounded-full mr-4">
                {article.author?.avatar ? (
                  <img 
                    src={article.author.avatar} 
                    alt={article.author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {article.author?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <Link 
                  to={article.author?.username ? `/user/${article.author.username}` : '#'}
                  className="font-medium text-gray-900 text-lg hover:text-blue-600 transition-colors"
                >
                  {article.author?.name || 'Anonymous'}
                </Link>
                <div className="flex items-center text-gray-500 space-x-4 mt-1">
                  <time className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {formatDate(article.publishedAt || article.updatedAt, 'long')}
                  </time>
                  {readingTime > 0 && (
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />
                      {readingTime} min read
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {(article.featuredImage?.url || article.featuredImage) && (
            <div className="mb-12">
              <img 
                src={article.featuredImage?.url || article.featuredImage} 
                alt={article.featuredImage?.alt || article.title}
                className="w-full h-auto rounded-2xl shadow-lg"
              />
              {article.featuredImage?.caption && (
                <p className="text-sm text-gray-500 mt-4 text-center italic">
                  {article.featuredImage.caption}
                </p>
              )}
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className="prose prose-xl prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-pink-600 prose-code:bg-gray-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:italic prose-img:rounded-xl prose-img:shadow-md">
          {article.renderedContent ? (
            <div dangerouslySetInnerHTML={{ __html: article.renderedContent }} />
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                a: ({ href, children, ...props }) => {
                  const isExternal = href?.startsWith('http');
                  return (
                    <a
                      href={href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
                img: ({ src, alt, ...props }) => (
                  <img
                    src={src}
                    alt={alt}
                    className="w-full h-auto rounded-xl shadow-md my-8"
                    loading="lazy"
                    {...props}
                  />
                ),
                blockquote: ({ children, ...props }) => (
                  <blockquote
                    className="border-l-4 border-blue-500 bg-blue-50 pl-6 py-4 my-6 italic text-gray-700 rounded-r-lg"
                    {...props}
                  >
                    {children}
                  </blockquote>
                ),
                code: ({ inline, children, ...props }) => {
                  if (inline) {
                    return (
                      <code
                        className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code
                      className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {article.content}
            </ReactMarkdown>
          )}
        </article>

        {/* Tags Section */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-gray-50 text-gray-600 text-sm rounded-full hover:bg-gray-100 transition-colors cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Section */}
        {article.author?.bio && (
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 overflow-hidden rounded-full flex-shrink-0">
                {article.author?.avatar ? (
                  <img 
                    src={article.author.avatar} 
                    alt={article.author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-xl font-semibold text-white">
                      {article.author?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <Link 
                  to={article.author?.username ? `/user/${article.author.username}` : '#'}
                  className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors block"
                >
                  {article.author.name}
                </Link>
                <p className="text-gray-600 leading-relaxed">
                  {article.author.bio}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ArticleView;
