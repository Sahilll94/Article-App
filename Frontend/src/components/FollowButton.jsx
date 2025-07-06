import { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const FollowButton = ({ userId, userName, initialIsFollowing = false, onFollowChange, className = '' }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if this is the current user's own profile
    if (user && user._id === userId) {
      setIsSelf(true);
      return;
    }

    // Fetch current follow status if user is authenticated
    if (isAuthenticated && userId) {
      fetchFollowStatus();
    }
  }, [userId, user, isAuthenticated]);

  const fetchFollowStatus = async () => {
    try {
      const response = await usersAPI.getFollowStatus(userId);
      if (response.data.success) {
        setIsFollowing(response.data.data.isFollowing);
        setIsSelf(response.data.data.isSelf);
      }
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  const handleFollowClick = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (isFollowing) {
        response = await usersAPI.unfollowUser(userId);
      } else {
        response = await usersAPI.followUser(userId);
      }

      if (response.data.success) {
        const newFollowingStatus = response.data.data.isFollowing;
        setIsFollowing(newFollowingStatus);
        
        // Notify parent component of follow status change
        if (onFollowChange) {
          onFollowChange(newFollowingStatus);
        }
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      // You could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if it's the user's own profile
  if (isSelf || !isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={handleFollowClick}
      disabled={isLoading}
      className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        isFollowing
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600'
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : isFollowing ? (
        <UserMinus className="w-4 h-4 mr-2" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      {isLoading
        ? 'Loading...'
        : isFollowing
        ? 'Unfollow'
        : `Follow${userName ? ` ${userName}` : ''}`
      }
    </button>
  );
};

export default FollowButton;
