import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Preview = () => {
  const [previewData, setPreviewData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get preview data from sessionStorage
    const storedPreview = sessionStorage.getItem('articlePreview');
    if (storedPreview) {
      try {
        const data = JSON.parse(storedPreview);
        setPreviewData(data);
      } catch (error) {
        console.error('Error parsing preview data:', error);
        navigate('/write');
      }
    } else {
      // No preview data found, redirect to write page
      navigate('/write');
    }
  }, [navigate]);

  const handleClose = () => {
    window.close();
  };

  const handleGoBack = () => {
    navigate('/write');
  };

  if (!previewData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  const estimatedReadTime = Math.ceil(previewData.content.split(' ').length / 200);

  return (
    <>
      <Helmet>
        <title>{previewData.title ? `Preview: ${previewData.title}` : 'Article Preview'}</title>
        <meta name="description" content="Preview your article before publishing" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header with close button */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Editor
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <span className="text-sm font-medium text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                Preview Mode
              </span>
            </div>
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>

        {/* Article content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <article className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Featured Image */}
            {previewData.featuredImage && (
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img
                  src={previewData.featuredImage}
                  alt={previewData.title || 'Article featured image'}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <div className="p-8">
              {/* Article Header */}
              <header className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {previewData.title || 'Untitled Article'}
                </h1>
                
                <div className="flex flex-wrap items-center text-sm text-gray-600 space-x-6">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>You</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{estimatedReadTime} min read</span>
                  </div>
                </div>
              </header>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                {previewData.content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {children}
                        </p>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-6 my-6 italic text-gray-600">
                          {children}
                        </blockquote>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-2 mb-4">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-2 mb-4">
                          {children}
                        </ol>
                      ),
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {previewData.content}
                  </ReactMarkdown>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      Start writing your article content...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>

        {/* Bottom spacing */}
        <div className="h-16"></div>
      </div>
    </>
  );
};

export default Preview;
