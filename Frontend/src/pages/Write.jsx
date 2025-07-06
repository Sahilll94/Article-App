import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { articlesAPI } from '../utils/api';
import { generateSlug } from '../utils/helpers';
import MDEditor from '@uiw/react-md-editor';
import { 
  Save, 
  Eye, 
  Globe, 
  Lock, 
  Image as ImageIcon, 
  ArrowLeft,
  AlertCircle,
  X,
  Settings,
  Plus,
  Camera,
  Upload
} from 'lucide-react';

const Write = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit'); // Changed from editSlug to editId since backend uses ID for updates
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [article, setArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    tags: [],
    category: '',
    status: 'draft',
    visibility: 'public',
  });
  const [originalId, setOriginalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/write' } } });
    }
  }, [isAuthenticated, navigate]);

  // Load article for editing
  useEffect(() => {
    if (editId && isAuthenticated) {
      const fetchArticle = async () => {
        try {
          setLoading(true);
          const response = await articlesAPI.getArticle(editId); // editId can be slug
          
          // Backend returns { success: true, data: {...} }
          if (response.data && response.data.success) {
            const articleData = response.data.data;
            
            // Check if user is the author
            if (articleData.author?._id !== user?._id) {
              setError('You can only edit your own articles');
              return;
            }

            setArticle({
              title: articleData.title || '',
              content: articleData.content || '',
              excerpt: articleData.excerpt || '',
              featuredImage: articleData.featuredImage?.url || articleData.featuredImage || '',
              tags: Array.isArray(articleData.tags) ? articleData.tags : [],
              category: articleData.category || '',
              status: articleData.status || 'draft',
              visibility: articleData.visibility || 'public',
            });
            setOriginalId(articleData._id);
            setError(null);
          } else {
            setError('Article not found');
          }
        } catch (err) {
          console.error('Error fetching article:', err);
          setError('Failed to load article for editing');
        } finally {
          setLoading(false);
        }
      };

      fetchArticle();
    }
  }, [editId, isAuthenticated, user]);

  const handleChange = (field, value) => {
    setArticle(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !article.tags.includes(tag)) {
        setArticle(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setArticle(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim();
    if (tag && !article.tags.includes(tag)) {
      setArticle(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleImageUpload = async (file, type = 'content') => {
    try {
      console.log('Starting image upload:', { file: file.name, type, hasOriginalId: !!originalId });
      setUploadingImage(true);
      
      let response;
      if (type === 'featured') {
        if (originalId) {
          // For existing articles, use the proper featured image upload endpoint
          console.log('Uploading featured image with article ID:', originalId);
          response = await articlesAPI.uploadFeaturedImage(originalId, file);
          
          // The response format for featured image upload is different
          if (response.data && response.data.success) {
            const imageUrl = response.data.data.featuredImage.url;
            console.log('Featured image uploaded successfully:', imageUrl);
            handleChange('featuredImage', imageUrl);
            return imageUrl;
          }
        } else {
          // For new articles, use content image upload and store the URL
          console.log('New article: uploading featured image as content image');
          response = await articlesAPI.uploadContentImage(file);
          
          if (response.data && response.data.success) {
            const imageUrl = response.data.data.url;
            console.log('Featured image uploaded successfully (as content):', imageUrl);
            handleChange('featuredImage', imageUrl);
            return imageUrl;
          }
        }
      } else {
        // Regular content image upload
        console.log('Uploading content image');
        response = await articlesAPI.uploadContentImage(file);
        
        if (response.data && response.data.success) {
          const imageUrl = response.data.data.url;
          const imageMarkdown = response.data.data.markdownSyntax || `![${file.name}](${imageUrl})`;
          handleChange('content', article.content + '\n\n' + imageMarkdown);
          return imageUrl;
        }
      }
      
      console.log('Upload response:', response);
      throw new Error('Invalid response format');
      
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image: ' + (err.response?.data?.message || err.message));
      throw err;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (newStatus = article.status) => {
    if (!article.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!article.content.trim()) {
      setError('Content is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const articleData = {
        ...article,
        status: newStatus,
      };

      let response;
      if (editId && originalId) {
        // Update existing article
        response = await articlesAPI.updateArticle(originalId, articleData);
      } else {
        // Create new article
        response = await articlesAPI.createArticle(articleData);
        
        // If this is a new article and we have a featured image, we need to upload it properly
        if (response.data && response.data.success && article.featuredImage) {
          const savedArticle = response.data.data;
          try {
            // The featured image URL we have is from content upload, we need to re-upload it as featured image
            // First, let's just update the article with the featured image URL for now
            const updateResponse = await articlesAPI.updateArticle(savedArticle._id, {
              featuredImage: article.featuredImage
            });
            if (updateResponse.data && updateResponse.data.success) {
              response = updateResponse; // Use the updated article data
            }
          } catch (featuredImageError) {
            console.error('Error setting featured image for new article:', featuredImageError);
            // Don't fail the whole save operation, just log the error
          }
        }
      }

      // Backend returns { success: true, data: {...} }
      if (response.data && response.data.success) {
        const savedArticle = response.data.data;
        
        // Navigate to the article view using slug
        navigate(`/article/${savedArticle.slug}`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error saving article:', err);
      setError(err.response?.data?.message || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    handleSave('published');
  };

  const handlePreview = () => {
    // Open preview in new tab/window
    const previewData = {
      title: article.title,
      content: article.content,
      featuredImage: article.featuredImage,
    };
    
    // Store preview data in sessionStorage
    sessionStorage.setItem('articlePreview', JSON.stringify(previewData));
    
    // Open preview window
    window.open('/preview', '_blank');
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Action Panel */}
      <div className="fixed top-20 right-6 z-40 flex items-center space-x-2">
        {/* Image Upload Button */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleImageUpload(file, 'content');
            }}
            className="hidden"
            id="floating-image-upload"
            disabled={uploadingImage}
          />
          <label 
            htmlFor="floating-image-upload"
            className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all duration-200 cursor-pointer ${
              uploadingImage 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-md' 
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-xl'
            }`}
            title="Add image to content"
          >
            {uploadingImage ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </label>
        </div>

        {/* Settings Button */}
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-600 rounded-full shadow-lg hover:bg-gray-200 hover:shadow-xl transition-all duration-200"
          title="Article settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Action Buttons Container */}
        <div className="flex items-center space-x-1 bg-white rounded-full shadow-lg p-1">
          <button 
            onClick={handlePreview}
            className="flex items-center justify-center w-9 h-9 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            disabled={!article.title || !article.content}
            title="Preview article"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => handleSave('draft')}
            className="flex items-center justify-center w-9 h-9 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
            disabled={saving || !article.title || !article.content}
            title="Save as draft"
          >
            <Save className="w-4 h-4" />
          </button>

          <button 
            onClick={handlePublish}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-medium text-sm"
            disabled={saving || !article.title || !article.content}
            title="Publish article"
          >
            {saving ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Globe className="w-3 h-3 mr-2" />
            )}
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Settings Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 scrollbar-content ${
        showSettings ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 h-full overflow-y-auto scrollbar-content">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Article Settings</h2>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Featured Image</label>
              {article.featuredImage ? (
                <div className="relative">
                  <img 
                    src={article.featuredImage} 
                    alt="Featured" 
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => handleChange('featuredImage', '')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Remove featured image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleImageUpload(file, 'featured');
                    }}
                    className="hidden"
                    id="featured-image-upload"
                    disabled={uploadingImage}
                  />
                  <label 
                    htmlFor="featured-image-upload" 
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                      uploadingImage 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Choose Image'}
                  </label>
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                value={article.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                placeholder="Brief description of your article..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <form onSubmit={addTag} className="mb-3">
                <div className="flex">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                value={article.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="e.g., Technology, Lifestyle..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status & Visibility */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={article.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                <select
                  value={article.visibility}
                  onChange={(e) => handleChange('visibility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setShowSettings(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 scrollbar-minimal">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="mb-8">
          <textarea
            placeholder="Your story title..."
            value={article.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full text-4xl font-bold border-none outline-none bg-transparent placeholder-gray-300 resize-none overflow-hidden leading-tight"
            style={{ 
              minHeight: '1.2em',
              lineHeight: '1.2'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
        </div>

        {/* Content Editor */}
        <div className="mb-8 scrollbar-content">
          <MDEditor
            value={article.content}
            onChange={(value) => handleChange('content', value || '')}
            height={600}
            preview="edit"
            hideToolbar={false}
            data-color-mode="light"
            visibleDragBar={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Write;
