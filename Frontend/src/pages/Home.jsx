import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI } from '../utils/api';
import { formatDate, calculateReadingTime, extractTextFromMarkdown, truncateText } from '../utils/helpers';
import { Clock, Calendar, ArrowRight, User } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await articlesAPI.getArticles({ 
          limit: 20 
        });
        
        // Backend returns { success: true, data: [...], meta: {...} }
        if (response.data && response.data.success) {
          setArticles(response.data.data || []);
          setError(null);
        } else {
          setError('Invalid response from server');
          setArticles([]);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(`Failed to load articles: ${err.response?.data?.message || err.message || 'Server connection error'}`);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="space-y-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/5"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-6 font-medium">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title="Discover Stories That Inspire"
        description="Discover thoughtful writing, share your ideas, and connect with a community of curious minds on Article App."
        url="/"
        type="website"
      />
      
      <div className="min-h-screen bg-white scrollbar-minimal">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Stories that
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> inspire</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover thoughtful writing, share your ideas, and connect with a community of curious minds.
          </p>
        </div>

        {/* Articles */}
        {!Array.isArray(articles) || articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No stories yet</h3>
            <p className="text-gray-600 mb-8 text-lg">Be the first to share your thoughts with the world.</p>
            <Link 
              to="/write" 
              className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Start Writing
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {articles.map((article, index) => {
              const plainTextContent = extractTextFromMarkdown(article.content);
              const readingTime = calculateReadingTime(plainTextContent);
              const excerpt = truncateText(plainTextContent, 160);
              const isFirstArticle = index === 0;

              // Debug: Check if author has username
              if (article.author) {
                console.log('Article author:', {
                  name: article.author.name,
                  username: article.author.username,
                  id: article.author._id
                });
              }

              return (
                <article 
                  key={article._id} 
                  className={`group ${isFirstArticle ? 'pb-16 border-b border-gray-100' : ''}`}
                >
                  <div className={`grid gap-8 ${isFirstArticle ? 'md:grid-cols-2 items-center' : 'md:grid-cols-3'}`}>
                    {/* Featured image */}
                    {(article.featuredImage?.url || article.featuredImage) && (
                      <div className={`${isFirstArticle ? 'order-2 md:order-1' : 'md:col-span-1'}`}>
                        <Link to={`/article/${article.slug}`}>
                          <img 
                            src={article.featuredImage?.url || article.featuredImage} 
                            alt={article.featuredImage?.alt || article.title}
                            className={`w-full object-cover rounded-xl group-hover:opacity-90 transition-opacity ${
                              isFirstArticle ? 'h-80' : 'h-48'
                            }`}
                            loading="lazy"
                          />
                        </Link>
                      </div>
                    )}

                    {/* Content */}
                    <div className={`${
                      (article.featuredImage?.url || article.featuredImage) 
                        ? (isFirstArticle ? 'order-1 md:order-2' : 'md:col-span-2') 
                        : (isFirstArticle ? 'md:col-span-2' : 'md:col-span-3')
                    }`}>
                      {/* Author and metadata */}
                      <div className="flex items-center mb-4">
                        <Link 
                          to={article.author?.username ? `/user/${article.author.username}` : '#'}
                          className="w-10 h-10 mr-3 overflow-hidden rounded-full hover:opacity-80 transition-opacity"
                        >
                          {article.author?.avatar ? (
                            <img 
                              src={article.author.avatar} 
                              alt={article.author.name || 'Author'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-sm font-semibold text-white">
                                {article.author?.name?.charAt(0)?.toUpperCase() || 'A'}
                              </span>
                            </div>
                          )}
                        </Link>
                        <div>
                          <Link 
                            to={article.author?.username ? `/user/${article.author.username}` : '#'}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {article.author?.name || 'Anonymous'}
                          </Link>
                          <div className="flex items-center text-sm text-gray-500 space-x-3">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(article.publishedAt || article.updatedAt, 'short')}
                            </span>
                            {readingTime > 0 && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {readingTime} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Article content */}
                      <Link 
                        to={`/article/${article.slug}`}
                        className="block group-hover:scale-[1.02] transition-transform duration-200"
                      >
                        <h2 className={`font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors leading-tight ${
                          isFirstArticle ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'
                        }`}>
                          {article.title}
                        </h2>
                        {excerpt && (
                          <p className={`text-gray-600 leading-relaxed ${
                            isFirstArticle ? 'text-lg' : 'text-base'
                          }`}>
                            {excerpt}
                          </p>
                        )}
                      </Link>

                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-6">
                          {article.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="px-3 py-1 text-gray-400 text-sm">
                              +{article.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        {articles.length > 0 && (
          <div className="text-center mt-20 pt-16 border-t border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ready to share your story?</h3>
            <p className="text-gray-600 mb-8">Join our community of writers and readers.</p>
            <Link 
              to="/write" 
              className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Start Writing
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Home;
