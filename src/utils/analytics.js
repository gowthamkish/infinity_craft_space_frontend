/**
 * Analytics Service for E-commerce Tracking
 * 
 * Implements Google Analytics 4 (GA4) Enhanced E-commerce events:
 * - Add to Cart
 * - Remove from Cart
 * - View Cart
 * - Begin Checkout
 * - Add Shipping Info
 * - Add Payment Info
 * - Purchase (Revenue Tracking)
 * 
 * Also supports Facebook Pixel if configured.
 */

// Check if gtag is available
const isGtagAvailable = () => typeof window !== 'undefined' && typeof window.gtag === 'function';

// Check if Facebook Pixel is available
const isFbqAvailable = () => typeof window !== 'undefined' && typeof window.fbq === 'function';

/**
 * Send event to Google Analytics
 */
const sendGAEvent = (eventName, params = {}) => {
  if (!isGtagAvailable()) {
    console.warn('Google Analytics not available');
    return;
  }
  
  try {
    window.gtag('event', eventName, params);
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 GA Event: ${eventName}`, params);
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

/**
 * Send event to Facebook Pixel
 */
const sendFBEvent = (eventName, params = {}) => {
  if (!isFbqAvailable()) return;
  
  try {
    window.fbq('track', eventName, params);
  } catch (error) {
    console.error('FB Pixel error:', error);
  }
};

/**
 * Format product for GA4 items array
 */
const formatProduct = (product, quantity = 1, index = 0) => ({
  item_id: product._id || product.id,
  item_name: product.name,
  item_category: product.category || 'Uncategorized',
  item_variant: product.variant || product.subCategory || '',
  price: product.price,
  quantity: quantity,
  index: index,
  currency: 'INR',
});

/**
 * Format cart items for GA4
 */
const formatCartItems = (cartItems) => 
  cartItems.map((item, index) => 
    formatProduct(item.product, item.quantity, index)
  );

// ==================== E-COMMERCE EVENTS ====================

/**
 * Track when a product is added to cart
 */
export const trackAddToCart = (product, quantity = 1) => {
  const value = product.price * quantity;
  
  sendGAEvent('add_to_cart', {
    currency: 'INR',
    value: value,
    items: [formatProduct(product, quantity)],
  });
  
  sendFBEvent('AddToCart', {
    content_ids: [product._id || product.id],
    content_name: product.name,
    content_type: 'product',
    value: value,
    currency: 'INR',
  });
};

/**
 * Track when a product is removed from cart
 */
export const trackRemoveFromCart = (product, quantity = 1) => {
  const value = product.price * quantity;
  
  sendGAEvent('remove_from_cart', {
    currency: 'INR',
    value: value,
    items: [formatProduct(product, quantity)],
  });
};

/**
 * Track when user views their cart
 */
export const trackViewCart = (cartItems, total) => {
  sendGAEvent('view_cart', {
    currency: 'INR',
    value: total,
    items: formatCartItems(cartItems),
  });
};

/**
 * Track when checkout begins (Step 1: Cart Review)
 */
export const trackBeginCheckout = (cartItems, total) => {
  sendGAEvent('begin_checkout', {
    currency: 'INR',
    value: total,
    items: formatCartItems(cartItems),
  });
  
  sendFBEvent('InitiateCheckout', {
    content_ids: cartItems.map(item => item.product._id || item.product.id),
    contents: cartItems.map(item => ({
      id: item.product._id || item.product.id,
      quantity: item.quantity,
    })),
    num_items: cartItems.reduce((acc, item) => acc + item.quantity, 0),
    value: total,
    currency: 'INR',
  });
};

/**
 * Track checkout funnel progress
 */
export const trackCheckoutProgress = (step, stepName, cartItems, total) => {
  sendGAEvent('checkout_progress', {
    checkout_step: step,
    checkout_step_name: stepName,
    currency: 'INR',
    value: total,
    items: formatCartItems(cartItems),
  });
};

/**
 * Track when shipping info is added (Step 2)
 */
export const trackAddShippingInfo = (cartItems, total, shippingTier = 'standard') => {
  sendGAEvent('add_shipping_info', {
    currency: 'INR',
    value: total,
    shipping_tier: shippingTier,
    items: formatCartItems(cartItems),
  });
};

/**
 * Track when payment info is added (Step 3)
 */
export const trackAddPaymentInfo = (cartItems, total, paymentType = 'razorpay') => {
  sendGAEvent('add_payment_info', {
    currency: 'INR',
    value: total,
    payment_type: paymentType,
    items: formatCartItems(cartItems),
  });
  
  sendFBEvent('AddPaymentInfo', {
    value: total,
    currency: 'INR',
  });
};

/**
 * Track successful purchase - REVENUE TRACKING
 */
export const trackPurchase = (orderData) => {
  const { orderId, items, total, subtotal, tax = 0, shipping = 0, paymentDetails } = orderData;
  
  const formattedItems = items.map((item, index) => ({
    item_id: item.product || item.productId || item._id,
    item_name: item.productName || item.name,
    item_category: item.category || 'Uncategorized',
    price: item.unitPrice || item.price,
    quantity: item.quantity,
    index: index,
  }));
  
  // GA4 Purchase Event - This tracks REVENUE
  sendGAEvent('purchase', {
    transaction_id: orderId || orderData._id || `ORD-${Date.now()}`,
    value: total,
    currency: 'INR',
    tax: tax,
    shipping: shipping,
    items: formattedItems,
    payment_type: paymentDetails?.method || 'online',
  });
  
  // Facebook Purchase Event
  sendFBEvent('Purchase', {
    content_ids: formattedItems.map(item => item.item_id),
    contents: formattedItems.map(item => ({
      id: item.item_id,
      quantity: item.quantity,
    })),
    content_type: 'product',
    value: total,
    currency: 'INR',
    num_items: formattedItems.reduce((acc, item) => acc + item.quantity, 0),
  });
  
  // Custom event for internal tracking
  sendGAEvent('order_completed', {
    order_id: orderId || orderData._id,
    order_value: total,
    items_count: formattedItems.length,
    payment_method: paymentDetails?.method || 'razorpay',
  });
};

/**
 * Track failed/abandoned checkout
 */
export const trackCheckoutAbandoned = (step, stepName, cartItems, total, reason = '') => {
  sendGAEvent('checkout_abandoned', {
    checkout_step: step,
    checkout_step_name: stepName,
    currency: 'INR',
    value: total,
    abandonment_reason: reason,
    items_count: cartItems.length,
  });
};

/**
 * Track payment failure
 */
export const trackPaymentFailed = (cartItems, total, errorMessage = '') => {
  sendGAEvent('payment_failed', {
    currency: 'INR',
    value: total,
    error_message: errorMessage,
    items_count: cartItems.length,
  });
};

// ==================== USER ENGAGEMENT EVENTS ====================

/**
 * Track product view
 */
export const trackViewProduct = (product) => {
  sendGAEvent('view_item', {
    currency: 'INR',
    value: product.price,
    items: [formatProduct(product)],
  });
  
  sendFBEvent('ViewContent', {
    content_ids: [product._id || product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'INR',
  });
};

/**
 * Track wishlist addition
 */
export const trackAddToWishlist = (product) => {
  sendGAEvent('add_to_wishlist', {
    currency: 'INR',
    value: product.price,
    items: [formatProduct(product)],
  });
  
  sendFBEvent('AddToWishlist', {
    content_ids: [product._id || product.id],
    content_name: product.name,
    value: product.price,
    currency: 'INR',
  });
};

/**
 * Track search queries
 */
export const trackSearch = (searchTerm, resultsCount = 0) => {
  sendGAEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
  
  sendFBEvent('Search', {
    search_string: searchTerm,
  });
};

/**
 * Track user signup
 */
export const trackSignUp = (method = 'email') => {
  sendGAEvent('sign_up', {
    method: method,
  });
  
  sendFBEvent('CompleteRegistration', {
    status: true,
  });
};

/**
 * Track user login
 */
export const trackLogin = (method = 'email') => {
  sendGAEvent('login', {
    method: method,
  });
};

/**
 * Track page view
 */
export const trackPageView = (pagePath, pageTitle) => {
  sendGAEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

/**
 * Track custom events
 */
export const trackCustomEvent = (eventName, params = {}) => {
  sendGAEvent(eventName, params);
};

// Export all functions as default object for convenience
const analytics = {
  trackAddToCart,
  trackRemoveFromCart,
  trackViewCart,
  trackBeginCheckout,
  trackCheckoutProgress,
  trackAddShippingInfo,
  trackAddPaymentInfo,
  trackPurchase,
  trackCheckoutAbandoned,
  trackPaymentFailed,
  trackViewProduct,
  trackAddToWishlist,
  trackSearch,
  trackSignUp,
  trackLogin,
  trackPageView,
  trackCustomEvent,
};

export default analytics;
