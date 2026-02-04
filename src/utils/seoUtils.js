// SEO utility functions for dynamic content optimization

export const generateProductJsonLD = (product) => {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Infinity Craft Space",
      },
    },
    brand: {
      "@type": "Brand",
      name: "Infinity Craft Space",
    },
    category: product.category,
    aggregateRating:
      product.reviews?.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.averageRating || 0,
            reviewCount: product.reviews.length,
          }
        : undefined,
  };
};

export const generateBreadcrumbJsonLD = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
};

export const generateOrganizationJsonLD = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Infinity Craft Space",
    description:
      "Premium craft supplies and art materials for creative enthusiasts",
    url: "https://infinitycraftspace.com",
    logo: "https://infinitycraftspace.com/ICS_Logo.jpeg",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-CRAFT-01",
      contactType: "Customer Service",
      email: "support@infinitycraftspace.com",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Creative Lane",
      addressLocality: "Art District",
      addressRegion: "Creative State",
      postalCode: "12345",
      addressCountry: "US",
    },
    sameAs: [
      "https://www.facebook.com/infinitycraftspace",
      "https://www.instagram.com/infinitycraftspace",
      "https://www.twitter.com/infinitycraftspace",
      "https://www.pinterest.com/infinitycraftspace",
    ],
  };
};

export const generateWebSiteJsonLD = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Infinity Craft Space",
    description:
      "Premium craft supplies and art materials for creative enthusiasts",
    url: "https://infinitycraftspace.com",
    potentialAction: {
      "@type": "SearchAction",
      target:
        "https://infinitycraftspace.com/products?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
};

export const optimizeImageAlt = (product) => {
  return `${product.name} - ${product.category} - Premium craft supply at Infinity Craft Space`;
};

export const generateMetaKeywords = (
  baseKeywords,
  product = null,
  category = null,
) => {
  let keywords = [...baseKeywords];

  if (product) {
    keywords.push(product.name.toLowerCase());
    keywords.push(product.category?.toLowerCase());
  }

  if (category) {
    keywords.push(category.toLowerCase());
  }

  // Add common craft-related keywords
  keywords.push(
    "craft supplies",
    "art materials",
    "creative supplies",
    "handmade",
    "DIY",
  );

  return keywords.join(", ");
};

export const generateCanonicalUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl);

  // Only include SEO-friendly parameters
  const allowedParams = ["category", "search", "page"];
  Object.entries(params).forEach(([key, value]) => {
    if (allowedParams.includes(key) && value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

export const optimizeTitle = (baseTitle, maxLength = 60) => {
  if (baseTitle.length <= maxLength) {
    return baseTitle;
  }

  // Truncate at the last complete word before maxLength
  const truncated = baseTitle.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return truncated.substring(0, lastSpace) + "...";
};

export const optimizeDescription = (baseDescription, maxLength = 160) => {
  if (baseDescription.length <= maxLength) {
    return baseDescription;
  }

  // Truncate at the last complete sentence or word before maxLength
  const truncated = baseDescription.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastSpace = truncated.lastIndexOf(" ");

  const cutPoint = lastPeriod > -1 ? lastPeriod + 1 : lastSpace;
  return truncated.substring(0, cutPoint) + "...";
};

// Generate dynamic sitemap entries
export const generateSitemapEntry = (
  url,
  lastmod,
  changefreq = "weekly",
  priority = 0.5,
) => {
  return {
    url,
    lastmod,
    changefreq,
    priority,
  };
};

// Performance optimization for SEO
export const preloadCriticalResources = () => {
  const criticalResources = [
    "/favicon.ico",
    "/ICS_Logo.jpeg.png",
    "/manifest.json",
  ];

  criticalResources.forEach((resource) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = resource.endsWith(".png") ? "image" : "fetch";
    link.href = resource;
    document.head.appendChild(link);
  });
};

// Accessibility enhancements for SEO
export const enhanceAccessibility = () => {
  // Skip navigation link for screen readers
  const skipLink = document.createElement("a");
  skipLink.href = "#main-content";
  skipLink.textContent = "Skip to main content";
  skipLink.className = "sr-only-focusable position-absolute";
  skipLink.style.cssText =
    "top: 0; left: 0; z-index: 9999; padding: 8px; background: #000; color: #fff; text-decoration: none;";

  // Only show on focus
  skipLink.addEventListener("blur", () => {
    skipLink.style.transform = "translateY(-100%)";
  });
  skipLink.addEventListener("focus", () => {
    skipLink.style.transform = "translateY(0)";
  });

  document.body.prepend(skipLink);
};

export default {
  generateProductJsonLD,
  generateBreadcrumbJsonLD,
  generateOrganizationJsonLD,
  generateWebSiteJsonLD,
  optimizeImageAlt,
  generateMetaKeywords,
  generateCanonicalUrl,
  optimizeTitle,
  optimizeDescription,
  generateSitemapEntry,
  preloadCriticalResources,
  enhanceAccessibility,
};
