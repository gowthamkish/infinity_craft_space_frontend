import { useDispatch } from "react-redux";
import { addToCart, removeFromCart } from "../features/cartSlice";
import Header from "../components/header";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import { useProducts } from "../hooks/useSmartFetch";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";

export default function Home() {
  const dispatch = useDispatch();
  const { data: products, loading, error } = useProducts();

  return (
    <>
      <SEOHead
        title={SEO_CONFIG.SITE_NAME}
        description="Discover premium craft supplies at Infinity Craft Space. From painting supplies to sculpting tools, jewelry making materials to pottery wheels - everything you need for your creative journey."
        keywords="craft supplies, art materials, painting supplies, sculpting tools, jewelry making, pottery, crafting materials, creative supplies, art store"
        url={SEO_CONFIG.SITE_URL}
        canonical={SEO_CONFIG.SITE_URL}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Store",
          "name": SEO_CONFIG.SITE_NAME,
          "description": "Premium craft supplies and art materials for creative enthusiasts",
          "url": SEO_CONFIG.SITE_URL,
          "telephone": "+1-555-CRAFT-01",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Creative Lane",
            "addressLocality": "Art District",
            "addressRegion": "Creative State",
            "postalCode": "12345",
            "addressCountry": "US"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${SEO_CONFIG.SITE_URL}/products?search={search_term_string}`,
            "query-input": "required name=search_term_string"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Craft Supplies Catalog",
            "itemListElement": products?.slice(0, 5).map(product => ({
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": product.name,
                "description": product.description,
                "image": product.image,
                "offers": {
                  "@type": "Offer",
                  "price": product.price,
                  "priceCurrency": "INR",
                  "availability": "https://schema.org/InStock"
                }
              }
            })) || []
          }
        }}
      />
      <div>
        <Header />
        <Container style={{ marginTop: "90px", paddingTop: "1rem" }}>
        <h1 className="mb-4 text-center">Product Listings</h1>
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "200px" }}
          >
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {products.length === 0 && (
              <div className="text-center">No products available</div>
            )}
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {products.length > 0 &&
                products.map((product) => (
                  <Col key={product._id}>
                    <Card className="h-100">
                      <Card.Img
                        variant="top"
                        src={
                          product.image ||
                          "https://via.placeholder.com/200x200?text=No+Image"
                        }
                        style={{
                          objectFit: "contain",
                          height: "200px",
                          background: "#f8f8f8",
                        }}
                      />
                      <Card.Body className="d-flex flex-column">
                        <Card.Title>{product.name}</Card.Title>
                        <Card.Text>
                          <strong>₹{product.price}</strong>
                          <br />
                          <span style={{ color: "#555" }}>
                            {product.description}
                          </span>
                        </Card.Text>
                        <div className="mt-auto d-flex gap-2">
                          <Button
                            variant="success"
                            onClick={() =>
                              dispatch(addToCart({ product, quantity: 1 }))
                            }
                          >
                            +
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() =>
                              dispatch(removeFromCart({ product }))
                            }
                          >
                            -
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
            </Row>
          </>
        )}
      </Container>
    </div>
    </>
  );
}
