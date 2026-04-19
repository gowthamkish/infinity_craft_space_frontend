import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref + boolean indicating whether the element has entered the
 * viewport (with a generous rootMargin so content loads slightly before it's
 * visible). Once true, stays true — the section stays mounted.
 */
export function useLazySection({ rootMargin = "300px", threshold = 0 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true); // fallback: always render
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, inView };
}
