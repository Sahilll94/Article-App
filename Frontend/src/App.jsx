import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import ConnectionStatus from './components/ConnectionStatus';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ArticleView from './pages/ArticleView';
import Write from './pages/Write';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Preview from './pages/Preview';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-white">
              <Navigation />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/article/:slug" element={<ArticleView />} />
                  <Route 
                    path="/write" 
                    element={
                      <ProtectedRoute>
                        <Write />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  {/* Public profile route */}
                  <Route path="/user/:username" element={<PublicProfile />} />
                  {/* Preview route */}
                  <Route path="/preview" element={<Preview />} />
                  {/* 404 Page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              {/* Show connection status in development */}
              {import.meta.env.DEV && <ConnectionStatus />}
            </div>
          </Router>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
