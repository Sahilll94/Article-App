import { Helmet } from 'react-helmet-async';

const SEOHead = ({
  title,
  description,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  tags = [],
  siteName = 'Article App'
}) => {
  // Clean and escape content for meta tags
  const cleanText = (text) => text ? text.replace(/"/g, '&quot;').replace(/'/g, '&#39;').trim() : '';
  
  const fullTitle = title ? `${cleanText(title)} | ${siteName}` : siteName;
  const cleanDescription = cleanText(description) || `Discover amazing articles on ${siteName}`;
  const fullUrl = url ? (url.startsWith('http') ? url : `${window.location.origin}${url}`) : window.location.href;
  const defaultImage = `${window.location.origin}/default-og-image.svg`;
  const fullImageUrl = image ? (image.startsWith('http') ? image : `${window.location.origin}${image}`) : defaultImage;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={cleanDescription} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph Tags (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:title" content={cleanText(title) || siteName} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={cleanText(title) || 'Article Image'} />
      {author && <meta property="article:author" content={cleanText(author)} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={cleanText(tag)} />
      ))}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={cleanText(title) || siteName} />
      <meta name="twitter:description" content={cleanDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={cleanText(title) || 'Article Image'} />
      <meta name="twitter:site" content="@articleapp" />
      {author && <meta name="twitter:creator" content={`@${cleanText(author).replace(/\s+/g, '').toLowerCase()}`} />}
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      
      {/* Schema.org JSON-LD for rich snippets */}
      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": cleanText(title),
            "description": cleanDescription,
            "image": [fullImageUrl],
            "author": author ? {
              "@type": "Person",
              "name": cleanText(author)
            } : undefined,
            "publisher": {
              "@type": "Organization",
              "name": siteName,
              "logo": {
                "@type": "ImageObject",
                "url": `${window.location.origin}/favicon.ico`
              }
            },
            "datePublished": publishedTime,
            "dateModified": modifiedTime || publishedTime,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": fullUrl
            }
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
