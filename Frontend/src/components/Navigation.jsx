import { Link, useLocation } from 'react-router-dom';
import { PenTool, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import articleLogo from '/article-logo.png';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const isActivePath = (path) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center hover:opacity-80 transition-opacity"
            onClick={closeMenu}
          >
            <img 
              src={articleLogo} 
              alt="Article" 
              className="h-20 w-30"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                isActivePath('/') 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/write" 
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center ${
                    isActivePath('/write') 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <PenTool className="w-4 h-4 mr-1.5" />
                  Write
                </Link>
                <Link 
                  to="/test-follow" 
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActivePath('/test-follow') 
                      ? 'bg-green-100 text-green-900' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Test Follow
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActivePath('/dashboard') 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                
                {/* User Menu */}
                <div className="relative group ml-2">
                  <button className="flex items-center p-2 rounded-full hover:bg-gray-50 transition-all duration-200">
                    <div className="w-7 h-7 overflow-hidden rounded-full">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">
                            {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <div className="font-medium text-gray-900 text-sm">
                        {user?.name || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {user?.email}
                      </div>
                    </div>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 inline mr-3" />
                      Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 inline mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all duration-200 shadow-sm"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="border-t border-gray-100 py-4 space-y-1">
              <Link 
                to="/" 
                className={`block px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all duration-200 ${
                  isActivePath('/') 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={closeMenu}
              >
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/write" 
                    className={`block px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all duration-200 ${
                      isActivePath('/write') 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={closeMenu}
                  >
                    <PenTool className="w-4 h-4 inline mr-2" />
                    Write
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className={`block px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all duration-200 ${
                      isActivePath('/dashboard') 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  
                  <div className="border-t border-gray-100 mt-3 pt-3 mx-2">
                    <div className="flex items-center px-4 py-2 mb-2">
                      <div className="w-8 h-8 overflow-hidden rounded-full mr-3">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name || 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">
                              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {user?.name || 'Anonymous'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user?.email}
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                      onClick={closeMenu}
                    >
                      <User className="w-4 h-4 inline mr-3" />
                      Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4 inline mr-3" />
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-100 mt-3 pt-3 mx-2 space-y-1">
                  <Link 
                    to="/login" 
                    className="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                    onClick={closeMenu}
                  >
                    Sign in
                  </Link>
                  <Link 
                    to="/register" 
                    className="block px-4 py-3 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 text-center"
                    onClick={closeMenu}
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
