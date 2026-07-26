import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { FiChevronRight } from "react-icons/fi";
import { recommendationsAPI } from "../api/features";
import { SkeletonProductGrid } from "./SkeletonLoaders";
import OptimizedImage from "./OptimizedImage";
import { StarRating } from "./reviews/StarRating";
import { BRAND } from "../theme/muiTheme";

/**
 * ProductRecommendations Component
 * Displays recommended products in multiple variations
 */
const ProductRecommendations = ({
  productId,
  title = "You May Also Like",
  limit = 6,
  type = "similar",
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        let result;

        switch (type) {
          case "boughtTogether":
            result = await recommendationsAPI.getBoughtTogether(
              productId,
              limit,
            );
            break;
          case "trending":
            result = await recommendationsAPI.getTrending(limit);
            break;
          case "popular":
            result = await recommendationsAPI.getPopular(limit);
            break;
          case "similar":
          default:
            result = await recommendationsAPI.getByProduct(productId, limit);
        }

        if (result.success) {
          setProducts(
            result.data || result.products || result.recommendations || [],
          );
        } else {
          setError("Failed to load recommendations");
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (productId || type !== "similar") {
      fetchRecommendations();
    }
  }, [productId, type]);

  if (loading) {
    return (
      <Box component="section" sx={{ py: 6, backgroundColor: BRAND.charcoal[50] }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 3, color: BRAND.charcoal[900] }}
        >
          {title}
        </Typography>
        <SkeletonProductGrid count={Math.min(limit, 4)} />
      </Box>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <Box component="section" sx={{ py: 6, backgroundColor: BRAND.charcoal[50] }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: BRAND.charcoal[900] }}
        >
          {title}
        </Typography>
        <Box
          component="a"
          href="/products"
          sx={{
            color: BRAND.rose[800],
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: 600,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          View All <FiChevronRight size={18} />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item key={product._id} xs={12} sm={6} lg={3}>
            <ProductRecommendationCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Individual recommendation card component
const ProductRecommendationCard = ({ product }) => {
  const handleAddToCart = () => {
    // Dispatch to cart
    console.log("Added to cart:", product._id);
  };

  const handleViewProduct = () => {
    window.location.href = `/product/${product._id}`;
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(139,26,74,0.08)",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 32px rgba(139,26,74,0.18)",
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* Image area */}
      <Box
        sx={{
          position: "relative",
          aspectRatio: "1",
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
        }}
        onClick={handleViewProduct}
        onMouseEnter={(e) => {
          const img = e.currentTarget.querySelector("img");
          if (img) img.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          const img = e.currentTarget.querySelector("img");
          if (img) img.style.transform = "scale(1)";
        }}
      >
        {product.images && product.images[0] ? (
          <OptimizedImage
            src={product.images[0].url}
            alt={product.name}
            width={300}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#e5e5e5",
              color: "text.secondary",
            }}
          >
            No Image
          </Box>
        )}

        {product.stock > 0 && product.stock <= 5 && (
          <Chip
            label={`Only ${product.stock} left`}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: BRAND.rose[800],
              color: "white",
              fontWeight: 700,
              fontSize: "0.7rem",
            }}
          />
        )}
      </Box>

      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          p: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: BRAND.charcoal[900],
            overflow: "hidden",
            textOverflow: "ellipsis",
            WebkitLineClamp: 2,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            minHeight: "2.8em",
            mb: 1,
          }}
        >
          {product.name}
        </Typography>

        {product.ratingCount > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <StarRating rating={product.averageRating} size="0.85rem" />
            <Typography variant="caption" color="text.secondary">
              ({product.ratingCount})
            </Typography>
          </Box>
        )}

        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            color: BRAND.rose[800],
            mt: "auto",
            mb: 0,
          }}
        >
          ₹{product.price.toLocaleString()}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={handleViewProduct}
          fullWidth
          variant="contained"
          sx={{
            background: `linear-gradient(135deg, ${BRAND.rose[800]} 0%, ${BRAND.gold[500]} 100%)`,
            color: "white",
            borderRadius: "10px",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              background: `linear-gradient(135deg, #5c0f30 0%, #a8882e 100%)`,
            },
          }}
        >
          View Product
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductRecommendations;
export { ProductRecommendationCard };
