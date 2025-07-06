import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI } from '../utils/api';
import { formatDate } from '../utils/helpers';
import SEOHead from '../components/SEOHead';
import { 
  User, 
  Calendar, 
  Share2,
  Twitter,
  Linkedin,
  Globe,
  MapPin,
  Mail,
  ArrowLeft,
  Users,
  FileText,
  Heart
} from 'lucide-react';

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articlesLoading, setArticlesLoading] = useState(false);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUserByUsername(username);
      
      if (response.data && response.data.success) {
        setProfile(response.data.data);
        fetchUserArticles();
      } else {
        setError('User not found');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserArticles = async () => {
    try {
      setArticlesLoading(true);
      const response = await usersAPI.getUserArticlesByUsername(username, { 
        limit: 6,
        sortBy: 'publishedAt',
        sortOrder: 'desc'
      });
      
      if (response.data && response.data.success) {
        setArticles(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching user articles:', err);
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.share({
        title: `${profile.name}'s Profile`,
        text: `Check out ${profile.name}'s profile on Article App`,
        url: url,
      });
    } catch (err) {
      // Fallback to copying URL to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Profile URL copied to clipboard!');
      } catch (clipboardErr) {
        console.error('Failed to share or copy URL:', clipboardErr);
      }
    }
  };

  const handleArticleClick = (article) => {
    navigate(`/article/${article.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <p className="text-gray-600 mb-6">The user profile you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // Create description for meta tags
  const profileDescription = profile.bio || `${profile.name}'s profile on Article App. View their published articles and connect with them.`;
  const profileImageUrl = profile.avatar;

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title={`${profile.name}'s Profile`}
        description={profileDescription}
        image={profileImageUrl}
        url={`/user/${profile.username}`}
        type="profile"
        author={profile.name}
      />
      
      <div className="min-h-screen bg-gray-50/50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8 shadow-sm">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Avatar */}
            <div className="w-32 h-32 overflow-hidden rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
              {profile?.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile?.name || 'Anonymous User'}
              </h1>
              <p className="text-lg text-gray-600">@{profile?.username}</p>
              <div className="flex items-center justify-center text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {profile?.email}
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {formatDate(profile?.createdAt, 'long')}
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <div className="max-w-2xl">
                <p className="text-gray-700 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Social Links */}
            {(profile?.socialLinks?.twitter || profile?.socialLinks?.linkedin || profile?.socialLinks?.website) && (
              <div className="flex flex-wrap gap-3 justify-center">
                {profile.socialLinks.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-all duration-200 font-medium"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-all duration-200 font-medium"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                )}
                {profile.socialLinks.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-all duration-200 font-medium"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {profile?.publishedArticlesCount || 0}
                </div>
                <div className="text-sm font-medium text-blue-700 flex items-center justify-center">
                  <FileText className="w-4 h-4 mr-1" />
                  Articles Published
                </div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {profile?.followersCount || 0}
                </div>
                <div className="text-sm font-medium text-green-700 flex items-center justify-center">
                  <Users className="w-4 h-4 mr-1" />
                  Followers
                </div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {profile?.followingCount || 0}
                </div>
                <div className="text-sm font-medium text-purple-700 flex items-center justify-center">
                  <Heart className="w-4 h-4 mr-1" />
                  Following
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Articles</h2>
            
            {articlesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <div 
                    key={article._id} 
                    className="group cursor-pointer"
                    onClick={() => handleArticleClick(article)}
                  >
                    <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-200 h-full">
                      {article.featuredImage?.url && (
                        <img 
                          src={article.featuredImage.url} 
                          alt={article.title}
                          className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(article.publishedAt)}</span>
                        {article.readTime && (
                          <span>{article.readTime} min read</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No articles published yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PublicProfile;
