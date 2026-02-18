import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  clearCart,
  updateCartItemQuantity,
  removeItemCompletely,
} from "../features/cartSlice";
import Header from "../components/header";
import Container from "react-bootstrap/Container";
import api from "../api/axios";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import {
  trackBeginCheckout,
  trackAddShippingInfo,
  trackAddPaymentInfo,
  trackPurchase,
  trackPaymentFailed,
  trackViewCart,
} from "../utils/analytics";
import { CartReviewStep } from "./checkout/CartReviewStep";
import { CheckoutProgressBar } from "./checkout/CheckoutProgressBar";
import { ShippingStep } from "./checkout/ShippingStep";
import { PaymentStep } from "./checkout/PaymentStep";
import { ConfirmationStep } from "./checkout/ConfirmationStep";
import { EmptyCart } from "./checkout/EmptyCart";
import "./checkout/checkout.css";

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
    phone: "",
    label: "",
    isDefault: false,
  });

  // Stable input style object to prevent re-renders on mobile
  const inputStyle = {
    borderRadius: "12px",
    border: "2px solid var(--border-color)",
    padding: "12px 16px",
    fontSize: "1rem",
  };

  const labelStyle = {
    fontWeight: "600",
    color: "var(--text-primary)",
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [saveAddressToBook, setSaveAddressToBook] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.totalPrice,
    0,
  );
  // TODO: Uncomment when ready to enable shipping charges
  // const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
  const shipping = 0; // Temporarily disabled - free shipping for now
  // TODO: Uncomment when ready to enable GST
  // const tax = subtotal * 0.18; // 18% GST
  const tax = 0; // Temporarily disabled - no GST for now
  const total = subtotal + shipping + tax;

  // Step configuration
  const steps = [
    { number: 1, title: "Cart Review" },
    { number: 2, title: "Shipping" },
    { number: 3, title: "Payment" },
    { number: 4, title: "Confirmation" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch saved addresses from backend
  const fetchSavedAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSavedAddresses([]);
        setLoadingAddresses(false);
        return;
      }
      const res = await api.get("/api/auth/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const addrs = res.data.addresses || [];
      setSavedAddresses(addrs);
      // Auto-select address marked as default in the address book
      const defaultAddr = addrs.find(
        (a) => a.isDefault || a.isDefault === true,
      );
      if (defaultAddr) {
        // populate the form and set selected id
        selectSavedAddress(defaultAddr);
        setSelectedAddressId(defaultAddr._id);
      }
    } catch (err) {
      console.error(
        "Failed to load saved addresses",
        err.response?.data || err.message,
      );
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Save current shippingAddress to user's address book
  const handleSaveAddress = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to save addresses");
        return;
      }
      const payload = { ...shippingAddress };
      const res = await api.post("/api/auth/addresses", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedAddresses(res.data.addresses || []);
      setSaveAddressToBook(false);
    } catch (err) {
      console.error(
        "Failed to save address",
        err.response?.data || err.message,
      );
      setError("Failed to save address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to manage addresses");
        return;
      }
      const res = await api.delete(`/api/auth/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedAddresses(res.data.addresses || []);
    } catch (err) {
      console.error(
        "Failed to delete address",
        err.response?.data || err.message,
      );
      setError("Failed to delete address");
    }
  };

  const selectSavedAddress = (addr) => {
    setShippingAddress({
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      zipCode: addr.zipCode || "",
      country: addr.country || "India",
      phone: addr.phone || "",
      label: addr.label || "",
      isDefault: !!addr.isDefault,
    });
    setSelectedAddressId(addr._id);
    setError(null);
  };

  // Load addresses on mount
  useEffect(() => {
    fetchSavedAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track view cart when checkout page loads
  useEffect(() => {
    if (cartItems.length > 0 && currentStep === 1) {
      trackViewCart(cartItems, total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // Track begin checkout event
    trackBeginCheckout(cartItems, total);
    setCurrentStep(2);
    setError(null);
  };

  const proceedToPayment = () => {
    // Validate shipping address
    const requiredFields = ["street", "city", "state", "zipCode", "phone"];
    const missingFields = requiredFields.filter(
      (field) => !shippingAddress[field].trim(),
    );

    if (missingFields.length > 0) {
      setError(
        `Please fill in all required fields: ${missingFields.join(", ")}`,
      );
      return;
    }

    // Track shipping info added
    trackAddShippingInfo(cartItems, total, shipping === 0 ? 'free' : 'standard');
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

    // Track payment info added
    trackAddPaymentInfo(cartItems, total, 'razorpay');

    try {
      // Initialize Razorpay
      const res = await initializeRazorpay();
      if (!res) {
        setError(
          "Razorpay SDK failed to load. Please check your internet connection.",
        );
        setLoading(false);
        return;
      }
      // Create order on backend
      const token = localStorage.getItem("token");
      const orderResponse = await api.post(
        "/api/payment",
        {
          amount: Math.round(total * 100), // Razorpay expects amount in paise
          currency: "INR",
          shippingAddress: shippingAddress,
          items: cartItems,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const { razorpayOrderId, currency } = orderResponse.data.order;
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
            const verifyResponse = await api.post(
              "/api/payment/verify-payment",
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: orderId,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );

            if (verifyResponse.data.success) {
              // Payment successful, create the actual order
              await completeOrder(response);
            console.error("Verification failed:", verifyResponse.data);
              setError(
                "Payment verification failed. " +
                  (verifyResponse.data.message || "Please try again."),
              );
              trackPaymentFailed(cartItems, total, 'Verification failed');
              setLoading(false);
            }
          } catch (error) {
            console.error(
              "Payment verification error:",
              error.response?.data || error.message,
            );
            setError("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#10b981",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError(
              "Payment cancelled. Please try again to complete your order.",
            );
          },
        },
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
      const items = cartItems.map((item) => ({
        product: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.totalPrice,
      }));

      const subtotalLocal = subtotal;
      const shippingLocal = shipping;
      const taxLocal = tax;
      const totalLocal = total;

      const finalOrderData = {
        orderId:
          paymentResponse?.order_id ||
          paymentResponse?.razorpay_order_id ||
          `ORD-${Date.now()}`,
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
          method: paymentResponse?.method || "online",
        },
        orderDate: new Date().toISOString(),
        status: "confirmed",
      };

      // Clear the cart after capturing items
      dispatch(clearCart());

      setOrderData(finalOrderData);
      setPaymentData(paymentResponse);
      setCurrentStep(4);
      setError(null);

      // Track successful purchase - REVENUE TRACKING
      trackPurchase(finalOrderData);
    } catch (err) {
      console.error("Order completion error:", err);
      setError(
        "Payment successful but there was an error finalizing the order. Please contact support with your payment ID: " +
          (paymentResponse?.razorpay_payment_id || paymentResponse?.payment_id),
      );
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
        items: cartItems.map((item) => ({
          product: item.product._id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: item.totalPrice,
        })),
        shippingAddress,
        subtotal,
        tax,
        shipping,
        total,
        paymentDetails: {
          payment_id: `demo_pay_${Date.now()}`,
          payment_status: "completed",
          payment_method: "demo",
        },
        orderDate: new Date().toISOString(),
        orderId: `ORD-${Date.now()}`,
        status: "confirmed",
      };

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setOrderData(newOrderData);
      setPaymentData({
        payment_id: `demo_pay_${Date.now()}`,
        payment_status: "completed",
      });
      setCurrentStep(4);
      dispatch(clearCart());

      // Track successful purchase - REVENUE TRACKING (demo)
      trackPurchase(newOrderData);
    } catch (err) {
      console.error("Demo order error:", err);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && currentStep === 1) {
    return (
      <div className="App">
        <Header />
        <EmptyCart navigate={navigate} />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`Checkout - ${currentStep === 1 ? "Review Cart" : currentStep === 2 ? "Shipping Details" : currentStep === 3 ? "Payment" : "Confirmation"}`}
        description="Complete your craft supplies purchase with our secure checkout process. Review your order, add shipping details, and complete payment safely."
        keywords="checkout, secure payment, craft supplies order, shipping details, order completion"
        url={`${SEO_CONFIG.SITE_URL}/checkout`}
        noindex={true}
        canonical={`${SEO_CONFIG.SITE_URL}/checkout`}
      />
      <div className="App">
        <Header />
        <div
          className="main-container checkout-container"
          style={{ paddingTop: "110px" }}
        >
          <Container className="px-3 px-md-4">
            <CheckoutProgressBar steps={steps} currentStep={currentStep} />

            {currentStep === 1 && (
              <CartReviewStep
                cartItems={cartItems}
                subtotal={subtotal}
                total={total}
                error={error}
                proceedToCheckout={proceedToCheckout}
                navigate={navigate}
                handleQuantityChange={handleQuantityChange}
                handleRemoveItem={handleRemoveItem}
              />
            )}
            {currentStep === 2 && (
              <ShippingStep
                cartItems={cartItems}
                subtotal={subtotal}
                total={total}
                shippingAddress={shippingAddress}
                labelStyle={labelStyle}
                inputStyle={inputStyle}
                loadingAddresses={loadingAddresses}
                savedAddresses={savedAddresses}
                selectedAddressId={selectedAddressId}
                selectSavedAddress={selectSavedAddress}
                handleDeleteAddress={handleDeleteAddress}
                saveAddressToBook={saveAddressToBook}
                setSaveAddressToBook={setSaveAddressToBook}
                setShippingAddress={setShippingAddress}
                handleInputChange={handleInputChange}
                error={error}
                setCurrentStep={setCurrentStep}
                loading={loading}
                proceedToPayment={proceedToPayment}
                handleSaveAddress={handleSaveAddress}
              />
            )}
            {currentStep === 3 && (
              <PaymentStep
                cartItems={cartItems}
                shippingAddress={shippingAddress}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
                error={error}
                loading={loading}
                handlePayment={handlePayment}
                handleDemoPayment={handleDemoPayment}
                setCurrentStep={setCurrentStep}
              />
            )}
            {currentStep === 4 && (
              <ConfirmationStep
                orderData={orderData}
                paymentData={paymentData}
                shippingAddress={shippingAddress}
                total={total}
                navigate={navigate}
              />
            )}
          </Container>
        </div>
      </div>
    </>
  );
}
