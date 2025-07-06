import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { articlesAPI } from '../utils/api';
import { formatDate, calculateReadingTime, extractTextFromMarkdown, truncateText } from '../utils/helpers';
import { 
  PenTool, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Globe, 
  Lock,
  Calendar,
  Clock,
  AlertCircle,
  MoreHorizontal,
  FileText,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, published, draft
  const [deleting, setDeleting] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/dashboard' } } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserArticles();
    }
  }, [isAuthenticated, filter]);

  const fetchUserArticles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      
      const response = await articlesAPI.getUserArticles(params);
      
      // Backend returns { success: true, data: [...], meta: {...} }
      if (response.data && response.data.success) {
        setArticles(response.data.data || []);
      } else {
        setArticles([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching user articles:', err);
      setError('Failed to load your articles');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (articleId) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(articleId);
      await articlesAPI.deleteArticle(articleId);
      setArticles(prev => prev.filter(article => article._id !== articleId));
    } catch (err) {
      console.error('Error deleting article:', err);
      setError('Failed to delete article');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (article) => {
    try {
      const newStatus = article.status === 'published' ? 'draft' : 'published';
      
      // Update article status using the update API
      await articlesAPI.updateArticle(article._id, { status: newStatus });
      
      // Update local state
      setArticles(prev => prev.map(a => 
        a._id === article._id 
          ? { ...a, status: newStatus }
          : a
      ));
    } catch (err) {
      console.error('Error toggling article status:', err);
      setError('Failed to update article status');
    }
  };

  const handleToggleVisibility = async (article) => {
    try {
      const newVisibility = article.visibility === 'public' ? 'private' : 'public';
      
      // Update article visibility using the update API
      await articlesAPI.updateArticle(article._id, { visibility: newVisibility });
      
      // Update local state
      setArticles(prev => prev.map(a => 
        a._id === article._id 
          ? { ...a, visibility: newVisibility }
          : a
      ));
    } catch (err) {
      console.error('Error toggling article visibility:', err);
      setError('Failed to update article visibility');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const filteredArticles = articles.filter(article => {
    if (filter === 'all') return true;
    return article.status === filter;
  });

  return (
    <div className="min-h-screen bg-white scrollbar-minimal">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Your Stories</h1>
            <p className="text-lg text-gray-600">Manage and track your published articles and drafts</p>
          </div>
          <Link 
            to="/write" 
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium mt-6 md:mt-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Story
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Articles</p>
                <p className="text-2xl font-bold text-blue-900">{articles.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Published</p>
                <p className="text-2xl font-bold text-green-900">
                  {articles.filter(a => a.status === 'published').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Drafts</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {articles.filter(a => a.status === 'draft').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <PenTool className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
            {[
              { key: 'all', label: 'All Stories' },
              { key: 'published', label: 'Published' },
              { key: 'draft', label: 'Drafts' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  filter === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-6 border border-gray-100 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PenTool className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {filter === 'all' 
                ? "No stories yet" 
                : `No ${filter} stories`}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {filter === 'all'
                ? "Start sharing your thoughts and ideas with the world. Your first story is just a click away."
                : `You don't have any ${filter} stories at the moment.`}
            </p>
            <Link 
              to="/write" 
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Write Your First Story
            </Link>
          </div>
        ) : (
          /* Articles List */
          <div className="space-y-4">
            {filteredArticles.map((article) => {
              const plainTextContent = extractTextFromMarkdown(article.content);
              const readingTime = calculateReadingTime(plainTextContent);
              const excerpt = truncateText(plainTextContent, 120);

              return (
                <div key={article._id} className="group border border-gray-100 rounded-xl p-6 hover:shadow-md hover:border-gray-200 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    {/* Article Info */}
                    <div className="flex-1 mr-6">
                      {/* Title */}
                      <Link 
                        to={`/article/${article.slug}`}
                        className="block mb-2 group-hover:text-blue-600 transition-colors"
                      >
                        <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                          {article.title}
                        </h3>
                      </Link>

                      {/* Excerpt */}
                      {excerpt && (
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {excerpt}
                        </p>
                      )}

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(article.updatedAt, 'short')}
                        </span>
                        {readingTime > 0 && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {readingTime} min read
                          </span>
                        )}
                        
                        {/* Status Badge */}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {article.status === 'published' ? (
                            <>
                              <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                              Published
                            </>
                          ) : (
                            <>
                              <div className="w-1 h-1 bg-yellow-500 rounded-full mr-2"></div>
                              Draft
                            </>
                          )}
                        </span>

                        {/* Visibility */}
                        <span className="flex items-center text-xs">
                          {article.visibility === 'public' ? (
                            <>
                              <Globe className="w-3 h-3 mr-1" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 mr-1" />
                              Private
                            </>
                          )}
                        </span>
                      </div>

                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="text-gray-400 text-xs">
                              +{article.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Link 
                        to={`/write?edit=${article.slug}`}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit article"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>

                      <button
                        onClick={() => handleToggleStatus(article)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title={`${article.status === 'published' ? 'Unpublish' : 'Publish'} article`}
                      >
                        {article.status === 'published' ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(article._id)}
                        disabled={deleting === article._id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete article"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
