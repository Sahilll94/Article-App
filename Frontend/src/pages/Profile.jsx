import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../utils/api';
import { formatDate } from '../utils/helpers';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Camera, 
  Save, 
  X,
  Twitter,
  Linkedin,
  Globe,
  Share2
} from 'lucide-react';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      website: ''
    }
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getCurrentUser();
      
      if (response.data && response.data.success) {
        const userData = response.data.data;
        setProfile(userData);
        setEditForm({
          name: userData.name || '',
          bio: userData.bio || '',
          socialLinks: {
            twitter: userData.socialLinks?.twitter || '',
            linkedin: userData.socialLinks?.linkedin || '',
            website: userData.socialLinks?.website || ''
          }
        });
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await usersAPI.updateProfile(editForm);
      
      if (response.data && response.data.success) {
        setProfile(response.data.data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const response = await usersAPI.uploadAvatar(file);
      
      if (response.data && response.data.success) {
        setProfile(prev => ({
          ...prev,
          avatar: response.data.data.avatar
        }));
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/user/${profile?.username}`;
    try {
      await navigator.share({
        title: `${profile?.name}'s Profile`,
        text: `Check out ${profile?.name}'s profile on Article App`,
        url: profileUrl,
      });
    } catch (err) {
      // Fallback to copying URL to clipboard
      try {
        await navigator.clipboard.writeText(profileUrl);
        alert('Profile URL copied to clipboard!');
      } catch (clipboardErr) {
        console.error('Failed to share or copy URL:', clipboardErr);
        // Final fallback - show the URL
        prompt('Copy this URL to share your profile:', profileUrl);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchProfile} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8 shadow-sm">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
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
              <button 
                onClick={() => document.getElementById('avatar-upload').click()}
                disabled={uploadingAvatar}
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-all duration-200 shadow-lg group-hover:scale-105 disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile?.name || 'Anonymous User'}
              </h1>
              <div className="flex items-center justify-center text-gray-600 space-x-4">
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

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShareProfile}
                className="px-6 py-2.5 rounded-full font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
              >
                <Share2 className="w-4 h-4 mr-2 inline" />
                Share Profile
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
                  isEditing 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2 inline" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2 inline" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 m-6 rounded-lg">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {isEditing ? (
            <div className="p-8 space-y-8">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                <p className="text-gray-600 mt-1">Update your personal information and social links.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Write a short bio about yourself..."
                    />
                  </div>
                </div>

                {/* Right Column - Social Links */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Twitter className="w-4 h-4 inline mr-2 text-blue-500" />
                          Twitter
                        </label>
                        <input
                          type="url"
                          value={editForm.socialLinks.twitter}
                          onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="https://twitter.com/username"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Linkedin className="w-4 h-4 inline mr-2 text-blue-600" />
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          value={editForm.socialLinks.linkedin}
                          onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Globe className="w-4 h-4 inline mr-2 text-green-600" />
                          Website
                        </label>
                        <input
                          type="url"
                          value={editForm.socialLinks.website}
                          onChange={(e) => handleInputChange('socialLinks.website', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="border-t border-gray-100 pt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2 inline" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 space-y-8">
              {/* About Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                {profile?.bio ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl">
                    {profile.bio}
                  </p>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="italic">No bio added yet. Click "Edit Profile" to add one.</p>
                  </div>
                )}
              </div>

              {/* Shareable Profile URL */}
              {profile?.username && (
                <div className="border-t border-gray-100 pt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your Profile</h3>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Your public profile URL:</p>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-white px-3 py-2 rounded-lg border border-gray-200 font-mono text-sm text-gray-700">
                        {window.location.origin}/user/{profile.username}
                      </div>
                      <button
                        onClick={handleShareProfile}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        <Share2 className="w-4 h-4 mr-1.5 inline" />
                        Share
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Anyone with this link can view your public profile and published articles.
                    </p>
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(profile?.socialLinks?.twitter || profile?.socialLinks?.linkedin || profile?.socialLinks?.website) && (
                <div className="border-t border-gray-100 pt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Connect</h3>
                  <div className="flex flex-wrap gap-3">
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
                </div>
              )}

              {/* Statistics */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {profile?.articlesCount || 0}
                    </div>
                    <div className="text-sm font-medium text-blue-700">Articles</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {profile?.followers?.length || 0}
                    </div>
                    <div className="text-sm font-medium text-green-700">Followers</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {profile?.following?.length || 0}
                    </div>
                    <div className="text-sm font-medium text-purple-700">Following</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <div className="text-3xl font-bold text-orange-600 mb-1 capitalize">
                      {profile?.role || 'User'}
                    </div>
                    <div className="text-sm font-medium text-orange-700">Role</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
