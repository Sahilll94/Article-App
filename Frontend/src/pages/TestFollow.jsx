import { useState, useEffect } from 'react';
import { usersAPI } from '../utils/api';
import FollowButton from '../components/FollowButton';
import FollowModal from '../components/FollowModal';
import { Users, UserPlus, UserCheck } from 'lucide-react';

const TestFollow = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalTab, setModalTab] = useState('followers');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAllUsers({ limit: 10 });
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowChange = (userId, isFollowing) => {
    setUsers(prev => prev.map(user => 
      user._id === userId 
        ? { 
            ...user, 
            followersCount: isFollowing 
              ? (user.followersCount || 0) + 1 
              : Math.max((user.followersCount || 0) - 1, 0)
          }
        : user
    ));
  };

  const openFollowModal = (user, tab) => {
    setSelectedUser(user);
    setModalTab(tab);
    setShowFollowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            Follow/Unfollow Test Page
          </h1>
          <p className="text-gray-600 mb-8">
            This page demonstrates the follow/unfollow functionality. You can follow/unfollow users and view their followers/following lists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Users className="w-8 h-8" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {user.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">@{user.username}</p>
                
                {user.bio && (
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {user.bio}
                  </p>
                )}

                <div className="flex justify-center space-x-6 mb-4 text-sm">
                  <button
                    onClick={() => openFollowModal(user, 'followers')}
                    className="text-center hover:text-blue-600 transition-colors"
                  >
                    <div className="font-bold text-lg">{user.followersCount || 0}</div>
                    <div className="text-gray-600">Followers</div>
                  </button>
                  <button
                    onClick={() => openFollowModal(user, 'following')}
                    className="text-center hover:text-blue-600 transition-colors"
                  >
                    <div className="font-bold text-lg">{user.followingCount || 0}</div>
                    <div className="text-gray-600">Following</div>
                  </button>
                </div>

                <div className="space-y-3">
                  <FollowButton
                    userId={user._id}
                    userName={user.name}
                    onFollowChange={(isFollowing) => handleFollowChange(user._id, isFollowing)}
                    className="w-full justify-center"
                  />
                  
                  <button
                    onClick={() => window.open(`/user/${user.username}`, '_blank')}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600">Create some user accounts to test the follow functionality.</p>
          </div>
        )}
      </div>

      {/* Follow Modal */}
      <FollowModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        userId={selectedUser?._id}
        userName={selectedUser?.name}
        initialTab={modalTab}
      />
    </div>
  );
};

export default TestFollow;
