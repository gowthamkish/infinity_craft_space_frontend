import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { useGetBlogPostsQuery, useGetBlogTagsQuery } from "../services/blogApi";
import { PLACEHOLDER_SRC, onImgError } from "../utils/imageFallback";
import "./blog.css";

export const formatBlogDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }) : "";

export function PostCard({ post, featured = false }) {
  return (
    <article className={`blog-card ${featured ? "blog-card--featured" : ""}`}>
      <Link to={`/blog/${post.slug}`} className="blog-card-img" aria-label={post.title} tabIndex={-1}>
        <img
          src={post.coverImage?.url || PLACEHOLDER_SRC}
          alt={post.coverImage?.alt || ""}
          loading={featured ? "eager" : "lazy"}
          decoding="async"
          onError={onImgError}
        />
      </Link>
      <div className="blog-card-body">
        {post.tags?.length > 0 && <div className="blog-card-tags">{post.tags.slice(0, 2).map((t) => <span key={t}>{t}</span>)}</div>}
        <h2 className="blog-card-title"><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2>
        {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
        <div className="blog-card-meta">
          {formatBlogDate(post.publishedAt)} · {post.readingMinutes || 1} min read
        </div>
      </div>
    </article>
  );
}

export default function Blog() {
  const [params, setParams] = useSearchParams();
  const tag = params.get("tag") || "";
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError } = useGetBlogPostsQuery({ page, tag });
  const { data: tags = [] } = useGetBlogTagsQuery();
  const posts = data?.posts || [];

  const pickTag = (t) => {
    setPage(1);
    setParams(t ? { tag: t } : {});
  };

  const url = `${SEO_CONFIG.SITE_URL}/blog`;
  return (
    <>
      <SEOHead
        title={tag ? `${tag} stories – Blog | ${SEO_CONFIG.SITE_NAME}` : `Behind the Craft – Stories & Guides | ${SEO_CONFIG.SITE_NAME}`}
        description="Stories, style guides, gifting ideas and care tips for handmade jewellery and craft pieces — the heritage and meaning behind the styles we love, from Infinity Craft Space."
        keywords="handmade jewellery blog, jewellery style guide India, jewellery care guide, gifting ideas India, kundan jewellery history, wedding season jewellery, Infinity Craft Space stories"
        url={url}
        canonical={url}
        noindex={Boolean(tag) || page > 1}
      />
      <Header />
      <main className="blog-page">
        <div className="blog-container">
          <header className="blog-hero">
            <div className="blog-eyebrow">Behind the Craft</div>
            <h1>Stories, style &amp; heritage</h1>
            <p>The meaning behind the styles we love, how to wear them, how to care for them and what to gift.</p>
          </header>

          {tags.length > 0 && (
            <nav className="blog-tags" aria-label="Filter stories by topic">
              <button type="button" className={!tag ? "is-active" : ""} onClick={() => pickTag("")}>All</button>
              {tags.map(({ tag: t }) => (
                <button key={t} type="button" className={tag === t ? "is-active" : ""} onClick={() => pickTag(t)}>{t}</button>
              ))}
            </nav>
          )}

          {isLoading ? (
            <div className="blog-grid" aria-busy="true">
              {[0, 1, 2].map((n) => <div key={n} className="blog-card blog-skeleton" />)}
            </div>
          ) : isError ? (
            <p className="blog-empty">We couldn't load the stories right now. Please try again in a moment.</p>
          ) : posts.length === 0 ? (
            <div className="blog-empty">
              <h2>{tag ? `No stories tagged “${tag}” yet` : "Stories coming soon"}</h2>
              <p>We're putting the finishing touches on our first behind-the-scenes stories.</p>
              <Link to="/products" className="blog-btn">Browse our collection</Link>
            </div>
          ) : (
            <>
              <div className="blog-grid">
                {posts.map((p, i) => <PostCard key={p._id} post={p} featured={i === 0 && page === 1 && !tag} />)}
              </div>
              {data.pages > 1 && (
                <div className="blog-pager">
                  <button type="button" className="blog-btn blog-btn--ghost" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>← Newer</button>
                  <span>Page {page} of {data.pages}</span>
                  <button type="button" className="blog-btn blog-btn--ghost" disabled={page >= data.pages || isFetching} onClick={() => setPage((p) => p + 1)}>Older →</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
