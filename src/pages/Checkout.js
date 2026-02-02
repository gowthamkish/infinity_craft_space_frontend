import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart, updateCartItemQuantity, removeItemCompletely } from "../features/cartSlice";
import Header from "../components/header";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import { Trash2, Plus, Minus, Check, Package, CreditCard, Lock, CheckCircle } from "react-feather";
import api from "../api/axios";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";

// Add CSS for payment method hover effects and mobile responsiveness
const paymentMethodStyles = `
  .payment-method-card:hover {
    border-color: var(--secondary-color) !important;
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  .cart-item-hover:hover {
    background-color: var(--bg-tertiary);
  }
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }

  /* Mobile Checkout Styles */
  @media (max-width: 767.98px) {
    .checkout-container {
      padding: 1rem !important;
    }
    
    .checkout-card {
      border-radius: 12px !important;
      margin-bottom: 1rem !important;
    }
    
    .checkout-card .card-header {
      padding: 1rem !important;
    }
    
    .checkout-card .card-body {
      padding: 1rem !important;
    }
    
    .payment-method-card {
      margin-bottom: 1.5rem !important;
    }
    
    .payment-method-card .card-body {
      padding: 1.25rem !important;
    }
    
    .mobile-cart-item {
      padding: 1rem !important;
      border-bottom: 1px solid #e5e7eb !important;
    }
    
    .mobile-progress-steps {
      padding: 0 1rem;
    }
    
    .order-summary-mobile {
      position: static !important;
      margin-top: 1rem;
    }

    /* Payment step specific mobile styles */
    .payment-step-mobile {
      padding: 0.75rem !important;
    }

    .payment-security-section {
      margin: 1.5rem 0 !important;
      padding: 1rem !important;
    }
    
    .payment-back-button {
      width: 100% !important;
      margin-top: 1rem !important;
    }
  }

  @media (max-width: 575.98px) {
    .payment-method-card h6 {
      font-size: 0.9rem !important;
    }
    
    .payment-method-card p {
      font-size: 0.8rem !important;
    }
    
    .checkout-progress-title {
      font-size: 0.6rem !important;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = paymentMethodStyles;
  document.head.appendChild(styleElement);
}

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);

  // Multi-step checkout state
  const [currentStep, setCurrentStep] = useState(1); // 1: Cart Review, 2: Checkout, 3: Payment, 4: Confirmation
  const [orderData, setOrderData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + item.totalPrice, 0);
  // TODO: Uncomment when ready to enable shipping charges
  // const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
  const shipping = 0; // Temporarily disabled - free shipping for now
  // TODO: Uncomment when ready to enable GST
  // const tax = subtotal * 0.18; // 18% GST
  const tax = 0; // Temporarily disabled - no GST for now
  const total = subtotal + shipping + tax;

  // Step configuration
  const steps = [
    { number: 1, title: "Cart Review", icon: Package },
    { number: 2, title: "Shipping", icon: CreditCard },
    { number: 3, title: "Payment", icon: Lock },
    { number: 4, title: "Confirmation", icon: Check }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateCartItemQuantity({ productId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeItemCompletely(productId));
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      setError("Your cart is empty!");
      return;
    }
    setCurrentStep(2);
    setError(null);
  };

  const proceedToPayment = () => {
    // Validate shipping address
    const requiredFields = ['street', 'city', 'state', 'zipCode', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field].trim());
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    setCurrentStep(3);
    setError(null);
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Initialize Razorpay
      const res = await initializeRazorpay();
      if (!res) {
        setError("Razorpay SDK failed to load. Please check your internet connection.");
        setLoading(false);
        return;
      }
      // Create order on backend
      const token = localStorage.getItem("token");
      const orderResponse = await api.post("/api/payment", {
        amount: Math.round(total * 100), // Razorpay expects amount in paise
        currency: "INR",
        shippingAddress: shippingAddress,
        items: cartItems
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });      
      const { razorpayOrderId, amount, currency } = orderResponse.data.order;
      const orderId = orderResponse.data.order.id;

      // Razorpay options
      const options = {
        key: orderResponse.data.razorpayKeyId, // Replace with your Razorpay key
        amount: Math.round(total * 100), // Use actual amount in paise
        currency: currency,
        name: "Infinity Craft Space",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {            
            // Verify payment on backend
            const verifyResponse = await api.post("/api/payment/verify-payment", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: orderId,
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (verifyResponse.data.success) {
              // Payment successful, create the actual order
              await completeOrder(response);
            } else {
              console.error("Verification failed:", verifyResponse.data);
              setError("Payment verification failed. " + (verifyResponse.data.message || "Please try again."));
              setLoading(false);
            }
          } catch (error) {
            console.error("Payment verification error:", error.response?.data || error.message);
            setError("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#10b981"
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setError("Payment cancelled. Please try again to complete your order.");
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Payment initialization error:", error);
      console.error("Error details:", error.response?.data || error.message);
      setError("Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  const completeOrder = async (paymentResponse) => {
    try {
      setLoading(true);

      // Capture items and totals from current cart before clearing it
      const items = cartItems.map(item => ({
        product: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.totalPrice
      }));

      const subtotalLocal = subtotal;
      const shippingLocal = shipping;
      const taxLocal = tax;
      const totalLocal = total;

      const finalOrderData = {
        orderId: paymentResponse?.order_id || paymentResponse?.razorpay_order_id || `ORD-${Date.now()}`,
        items,
        subtotal: subtotalLocal,
        shipping: shippingLocal,
        tax: taxLocal,
        total: totalLocal,
        paymentDetails: {
          razorpay_order_id: paymentResponse?.razorpay_order_id,
          razorpay_payment_id: paymentResponse?.razorpay_payment_id,
          razorpay_signature: paymentResponse?.razorpay_signature,
          payment_status: paymentResponse?.status || "completed",
          method: paymentResponse?.method || "online"
        },
        orderDate: new Date().toISOString(),
        status: "confirmed"
      };

      // Clear the cart after capturing items
      dispatch(clearCart());

      setOrderData(finalOrderData);
      setPaymentData(paymentResponse);
      setCurrentStep(4);
      setError(null);

    } catch (err) {
      console.error("Order completion error:", err);
      setError("Payment successful but there was an error finalizing the order. Please contact support with your payment ID: " + (paymentResponse?.razorpay_payment_id || paymentResponse?.payment_id));
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes - simulate successful payment without actual gateway
  const handleDemoPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const newOrderData = {
        items: cartItems.map(item => ({
          product: item.product._id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: item.totalPrice
        })),
        shippingAddress,
        subtotal,
        tax,
        shipping,
        total,
        paymentDetails: {
          payment_id: `demo_pay_${Date.now()}`,
          payment_status: "completed",
          payment_method: "demo"
        },
        orderDate: new Date().toISOString(),
        orderId: `ORD-${Date.now()}`,
        status: "confirmed"
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setOrderData(newOrderData);
      setPaymentData({ payment_id: `demo_pay_${Date.now()}`, payment_status: "completed" });
      setCurrentStep(4);
      dispatch(clearCart());

    } catch (err) {
      console.error("Demo order error:", err);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Progress Bar Component
  const CheckoutProgressBar = () => (
    <div className="mb-4">
      {/* Security Message - Mobile Responsive */}
      <div className="d-flex justify-content-center align-items-center mb-4">
        <div 
          style={{
            background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
            padding: "clamp(0.75rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem)",
            borderRadius: "50px",
            color: "white",
            fontWeight: "600",
            fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
            boxShadow: "var(--shadow-md)",
            textAlign: "center",
            maxWidth: "90%"
          }}
        >
          🔒 Your payment information is secure and encrypted. Complete your order with confidence.
        </div>
      </div>
      
      {/* Desktop Progress Bar */}
      <div className="d-none d-md-flex justify-content-center align-items-center position-relative">
        {steps.map((step, index) => (
          <div key={step.number} className="d-flex align-items-center">
            <div className="text-center">
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  color: "white",
                  background: currentStep >= step.number 
                    ? "var(--secondary-color)" 
                    : "#e5e7eb",
                  transition: "all 0.3s ease",
                  position: "relative",
                  zIndex: 2
                }}
              >
                {currentStep > step.number ? (
                  <Check size={20} />
                ) : (
                  step.number
                )}
              </div>
              <div 
                style={{
                  color: currentStep >= step.number ? "var(--secondary-color)" : "var(--text-secondary)",
                  fontSize: "0.875rem",
                  fontWeight: currentStep === step.number ? "600" : "500",
                  marginTop: "0.5rem"
                }}
              >
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                style={{
                  width: "100px",
                  height: "3px",
                  background: currentStep > step.number ? "var(--secondary-color)" : "#e5e7eb",
                  margin: "0 1rem",
                  transition: "all 0.3s ease",
                  position: "relative",
                  top: "-12px"
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Progress Bar - Compact */}
      <div className="d-flex d-md-none justify-content-between align-items-center position-relative px-3">
        {steps.map((step, index) => (
          <div key={step.number} className="d-flex flex-column align-items-center flex-fill">
            <div
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                fontWeight: "600",
                color: "white",
                background: currentStep >= step.number 
                  ? "var(--secondary-color)" 
                  : "#e5e7eb",
                transition: "all 0.3s ease",
                position: "relative",
                zIndex: 2
              }}
            >
              {currentStep > step.number ? (
                <Check size={14} />
              ) : (
                step.number
              )}
            </div>
            <div 
              style={{
                color: currentStep >= step.number ? "var(--secondary-color)" : "var(--text-secondary)",
                fontSize: "0.7rem",
                fontWeight: currentStep === step.number ? "600" : "500",
                marginTop: "0.25rem",
                textAlign: "center"
              }}
            >
              {step.title}
            </div>
            
            {/* Mobile connecting line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: "17px",
                  left: `${((index + 1) * 100 / steps.length) - 10}%`,
                  right: `${100 - ((index + 2) * 100 / steps.length) + 10}%`,
                  height: "2px",
                  background: currentStep > step.number ? "var(--secondary-color)" : "#e5e7eb",
                  transition: "all 0.3s ease",
                  zIndex: 1
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Cart Review Step
  const CartReviewStep = () => (
    <Row>
      <Col lg={8} xs={12}>
        <Card 
          style={{
            border: "none",
            borderRadius: "16px",
            boxShadow: "var(--shadow-lg)",
            marginBottom: "2rem"
          }}
        >
          <Card.Header 
            style={{
              background: "linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))",
              border: "none",
              borderRadius: "16px 16px 0 0",
              padding: "1.5rem"
            }}
          >
            <div className="d-flex align-items-center">
              <Package className="me-2" style={{ color: "var(--primary-color)" }} />
              <h4 className="mb-0" style={{ color: "var(--text-primary)", fontWeight: "600" }}>
                Review Your Cart
              </h4>
              <Badge 
                bg="primary" 
                style={{ 
                  marginLeft: "auto",
                  fontSize: "0.8rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px"
                }}
              >
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </Badge>
            </div>
          </Card.Header>
          <Card.Body style={{ padding: "0" }}>
            {cartItems.map((item, index) => (
              <div 
                key={item.product._id}
                style={{
                  padding: "1.5rem",
                  borderBottom: index < cartItems.length - 1 ? "1px solid var(--border-light)" : "none",
                  transition: "all 0.3s ease"
                }}
                className="cart-item-hover"
              >
                {/* Desktop Layout */}
                <Row className="align-items-center d-none d-md-flex">
                  <Col md={2}>
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        background: `linear-gradient(135deg, ${item.product.name.charAt(0) === 'K' ? '#3b82f6' : '#10b981'}, ${item.product.name.charAt(0) === 'K' ? '#1d4ed8' : '#059669'})`,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        boxShadow: "var(--shadow-md)"
                      }}
                    >
                      {item.product.name.charAt(0)}
                    </div>
                  </Col>
                  <Col md={4}>
                    <h6 className="mb-1" style={{ color: "var(--text-primary)", fontWeight: "600" }}>
                      {item.product.name}
                    </h6>
                    <p className="mb-1" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      {item.product.description}
                    </p>
                    <p className="mb-0" style={{ color: "var(--primary-color)", fontWeight: "600" }}>
                      ₹{item.product.price}
                    </p>
                  </Col>
                  <Col md={3}>
                    <div className="d-flex align-items-center justify-content-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{
                          borderRadius: "8px",
                          width: "35px",
                          height: "35px"
                        }}
                      >
                        <Minus size={14} />
                      </Button>
                      <span 
                        className="mx-3"
                        style={{
                          minWidth: "30px",
                          textAlign: "center",
                          fontSize: "1.1rem",
                          fontWeight: "600"
                        }}
                      >
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                        style={{
                          borderRadius: "8px",
                          width: "35px",
                          height: "35px"
                        }}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </Col>
                  <Col md={2}>
                    <div className="text-end">
                      <p 
                        className="mb-1"
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "1.1rem",
                          fontWeight: "600"
                        }}
                      >
                        ₹{item.totalPrice}
                      </p>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveItem(item.product._id)}
                        style={{
                          borderRadius: "8px",
                          padding: "0.25rem 0.5rem"
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </Col>
                </Row>

                {/* Mobile Layout */}
                <div className="d-flex d-md-none">
                  <div className="me-3">
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        background: `linear-gradient(135deg, ${item.product.name.charAt(0) === 'K' ? '#3b82f6' : '#10b981'}, ${item.product.name.charAt(0) === 'K' ? '#1d4ed8' : '#059669'})`,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "1.2rem",
                        fontWeight: "700",
                        boxShadow: "var(--shadow-md)"
                      }}
                    >
                      {item.product.name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1" style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "1rem" }}>
                          {item.product.name}
                        </h6>
                        <p className="mb-1" style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                          {item.product.description}
                        </p>
                        <p className="mb-0" style={{ color: "var(--primary-color)", fontWeight: "600", fontSize: "0.9rem" }}>
                          ₹{item.product.price}
                        </p>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveItem(item.product._id)}
                        style={{
                          borderRadius: "8px",
                          padding: "0.25rem 0.5rem"
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          style={{
                            borderRadius: "6px",
                            width: "30px",
                            height: "30px",
                            padding: "0"
                          }}
                        >
                          <Minus size={12} />
                        </Button>
                        <span 
                          className="mx-2"
                          style={{
                            minWidth: "25px",
                            textAlign: "center",
                            fontSize: "1rem",
                            fontWeight: "600"
                          }}
                        >
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          style={{
                            borderRadius: "6px",
                            width: "30px",
                            height: "30px",
                            padding: "0"
                          }}
                        >
                          <Plus size={12} />
                        </Button>
                      </div>
                      <p 
                        className="mb-0"
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "1.1rem",
                          fontWeight: "700"
                        }}
                      >
                        ₹{item.totalPrice}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      </Col>
      <Col lg={4}>
        <Card
          style={{
            border: "none",
            borderRadius: "16px",
            boxShadow: "var(--shadow-lg)",
            position: "sticky",
            top: "2rem"
          }}
        >
          <Card.Header
            style={{
              background: "linear-gradient(135deg, var(--secondary-color), #34d399)",
              color: "white",
              border: "none",
              borderRadius: "16px 16px 0 0",
              padding: "1.5rem"
            }}
          >
            <div className="d-flex align-items-center">
              <Package className="me-2" />
              <h5 className="mb-0 fw-bold">Order Summary</h5>
            </div>
            <p className="mb-0 mt-1" style={{ fontSize: "0.875rem", opacity: "0.9" }}>
              Review your items before checkout
            </p>
          </Card.Header>
          <Card.Body style={{ padding: "1.5rem" }}>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: "var(--text-secondary)" }}>Subtotal:</span>
                <span style={{ fontWeight: "600" }}>₹{subtotal.toFixed(2)}</span>
              </div>
              {/* TODO: Uncomment when ready to enable shipping charges and GST */}
              {/* <div className="d-flex justify-content-between mb-2">
                <span style={{ color: "var(--text-secondary)" }}>
                  Shipping: {shipping === 0 && <Badge bg="success" className="ms-1">FREE</Badge>}
                </span>
                <span style={{ fontWeight: "600" }}>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span style={{ color: "var(--text-secondary)" }}>Tax (18% GST):</span>
                <span style={{ fontWeight: "600" }}>₹{tax.toFixed(2)}</span>
              </div> */}
              <hr style={{ border: "1px solid var(--border-color)" }} />
              <div className="d-flex justify-content-between">
                <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  Total:
                </span>
                <span 
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "var(--secondary-color)"
                  }}
                >
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            {error && (
              <Alert variant="danger" className="mb-3" style={{ borderRadius: "12px", fontSize: "0.875rem" }}>
                {error}
              </Alert>
            )}

            <div className="d-grid gap-2">
              <Button
                variant="primary"
                size="lg"
                onClick={proceedToCheckout}
                disabled={cartItems.length === 0}
                style={{
                  borderRadius: "12px",
                  fontWeight: "600",
                  padding: "12px",
                  background: "linear-gradient(45deg, var(--secondary-color), #34d399)",
                  border: "none",
                  boxShadow: "var(--shadow-md)"
                }}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => navigate("/")}
                style={{
                  borderRadius: "12px",
                  fontWeight: "500"
                }}
              >
                Continue Shopping
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  // Checkout Step Component
  const CheckoutStep = () => (
    <Row>
      <Col lg={8} xs={12}>
        <Card
          style={{
            border: "none",
            borderRadius: "16px",
            boxShadow: "var(--shadow-lg)",
            marginBottom: "2rem"
          }}
        >
          <Card.Header
            style={{
              background: "linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))",
              border: "none",
              borderRadius: "16px 16px 0 0",
              padding: "1.5rem"
            }}
          >
            <div className="d-flex align-items-center">
              <CreditCard className="me-2" style={{ color: "var(--primary-color)" }} />
              <h4 className="mb-0" style={{ color: "var(--text-primary)", fontWeight: "600" }}>
                Shipping Address
              </h4>
            </div>
            <p className="mb-0 mt-1" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Where should we deliver your order?
            </p>
          </Card.Header>
          <Card.Body style={{ padding: "2rem" }}>
            <Form onSubmit={(e) => { e.preventDefault(); proceedToPayment(); }}>
              <Row>
                <Col md={12} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                      Street Address *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="street"
                      value={shippingAddress.street}
                      onChange={handleInputChange}
                      placeholder="Enter your complete street address"
                      required
                      style={{
                        borderRadius: "12px",
                        border: "2px solid var(--border-color)",
                        padding: "12px 16px",
                        fontSize: "1rem"
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                      City *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      placeholder="Enter your city"
                      required
                      style={{
                        borderRadius: "12px",
                        border: "2px solid var(--border-color)",
                        padding: "12px 16px",
                        fontSize: "1rem"
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                      State *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      placeholder="Enter your state"
                      required
                      style={{
                        borderRadius: "12px",
                        border: "2px solid var(--border-color)",
                        padding: "12px 16px",
                        fontSize: "1rem"
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                      ZIP Code *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={handleInputChange}
                      placeholder="Enter ZIP/Postal code"
                      required
                      style={{
                        borderRadius: "12px",
                        border: "2px solid var(--border-color)",
                        padding: "12px 16px",
                        fontSize: "1rem"
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                      Phone Number *
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      required
                      style={{
                        borderRadius: "12px",
                        border: "2px solid var(--border-color)",
                        padding: "12px 16px",
                        fontSize: "1rem"
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                      Country
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleInputChange}
                      placeholder="India"
                      disabled
                      style={{
                        borderRadius: "12px",
                        border: "2px solid var(--border-color)",
                        padding: "12px 16px",
                        fontSize: "1rem",
                        backgroundColor: "var(--bg-tertiary)"
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {error && (
                <Alert variant="danger" className="mb-3" style={{ borderRadius: "12px" }}>
                  {error}
                </Alert>
              )}

              <div className="d-flex gap-3">
                <Button
                  variant="outline-secondary"
                  onClick={() => setCurrentStep(1)}
                  style={{
                    borderRadius: "12px",
                    fontWeight: "500",
                    padding: "12px 24px"
                  }}
                >
                  Back to Cart
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  style={{
                    borderRadius: "12px",
                    fontWeight: "600",
                    padding: "12px 24px",
                    background: "linear-gradient(45deg, var(--secondary-color), #34d399)",
                    border: "none",
                    boxShadow: "var(--shadow-md)",
                    flex: 1
                  }}
                >
                  Continue to Payment →
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={4}>
        <Card
          style={{
            border: "none",
            borderRadius: "16px",
            boxShadow: "var(--shadow-lg)",
            position: "sticky",
            top: "2rem"
          }}
        >
          <Card.Header
            style={{
              background: "linear-gradient(135deg, var(--secondary-color), #34d399)",
              color: "white",
              border: "none",
              borderRadius: "16px 16px 0 0",
              padding: "1.5rem"
            }}
          >
            <div className="d-flex align-items-center">
              <Package className="me-2" />
              <h5 className="mb-0 fw-bold">Order Summary</h5>
            </div>
            <p className="mb-0 mt-1" style={{ fontSize: "0.875rem", opacity: "0.9" }}>
              Review your items before checkout
            </p>
          </Card.Header>
          <Card.Body style={{ padding: "1.5rem" }}>
            {cartItems.slice(0, 3).map((item) => (
              <div key={item.product._id} className="d-flex align-items-center mb-3">
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    background: `linear-gradient(135deg, ${item.product.name.charAt(0) === 'K' ? '#3b82f6' : '#10b981'}, ${item.product.name.charAt(0) === 'K' ? '#1d4ed8' : '#059669'})`,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: "700",
                    marginRight: "12px"
                  }}
                >
                  {item.product.name.charAt(0)}
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-0" style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                    {item.product.name}
                  </h6>
                  <p className="mb-0" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    Qty: {item.quantity}
                  </p>
                </div>
                <span style={{ fontWeight: "600", color: "var(--secondary-color)" }}>
                  ₹{item.totalPrice}
                </span>
              </div>
            ))}
            
            {cartItems.length > 3 && (
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", textAlign: "center" }}>
                +{cartItems.length - 3} more items
              </p>
            )}

            <hr style={{ border: "1px solid var(--border-color)" }} />
            
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: "var(--text-secondary)" }}>Subtotal:</span>
                <span style={{ fontWeight: "600" }}>₹{subtotal.toFixed(2)}</span>
              </div>
              {/* TODO: Uncomment when ready to enable shipping charges and GST */}
              {/* <div className="d-flex justify-content-between mb-2">
                <span style={{ color: "var(--text-secondary)" }}>
                  Shipping: {shipping === 0 && <Badge bg="success" className="ms-1">FREE</Badge>}
                </span>
                <span style={{ fontWeight: "600" }}>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span style={{ color: "var(--text-secondary)" }}>Tax (18% GST):</span>
                <span style={{ fontWeight: "600" }}>₹{tax.toFixed(2)}</span>
              </div> */}
              <hr style={{ border: "1px solid var(--border-color)" }} />
              <div className="d-flex justify-content-between">
                <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  Total:
                </span>
                <span 
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "var(--secondary-color)"
                  }}
                >
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            <div 
              style={{
                background: "var(--bg-tertiary)",
                padding: "1rem",
                borderRadius: "12px",
                textAlign: "center"
              }}
            >
              <p className="mb-0" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                🔒 Your payment information is secure and encrypted
              </p>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  // Payment Step Component
  const PaymentStep = () => (
    <Row className="justify-content-center">
      <Col lg={8} xs={12}>
        <Card
          style={{
            border: "none",
            borderRadius: "16px",
            boxShadow: "var(--shadow-lg)",
            marginBottom: "2rem"
          }}
        >
          <Card.Header
            style={{
              background: "linear-gradient(135deg, var(--primary-color), #3b82f6)",
              color: "white",
              border: "none",
              borderRadius: "16px 16px 0 0",
              padding: "clamp(1rem, 4vw, 1.5rem)"
            }}
          >
            <div className="d-flex align-items-center">
              <Lock className="me-2" />
              <div>
                <h4 className="mb-0 fw-bold" style={{ fontSize: "clamp(1.1rem, 4vw, 1.5rem)" }}>Secure Payment</h4>
                <p className="mb-0 mt-1" style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)", opacity: "0.9" }}>
                  Your payment information is protected with bank-level security
                </p>
              </div>
            </div>
          </Card.Header>
          <Card.Body style={{ padding: "clamp(1rem, 4vw, 2rem)" }}>
            {/* Payment Methods */}
            <div className="mb-4">
              <h5 className="mb-3" style={{ 
                color: "var(--text-primary)", 
                fontWeight: "600",
                fontSize: "clamp(1rem, 4vw, 1.25rem)"
              }}>
                Choose Payment Method
              </h5>
              
              <div className="d-grid gap-3">
                {/* Razorpay Payment */}
                <Card 
                  className="payment-method-card"
                  style={{
                    border: "2px solid var(--border-color)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onClick={handlePayment}
                >
                  <Card.Body style={{ padding: "clamp(1rem, 4vw, 1.5rem)" }}>
                    {/* Desktop Layout */}
                    <div className="d-none d-md-flex align-items-center">
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "1rem"
                        }}
                      >
                        <CreditCard size={24} color="white" />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1" style={{ fontWeight: "600" }}>
                          Credit/Debit Card, UPI, NetBanking
                        </h6>
                        <p className="mb-0" style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                          Powered by Razorpay • Secure & Fast
                        </p>
                      </div>
                      <Badge 
                        bg="success" 
                        style={{ padding: "0.5rem 1rem", borderRadius: "20px" }}
                      >
                        Recommended
                      </Badge>
                    </div>

                    {/* Mobile Layout */}
                    <div className="d-flex d-md-none flex-column text-center">
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 1rem"
                        }}
                      >
                        <CreditCard size={28} color="white" />
                      </div>
                      <div className="mb-2">
                        <h6 className="mb-1" style={{ fontWeight: "600", fontSize: "1rem" }}>
                          Credit/Debit Card, UPI, NetBanking
                        </h6>
                        <p className="mb-2" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          Powered by Razorpay • Secure & Fast
                        </p>
                        <Badge 
                          bg="success" 
                          style={{ padding: "0.4rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem" }}
                        >
                          Recommended
                        </Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Demo Payment */}
                <Card 
                  className="payment-method-card"
                  style={{
                    border: "2px solid var(--border-color)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onClick={handleDemoPayment}
                >
                  <Card.Body style={{ padding: "clamp(1rem, 4vw, 1.5rem)" }}>
                    {/* Desktop Layout */}
                    <div className="d-none d-md-flex align-items-center">
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "1rem"
                        }}
                      >
                        <CheckCircle size={24} color="white" />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1" style={{ fontWeight: "600" }}>
                          Demo Payment (For Testing)
                        </h6>
                        <p className="mb-0" style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                          Skip actual payment for demo purposes
                        </p>
                      </div>
                      <Badge 
                        bg="warning" 
                        style={{ padding: "0.5rem 1rem", borderRadius: "20px" }}
                      >
                        Demo Only
                      </Badge>
                    </div>

                    {/* Mobile Layout */}
                    <div className="d-flex d-md-none flex-column text-center">
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 1rem"
                        }}
                      >
                        <CheckCircle size={28} color="white" />
                      </div>
                      <div className="mb-2">
                        <h6 className="mb-1" style={{ fontWeight: "600", fontSize: "1rem" }}>
                          Demo Payment (For Testing)
                        </h6>
                        <p className="mb-2" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          Skip actual payment for demo purposes
                        </p>
                        <Badge 
                          bg="warning" 
                          style={{ padding: "0.4rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem" }}
                        >
                          Demo Only
                        </Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* Security Features */}
            <div 
              style={{
                background: "var(--bg-tertiary)",
                padding: "clamp(1rem, 4vw, 1.5rem)",
                borderRadius: "12px",
                marginBottom: "1.5rem"
              }}
            >
              <h6 className="mb-3" style={{ 
                color: "var(--text-primary)", 
                fontWeight: "600",
                fontSize: "clamp(0.9rem, 3vw, 1rem)"
              }}>
                🔒 Your Payment is Protected
              </h6>
              <Row>
                <Col sm={6} xs={12} className="mb-2">
                  <div className="d-flex align-items-center">
                    <Check size={16} className="me-2" style={{ color: "var(--secondary-color)" }} />
                    <span style={{ fontSize: "clamp(0.8rem, 2.5vw, 0.875rem)" }}>256-bit SSL Encryption</span>
                  </div>
                </Col>
                <Col sm={6} xs={12} className="mb-2">
                  <div className="d-flex align-items-center">
                    <Check size={16} className="me-2" style={{ color: "var(--secondary-color)" }} />
                    <span style={{ fontSize: "clamp(0.8rem, 2.5vw, 0.875rem)" }}>PCI DSS Compliant</span>
                  </div>
                </Col>
                <Col sm={6} xs={12} className="mb-2">
                  <div className="d-flex align-items-center">
                    <Check size={16} className="me-2" style={{ color: "var(--secondary-color)" }} />
                    <span style={{ fontSize: "clamp(0.8rem, 2.5vw, 0.875rem)" }}>No Card Details Stored</span>
                  </div>
                </Col>
                <Col sm={6} xs={12}>
                  <div className="d-flex align-items-center">
                    <Check size={16} className="me-2" style={{ color: "var(--secondary-color)" }} />
                    <span style={{ fontSize: "clamp(0.8rem, 2.5vw, 0.875rem)" }}>Bank-Level Security</span>
                  </div>
                </Col>
              </Row>
            </div>

            {error && (
              <Alert variant="danger" className="mb-3" style={{ borderRadius: "12px" }}>
                {error}
              </Alert>
            )}

            <div className="d-flex gap-3 justify-content-center justify-content-md-start">
              <Button
                variant="outline-secondary"
                onClick={() => setCurrentStep(2)}
                disabled={loading}
                style={{
                  borderRadius: "12px",
                  fontWeight: "500",
                  padding: "clamp(10px, 3vw, 12px) clamp(16px, 4vw, 24px)",
                  fontSize: "clamp(0.85rem, 2.5vw, 1rem)"
                }}
              >
                ← Back to Shipping
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={4} xs={12} className="mt-3 mt-lg-0">
        <Card
          style={{
            border: "none",
            borderRadius: "16px",
            boxShadow: "var(--shadow-lg)",
            position: "sticky",
            top: "2rem"
          }}
        >
          <Card.Header
            style={{
              background: "linear-gradient(135deg, var(--secondary-color), #34d399)",
              color: "white",
              border: "none",
              borderRadius: "16px 16px 0 0",
              padding: "clamp(1rem, 4vw, 1.5rem)"
            }}
          >
            <div className="d-flex align-items-center">
              <Lock className="me-2" />
              <h5 className="mb-0 fw-bold" style={{ fontSize: "clamp(1rem, 4vw, 1.25rem)" }}>Payment Summary</h5>
            </div>
            <p className="mb-0 mt-1" style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)", opacity: "0.9" }}>
              Final order review
            </p>
          </Card.Header>
          <Card.Body style={{ padding: "clamp(1rem, 4vw, 1.5rem)" }}>
            {/* Order Items Summary */}
            <div className="mb-3">
              <h6 style={{ fontWeight: "600", marginBottom: "0.75rem" }}>Order Items ({cartItems.length})</h6>
              {cartItems.slice(0, 2).map((item) => (
                <div key={item.product._id} className="d-flex align-items-center mb-2">
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: `linear-gradient(135deg, ${item.product.name.charAt(0) === 'K' ? '#3b82f6' : '#10b981'}, ${item.product.name.charAt(0) === 'K' ? '#1d4ed8' : '#059669'})`,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "0.875rem",
                      fontWeight: "700",
                      marginRight: "12px"
                    }}
                  >
                    {item.product.name.charAt(0)}
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-0" style={{ fontSize: "0.8rem", fontWeight: "600" }}>
                      {item.product.name}
                    </h6>
                    <p className="mb-0" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                      Qty: {item.quantity} × ₹{item.product.price}
                    </p>
                  </div>
                </div>
              ))}
              {cartItems.length > 2 && (
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0" }}>
                  +{cartItems.length - 2} more items
                </p>
              )}
            </div>

            {/* Shipping Address */}
            <div className="mb-3">
              <h6 style={{ fontWeight: "600", marginBottom: "0.75rem" }}>Shipping Address</h6>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4", marginBottom: "0" }}>
                {shippingAddress.street}<br />
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
              </p>
            </div>

            <hr style={{ border: "1px solid var(--border-color)" }} />
            
            {/* Price Breakdown */}
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: "var(--text-secondary)" }}>Subtotal:</span>
                <span style={{ fontWeight: "600" }}>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: "var(--text-secondary)" }}>
                  Shipping: {shipping === 0 && <Badge bg="success" className="ms-1">FREE</Badge>}
                </span>
                <span style={{ fontWeight: "600" }}>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span style={{ color: "var(--text-secondary)" }}>Tax (18% GST):</span>
                <span style={{ fontWeight: "600" }}>₹{tax.toFixed(2)}</span>
              </div>
              <hr style={{ border: "2px solid var(--secondary-color)" }} />
              <div className="d-flex justify-content-between">
                <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  Total to Pay:
                </span>
                <span 
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "var(--secondary-color)"
                  }}
                >
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            {loading && (
              <Alert variant="info" className="text-center" style={{ borderRadius: "12px" }}>
                <div className="d-flex align-items-center justify-content-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Processing Payment...
                </div>
              </Alert>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  // Confirmation Step Component
  const ConfirmationStep = () => (
    <Row className="justify-content-center">
      <Col md={10} lg={8}>
        <Card 
          className="text-center"
          style={{
            border: "none",
            borderRadius: "24px",
            boxShadow: "var(--shadow-xl)",
            background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
            overflow: "hidden",
            position: "relative"
          }}
        >
          <Card.Body style={{ padding: "3rem 2rem" }}>
            <div 
              style={{
                width: "100px",
                height: "100px",
                background: "var(--secondary-color)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 2rem",
                animation: "bounce 1s ease-in-out infinite alternate"
              }}
            >
              <Check size={50} color="white" />
            </div>
            
            <h1 
              className="mb-3"
              style={{
                color: "var(--secondary-dark)",
                fontWeight: "700",
                fontSize: "2.5rem"
              }}
            >
              Order Confirmed! 🎉
            </h1>
            
            <p 
              className="mb-4"
              style={{
                color: "var(--text-primary)",
                fontSize: "1.1rem",
                lineHeight: "1.6"
              }}
            >
              Thank you for your order! We've received your payment and will start processing your order right away.
            </p>

            {orderData && (
              <Card 
                className="mb-4"
                style={{
                  border: "none",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(10px)"
                }}
              >
                <Card.Body style={{ padding: "1.5rem" }}>
                  <div className="row text-start">
                    <div className="col-md-4">
                      <h6 style={{ color: "var(--text-primary)", fontWeight: "600" }}>Order Details</h6>
                      <p className="mb-1">
                        <strong>Order ID:</strong> {orderData.orderId || orderData.id || orderData._id}
                      </p>
                      <p className="mb-1">
                        <strong>Total Amount:</strong> ₹{(orderData.total ?? total).toFixed(2)}
                      </p>
                      <p className="mb-0">
                        <strong>Items:</strong> {orderData.items?.length || 0} {orderData.items?.length === 1 ? 'item' : 'items'}
                      </p>

                      {/* Small item list */}
                      {orderData.items && orderData.items.length > 0 && (
                        <div style={{ marginTop: '0.75rem' }}>
                          {orderData.items.map((it, idx) => (
                            <div key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                              {it.productName || it.name || it.product} × {it.quantity} — ₹{(it.totalPrice ?? (it.unitPrice * it.quantity)).toFixed(2)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <h6 style={{ color: "var(--text-primary)", fontWeight: "600" }}>Payment Details</h6>
                      <p className="mb-1">
                        <strong>Payment ID:</strong> {paymentData?.razorpay_payment_id || paymentData?.payment_id || paymentData?.id || 'N/A'}
                      </p>
                      <p className="mb-1">
                        <strong>Status:</strong> 
                        <Badge bg="success" className="ms-2">
                          {orderData.paymentDetails?.payment_status || paymentData?.payment_status || 'Completed'}
                        </Badge>
                      </p>
                      <p className="mb-0">
                        <strong>Method:</strong> {orderData.paymentDetails?.method || orderData.paymentDetails?.payment_method || paymentData?.method || 'Online Payment'}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <h6 style={{ color: "var(--text-primary)", fontWeight: "600" }}>Shipping Address</h6>
                      <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                        {shippingAddress.street || orderData.shippingAddress?.street}<br />
                        {shippingAddress.city || orderData.shippingAddress?.city}, {shippingAddress.state || orderData.shippingAddress?.state} {shippingAddress.zipCode || orderData.shippingAddress?.zipCode}<br />
                        {shippingAddress.country || orderData.shippingAddress?.country}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}

            <div className="d-flex gap-3 justify-content-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/orders")}
                style={{
                  borderRadius: "12px",
                  fontWeight: "600",
                  padding: "12px 24px",
                  background: "linear-gradient(45deg, var(--secondary-color), #34d399)",
                  border: "none",
                  boxShadow: "var(--shadow-md)"
                }}
              >
                View Order History
              </Button>
              <Button
                variant="outline-primary"
                size="lg"
                onClick={() => navigate("/")}
                style={{
                  borderRadius: "12px",
                  fontWeight: "500",
                  padding: "12px 24px",
                  borderColor: "var(--secondary-color)",
                  color: "var(--secondary-color)"
                }}
              >
                Continue Shopping
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  // Empty cart component
  if (cartItems.length === 0 && currentStep === 1) {
    return (
      <div className="App">
        <Header />
        <div className="main-container" style={{ paddingTop: "110px" }}>
          <Container>
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <Card
                  className="text-center"
                  style={{
                    border: "none",
                    borderRadius: "24px",
                    boxShadow: "var(--shadow-xl)",
                    padding: "2rem"
                  }}
                >
                  <Card.Body>
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        background: "linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 2rem",
                        fontSize: "3rem"
                      }}
                    >
                      🛒
                    </div>
                    <h2 className="mb-3" style={{ color: "var(--text-primary)", fontWeight: "700" }}>
                      Your Cart is Empty
                    </h2>
                    <p className="mb-4" style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                      Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => navigate("/")}
                      style={{
                        borderRadius: "12px",
                        fontWeight: "600",
                        padding: "12px 24px",
                        background: "linear-gradient(45deg, var(--primary-color), var(--primary-light))",
                        border: "none",
                        boxShadow: "var(--shadow-md)"
                      }}
                    >
                      Start Shopping
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`Checkout - ${currentStep === 1 ? 'Review Cart' : currentStep === 2 ? 'Shipping Details' : currentStep === 3 ? 'Payment' : 'Confirmation'}`}
        description="Complete your craft supplies purchase with our secure checkout process. Review your order, add shipping details, and complete payment safely."
        keywords="checkout, secure payment, craft supplies order, shipping details, order completion"
        url={`${SEO_CONFIG.SITE_URL}/checkout`}
        noindex={true}
        canonical={`${SEO_CONFIG.SITE_URL}/checkout`}
      />
      <div className="App">
        <Header />
        <div className="main-container checkout-container" style={{ paddingTop: "110px" }}>
        <Container className="px-3 px-md-4">
          <CheckoutProgressBar />
          
          {currentStep === 1 && <CartReviewStep />}
          {currentStep === 2 && <CheckoutStep />}
          {currentStep === 3 && <PaymentStep />}
          {currentStep === 4 && <ConfirmationStep />}
        </Container>
      </div>
    </div>
    </>
  );
}