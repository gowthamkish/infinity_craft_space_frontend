import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiInstagram, FiShoppingBag, FiX, FiCheck, FiShoppingCart, FiExternalLink } from "react-icons/fi";
import { useGetInstagramFeedQuery } from "../../services/instagramApi";
import { optimisticAddToCart } from "../../features/cartSlice";
import { buildCloudinaryUrl } from "../OptimizedImage";
import { PLACEHOLDER_SRC, onImgError } from "../../utils/imageFallback";
import "./instagram.css";

export const IG_HANDLE = "infinity_craft_space";
export const IG_PROFILE_URL = `https://www.instagram.com/${IG_HANDLE}/`;
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* ── "Shop the look" popup: the photo with numbered pins + the tagged products ── */
export function ShopTheLook({ post, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const closeRef = useRef(null);
  const [active, setActive] = useState(null);
  const [added, setAdded] = useState({});

  useEffect(() => {
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [onClose]);

  const add = useCallback(async (tag) => {
    const p = tag.product;
    if (p.needsOptions) { onClose(); navigate(`/product/${p.slug || p._id}`); return; }
    await dispatch(optimisticAddToCart({ product: p.cartProduct, quantity: 1 }));
    setAdded((a) => ({ ...a, [p._id]: true }));
    setTimeout(() => setAdded((a) => ({ ...a, [p._id]: false })), 2000);
  }, [dispatch, navigate, onClose]);

  return (
    <div className="ig-overlay" onClick={onClose}>
      <div className="ig-modal" role="dialog" aria-modal="true" aria-label="Shop the look" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="ig-close" onClick={onClose} aria-label="Close"><FiX size={20} /></button>

        <div className="ig-modal-photo">
          <img src={buildCloudinaryUrl(post.imageUrl, 900) || PLACEHOLDER_SRC} alt={post.caption || "Instagram photo"} onError={onImgError} />
          {post.tags.map((t, i) => (
            <button
              key={t.product._id}
              type="button"
              className={`ig-pin ${active === i ? "is-active" : ""}`}
              style={{ left: `${t.x}%`, top: `${t.y}%` }}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-label={`${i + 1}: ${t.product.name}`}
            >{i + 1}</button>
          ))}
        </div>

        <div className="ig-modal-side">
          <h3><FiShoppingBag size={18} /> Shop the look</h3>
          {post.caption && <p className="ig-modal-caption">{post.caption}</p>}

          <ul className="ig-products">
            {post.tags.map((t, i) => {
              const p = t.product;
              const to = `/product/${p.slug || p._id}`;
              return (
                <li key={p._id} className={active === i ? "is-active" : ""} onMouseEnter={() => setActive(i)}>
                  <span className="ig-num" aria-hidden="true">{i + 1}</span>
                  <Link to={to} onClick={onClose} className="ig-prod-img">
                    <img src={buildCloudinaryUrl(p.image, 160) || PLACEHOLDER_SRC} alt="" loading="lazy" onError={onImgError} />
                  </Link>
                  <div className="ig-prod-info">
                    <Link to={to} onClick={onClose} className="ig-prod-name">{p.name}</Link>
                    <span className="ig-prod-price">
                      {inr(p.price)}
                      {p.compareAtPrice > p.price && <s>{inr(p.compareAtPrice)}</s>}
                    </span>
                  </div>
                  {p.inStock ? (
                    <button type="button" className={`ig-add ${added[p._id] ? "is-done" : ""}`} onClick={() => add(t)}>
                      {added[p._id] ? <><FiCheck size={14} /> Added</> : p.needsOptions ? "Choose options" : <><FiShoppingCart size={14} /> Add</>}
                    </button>
                  ) : (
                    <span className="ig-soldout">Sold out</span>
                  )}
                </li>
              );
            })}
          </ul>

          {post.permalink && (
            <a className="ig-view" href={post.permalink} target="_blank" rel="noopener noreferrer">
              <FiInstagram size={15} /> View on Instagram <FiExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Home-page section ────────────────────────────────────────────────────── */
export default function InstagramFeed() {
  const { data: posts = [] } = useGetInstagramFeedQuery(6);
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);

  if (posts.length === 0) return null; // nothing curated yet — show nothing rather than an empty box

  const tiles = posts.map((post) => {
    const shoppable = post.tags.length > 0;
    const img = (
      <>
        <img src={buildCloudinaryUrl(post.imageUrl, 520) || PLACEHOLDER_SRC} alt={post.caption || "Photo from our Instagram"} width="400" height="400" loading="lazy" decoding="async" onError={onImgError} />
        <span className="ig-hover" aria-hidden="true"><FiInstagram size={22} /></span>
        {shoppable && <span className="ig-badge"><FiShoppingBag size={12} /> Shop the look</span>}
      </>
    );
    if (shoppable) {
      return (
        <li key={post._id}>
          <button type="button" className="ig-tile" onClick={() => setOpen(post)} aria-label={`Shop the look${post.caption ? `: ${post.caption}` : ""}`}>{img}</button>
        </li>
      );
    }
    return (
      <li key={post._id}>
        <a className="ig-tile" href={post.permalink || IG_PROFILE_URL} target="_blank" rel="noopener noreferrer" aria-label="Open on Instagram">{img}</a>
      </li>
    );
  });

  return (
    <section className="hm-section" aria-labelledby="ig-heading">
      <div className="hm-container">
        <div className="ig-head">
          <div>
            <span className="hm-eyebrow">On Instagram</span>
            <h2 id="ig-heading">Shop the look</h2>
            <p>See our pieces styled for real, then tap a photo to shop what you love.</p>
          </div>
          <a className="ig-follow" href={IG_PROFILE_URL} target="_blank" rel="noopener noreferrer">
            <FiInstagram size={16} /> Follow @{IG_HANDLE}
          </a>
        </div>
        <ul className="ig-grid">{tiles}</ul>
      </div>
      {open && <ShopTheLook post={open} onClose={close} />}
    </section>
  );
}
