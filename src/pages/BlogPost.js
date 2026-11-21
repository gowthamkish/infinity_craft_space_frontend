import { Link, useParams } from "react-router-dom";
import { FiShare2, FiArrowLeft } from "react-icons/fi";
import Header from "../components/Header";
import SEOHead, { SEO_CONFIG, generateBreadcrumbStructuredData } from "../components/SEOHead";
import MarkdownLite from "../components/blog/MarkdownLite";
import { useGetBlogPostQuery } from "../services/blogApi";
import { PostCard, formatBlogDate } from "./Blog";
import NotFound from "./NotFound";
import "./blog.css";

export default function BlogPost() {
  const { slug } = useParams();
  const { data, isLoading, isError, error } = useGetBlogPostQuery(slug);
  const post = data?.post;
  const related = data?.related || [];

  if (isError && error?.status === 404) return <NotFound />;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: post?.title, url });
      else { await navigator.clipboard.writeText(url); window.alert("Link copied!"); }
    } catch { /* user cancelled */ }
  };

  if (isLoading || !post) {
    return (
      <>
        <Header />
        <main className="blog-page"><div className="blog-container blog-container--narrow">
          {isError ? <p className="blog-empty">We couldn't load this story. Please try again.</p> : <div className="blog-skeleton blog-skeleton--article" aria-busy="true" />}
        </div></main>
      </>
    );
  }

  const url = `${SEO_CONFIG.SITE_URL}/blog/${post.slug}`;
  const description = post.metaDescription || post.excerpt || post.title;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description,
      image: post.coverImage?.url ? [post.coverImage.url] : undefined,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      author: { "@type": "Organization", name: post.authorName || SEO_CONFIG.SITE_NAME },
      publisher: { "@type": "Organization", name: SEO_CONFIG.SITE_NAME, logo: { "@type": "ImageObject", url: `${SEO_CONFIG.SITE_URL}/ICS_Logo.jpeg` } },
      mainEntityOfPage: url,
      keywords: post.tags?.join(", "),
    },
    generateBreadcrumbStructuredData([
      { name: "Home", url: SEO_CONFIG.SITE_URL },
      { name: "Blog", url: `${SEO_CONFIG.SITE_URL}/blog` },
      { name: post.title, url },
    ]),
  ];

  return (
    <>
      <SEOHead
        title={post.metaTitle || `${post.title} | ${SEO_CONFIG.SITE_NAME}`}
        description={description}
        keywords={post.tags?.join(", ")}
        url={url}
        canonical={url}
        image={post.coverImage?.url}
        type="article"
        publishedTime={post.publishedAt}
        modifiedTime={post.updatedAt}
        author={post.authorName}
        tags={post.tags}
        structuredData={structuredData}
      />
      <Header />
      <main className="blog-page">
        <article className="blog-container blog-container--narrow">
          <Link to="/blog" className="blog-back"><FiArrowLeft size={15} /> All stories</Link>
          <header className="blog-article-head">
            {post.tags?.length > 0 && <div className="blog-card-tags">{post.tags.map((t) => <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`}>{t}</Link>)}</div>}
            <h1>{post.title}</h1>
            <div className="blog-card-meta">
              By {post.authorName} · {formatBlogDate(post.publishedAt)} · {post.readingMinutes || 1} min read
              <button type="button" className="blog-share" onClick={share} aria-label="Share this story"><FiShare2 size={15} /> Share</button>
            </div>
          </header>

          {post.coverImage?.url && (
            <figure className="blog-cover">
              <img src={post.coverImage.url} alt={post.coverImage.alt || post.title} decoding="async" />
            </figure>
          )}

          <MarkdownLite source={post.content} />

          {post.generatedBy === "agent" && (
            <p className="blog-ai-note">This story was drafted with the help of AI from our product catalog.</p>
          )}

          <aside className="blog-cta">
            <h2>Love handmade?</h2>
            <p>Explore pieces crafted with the same care you just read about.</p>
            <Link to="/products" className="blog-btn">Shop the collection</Link>
          </aside>
        </article>

        {related.length > 0 && (
          <section className="blog-container blog-related" aria-label="More stories">
            <h2>More stories</h2>
            <div className="blog-grid">{related.map((p) => <PostCard key={p._id} post={p} />)}</div>
          </section>
        )}
      </main>
    </>
  );
}
