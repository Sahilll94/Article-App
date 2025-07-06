import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Loader2, UserX } from 'lucide-react';
import { usersAPI } from '../utils/api';
import FollowButton from './FollowButton';

const FollowList = ({ userId, type = 'followers', title, className = '' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchUsers(1);
  }, [userId, type]);

  const fetchUsers = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = type === 'followers' 
        ? await usersAPI.getUserFollowers(userId, { page: pageNum, limit: 20 })
        : await usersAPI.getUserFollowing(userId, { page: pageNum, limit: 20 });

      if (response.data.success) {
        const newUsers = response.data.data;
        setUsers(append ? prev => [...prev, ...newUsers] : newUsers);
        setPagination(response.data.pagination);
        setPage(pageNum);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (pagination && page < pagination.totalPages) {
      fetchUsers(page + 1, true);
    }
  };

  const handleFollowChange = (targetUserId, isFollowing) => {
    // Update local state to reflect follow changes
    if (type === 'followers') {
      // Don't need to update followers list when someone follows/unfollows
      return;
    }
    
    // For following list, we might want to remove user if they unfollowed
    // But typically we keep the list as is for better UX
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading {type}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="text-center py-8">
          <UserX className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchUsers(1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center">
          <Users className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            {title || (type === 'followers' ? 'Followers' : 'Following')}
          </h3>
          {pagination && (
            <span className="ml-2 text-sm text-gray-500">
              ({pagination.totalItems})
            </span>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="divide-y">
        {users.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {type === 'followers' 
                ? 'No followers yet' 
                : 'Not following anyone yet'
              }
            </p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user._id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Link
                  to={`/user/${user.username}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/user/${user.username}`}
                    className="block hover:text-blue-600 transition-colors"
                  >
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      @{user.username}
                    </p>
                  </Link>
                  {user.bio && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <FollowButton
                  userId={user._id}
                  userName={user.name}
                  onFollowChange={(isFollowing) => handleFollowChange(user._id, isFollowing)}
                  className="text-sm px-3 py-1.5"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {pagination && page < pagination.totalPages && (
        <div className="px-6 py-4 border-t">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Loading...
              </>
            ) : (
              `Load More (${pagination.totalItems - users.length} remaining)`
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FollowList;
