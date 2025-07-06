import { useState } from 'react';
import { X } from 'lucide-react';
import FollowList from './FollowList';

const FollowModal = ({ isOpen, onClose, userId, userName, initialTab = 'followers' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            {userName ? `${userName}'s Network` : 'User Network'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'followers'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Followers
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'following'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Following
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          <FollowList
            userId={userId}
            type={activeTab}
            className="border-0 rounded-none shadow-none"
          />
        </div>
      </div>
    </div>
  );
};

export default FollowModal;
