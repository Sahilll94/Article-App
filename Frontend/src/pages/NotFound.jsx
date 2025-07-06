import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm mx-auto">
        <div className="mb-12">
          <div className="text-8xl font-light text-gray-200 mb-6">404</div>
          <h1 className="text-xl font-medium text-gray-900 mb-3">Page not found</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            The page you're looking for doesn't exist.
          </p>
        </div>
        
        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-colors duration-200"
        >
          <Home className="w-4 h-4 mr-2" />
          Go home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
