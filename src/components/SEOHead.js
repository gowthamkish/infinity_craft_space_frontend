import React from "react";
import { Helmet } from "react-helmet-async";

const SEOHead = ({
  title = "Infinity Craft Space — Craft Supplies Online | Art, DIY & Jewelry",
  description = "Infinity Craft Space (infinitycraftspace) — India's online destination for craft supplies, art materials, DIY kits, pottery, jewelry-making tools and handmade craft materials. Shop paints, brushes, clay, beads, sewing & knitting supplies.",
  keywords = "Infinity Craft Space, infinitycraftspace, craft supplies online, art supplies online India, DIY craft kits, jewelry making supplies, painting supplies, pottery supplies, handmade craft materials, craft tools",
  url = "https://infinitycraftspace.com",
  image = "https://infinitycraftspace.com/ICS_Logo.jpeg",
  type = "website",
  structuredData = null,
  canonical = null,
  noindex = false,
  author = "Infinity Craft Space",
  publishedTime = null,
  modifiedTime = null,
  category = null,
  tags = [],
  price = null,
  currency = "INR",
  availability = null,
  rating = null,
  reviewCount = null,
}) => {
  // Ensure title is not too long for SEO
  const optimizedTitle =
    title.length > 60 ? title.substring(0, 57) + "..." : title;

  // Ensure description is optimal length for SEO
  const optimizedDescription =
    description.length > 160
      ? description.substring(0, 157) + "..."
      : description;

  // Generate structured data based on page type
  const generateStructuredData = () => {
    const baseOrganization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Infinity Craft Space",
      url: "https://infinitycraftspace.com",
      logo: "https://infinitycraftspace.com/ICS_Logo.jpeg",
      description:
        "Premium craft supplies and materials for artists and crafters",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        url: "https://infinitycraftspace.com/contact",
      },
      sameAs: [
        "https://facebook.com/infinitycraftspace",
        "https://www.instagram.com/infinity_craft_space?igsh=MXh0cmI0czF3NXhuNg==",
        "https://twitter.com/infinitycraftspace",
      ],
    };

    if (structuredData) {
      return structuredData;
    }

    const sdImage = image || "https://infinitycraftspace.com/ICS_Logo.jpeg";

    // Default structured data based on page type
    if (type === "product") {
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: title.replace(" - Infinity Craft Space", ""),
        description: optimizedDescription,
        image: [sdImage],
        brand: {
          "@type": "Brand",
          name: "Infinity Craft Space",
        },
        offers: price
          ? {
              "@type": "Offer",
              price: price,
              priceCurrency: currency,
              availability: availability || "https://schema.org/InStock",
              url: url,
            }
          : undefined,
        aggregateRating:
          rating && reviewCount
            ? {
                "@type": "AggregateRating",
                ratingValue: rating,
                reviewCount: reviewCount,
                bestRating: 5,
                worstRating: 1,
              }
            : undefined,
      };
    }

    if (type === "website" || type === "homepage") {
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Infinity Craft Space",
        url: "https://infinitycraftspace.com",
        description: optimizedDescription,
        publisher: baseOrganization,
        potentialAction: {
          "@type": "SearchAction",
          target:
            "https://infinitycraftspace.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      };
    }

    if (type === "article" || type === "review") {
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title.replace(" - Infinity Craft Space", ""),
        description: optimizedDescription,
        image: [sdImage],
        author: {
          "@type": "Person",
          name: author,
        },
        publisher: baseOrganization,
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
      };
    }

    return baseOrganization;
  };

  const structuredDataJson = generateStructuredData();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{optimizedTitle}</title>
      <meta name="description" content={optimizedDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Robots Meta */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={optimizedTitle} />
      <meta property="og:description" content={optimizedDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      {/* Open Graph image with explicit size/type and fallback */}
      <meta
        property="og:image"
        content={image || "https://infinitycraftspace.com/ICS_Logo.jpeg"}
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta
        property="og:image:alt"
        content={`${title} - Infinity Craft Space`}
      />
      <meta property="og:site_name" content="Infinity Craft Space" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={optimizedTitle} />
      <meta name="twitter:description" content={optimizedDescription} />
      <meta
        name="twitter:image"
        content={image || "https://infinitycraftspace.com/ICS_Logo.jpeg"}
      />
      <meta
        name="twitter:image:alt"
        content={`${title} - Infinity Craft Space`}
      />
      <meta name="twitter:site" content="@infinitycraftspace" />
      <meta name="twitter:creator" content="@infinitycraftspace" />

      {/* Additional Meta Tags for Products */}
      {type === "product" && price && (
        <>
          <meta property="product:price:amount" content={price} />
          <meta property="product:price:currency" content={currency} />
          <meta
            property="product:availability"
            content={availability || "in stock"}
          />
        </>
      )}

      {/* Article Meta Tags */}
      {(type === "article" || type === "review") && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {category && <meta property="article:section" content={category} />}
          {tags.length > 0 &&
            tags.map((tag) => (
              <meta key={tag} property="article:tag" content={tag} />
            ))}
        </>
      )}

      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />

      {/* Performance and Caching */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

      {/* Structured Data JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(structuredDataJson, null, 2)}
      </script>
    </Helmet>
  );
};

export default SEOHead;

// Utility function to generate product-specific structured data
export const generateProductStructuredData = (product, reviews = []) => {
  const aggregateRating =
    reviews.length > 0
      ? {
          "@type": "AggregateRating",
          ratingValue:
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length,
          reviewCount: reviews.length,
          bestRating: 5,
          worstRating: 1,
        }
      : null;

  const reviewStructuredData = reviews.slice(0, 5).map((review) => ({
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      "@type": "Person",
      name: review.user?.firstName || "Anonymous",
    },
    reviewBody: review.comment,
    datePublished: review.createdAt,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `${product.name} - Premium craft supply from Infinity Craft Space`,
    image: [
      product.images?.[0]?.url ||
        product.image?.url ||
        "https://infinitycraftspace.com/ICS_Logo.jpeg",
    ],
    sku: product._id,
    brand: {
      "@type": "Brand",
      name: "Infinity Craft Space",
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `https://infinitycraftspace.com/product/${product._id}`,
      seller: {
        "@type": "Organization",
        name: "Infinity Craft Space",
      },
    },
    aggregateRating: aggregateRating,
    review: reviewStructuredData.length > 0 ? reviewStructuredData : undefined,
  };
};

// Utility function to generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (breadcrumbs) => {
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

// SEO constants
export const SEO_CONFIG = {
  SITE_NAME: "Infinity Craft Space",
  SITE_URL: "https://infinitycraftspace.com",
  DEFAULT_DESCRIPTION:
    "Infinity Craft Space — India's online destination for craft supplies, art materials, DIY kits, pottery and jewelry-making tools. Shop paints, brushes, clay, beads, sewing & knitting supplies.",
  DEFAULT_KEYWORDS:
    "Infinity Craft Space, infinitycraftspace, craft supplies online, art supplies online India, DIY craft kits, jewelry making supplies, painting supplies, pottery supplies, handmade craft materials, craft tools",
  DEFAULT_IMAGE: "https://infinitycraftspace.com/ICS_Logo.jpeg",
  TWITTER_HANDLE: "@infinitycraftspace",
  FACEBOOK_PAGE: "https://facebook.com/infinitycraftspace",
  INSTAGRAM_PAGE:
    "https://www.instagram.com/infinity_craft_space?igsh=MXh0cmI0czF3NXhuNg==",
};
