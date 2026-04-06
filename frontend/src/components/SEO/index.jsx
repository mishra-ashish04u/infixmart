import { Helmet } from 'react-helmet-async';
import { buildAbsoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME } from '../../utils/siteMeta';

const SEO = ({
  title,
  description = "India's trusted wholesale store - buy single pieces or bulk at best prices. 10,000+ genuine products.",
  image = DEFAULT_OG_IMAGE,
  url,
  type = 'website',
  noIndex = false,
  keywords,
  author,
  publishedTime,
  modifiedTime,
  structuredData,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = url ? buildAbsoluteUrl(url) : undefined;
  const imageUrl = image ? buildAbsoluteUrl(image) : DEFAULT_OG_IMAGE;
  const robots = noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large';
  const structuredDataList = Array.isArray(structuredData)
    ? structuredData.filter(Boolean)
    : structuredData
      ? [structuredData]
      : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      <meta name='robots' content={robots} />
      {keywords ? <meta name='keywords' content={Array.isArray(keywords) ? keywords.join(', ') : keywords} /> : null}
      {author ? <meta name='author' content={author} /> : null}
      {canonical ? <link rel='canonical' href={canonical} /> : null}

      <meta property='og:type' content={type} />
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={imageUrl} />
      <meta property='og:site_name' content={SITE_NAME} />
      {canonical ? <meta property='og:url' content={canonical} /> : null}
      {type === 'article' && publishedTime ? <meta property='article:published_time' content={publishedTime} /> : null}
      {type === 'article' && modifiedTime ? <meta property='article:modified_time' content={modifiedTime} /> : null}

      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={imageUrl} />

      {structuredDataList.map((entry, index) => (
        <script key={index} type='application/ld+json'>
          {JSON.stringify(entry)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
