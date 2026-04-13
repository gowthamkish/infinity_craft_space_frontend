import api from "./axios";

// Product Recommendations API
export const recommendationsAPI = {
  // Get recommendations for a specific product
  getByProduct: async (productId, limit = 6) => {
    try {
      const response = await api.get(
        `/api/products/${productId}/recommendations`,
        {
          params: { limit },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return { success: false, data: [] };
    }
  },

  // Get popular products
  getPopular: async (limit = 6) => {
    try {
      const response = await api.get("/api/products/popular/list", {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching popular products:", error);
      return { success: false, data: [] };
    }
  },

  // Get trending products
  getTrending: async (limit = 6, days = 7) => {
    try {
      const response = await api.get("/api/products/trending/list", {
        params: { limit, days },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching trending products:", error);
      return { success: false, data: [] };
    }
  },

  // Get products frequently bought together
  getBoughtTogether: async (productId, limit = 4) => {
    try {
      const response = await api.get(
        `/api/products/${productId}/bought-together`,
        {
          params: { limit },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching bought together products:", error);
      return { success: false, data: [] };
    }
  },
};

// Coupon API
export const couponAPI = {
  // Validate coupon code
  validate: async (code, cartTotal) => {
    try {
      const response = await api.post("/api/coupons/validate", {
        code,
        cartTotal,
      });
      return response.data;
    } catch (error) {
      console.error("Error validating coupon:", error);
      return { success: false, error: error.response?.data?.error };
    }
  },
};

// Q&A API
export const qnaAPI = {
  // Get Q&A for a product
  getByProduct: async (productId, page = 1, limit = 10, sort = "latest") => {
    try {
      const response = await api.get(`/api/qna/product/${productId}`, {
        params: { page, limit, sort },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching Q&A:", error);
      return { success: false, data: [] };
    }
  },

  // Post a question
  postQuestion: async (productId, question) => {
    try {
      const response = await api.post(
        `/api/qna/product/${productId}/question`,
        {
          question,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error posting question:", error);
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Post an answer
  postAnswer: async (qnaId, content) => {
    try {
      const response = await api.post(`/api/qna/${qnaId}/answer`, {
        content,
      });
      return response.data;
    } catch (error) {
      console.error("Error posting answer:", error);
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Mark as helpful
  markHelpful: async (qnaId) => {
    try {
      const response = await api.post(`/api/qna/${qnaId}/helpful`);
      return response.data;
    } catch (error) {
      console.error("Error marking as helpful:", error);
      return { success: false };
    }
  },

  // Mark as not helpful
  markNotHelpful: async (qnaId) => {
    try {
      const response = await api.post(`/qna/${qnaId}/not-helpful`);
      return response.data;
    } catch (error) {
      console.error("Error marking as not helpful:", error);
      return { success: false };
    }
  },
};

// Return Request API
export const returnAPI = {
  // Get user's return requests
  getMyReturns: async (page = 1, limit = 10, status) => {
    try {
      const response = await api.get("/returns", {
        params: { page, limit, status },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching return requests:", error);
      return { success: false, data: [] };
    }
  },

  // Get return request details
  getDetails: async (returnId) => {
    try {
      const response = await api.get(`/returns/${returnId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching return details:", error);
      return { success: false };
    }
  },

  // Create return request
  create: async (
    orderId,
    items,
    reason,
    returnType = "return",
    images = [],
  ) => {
    try {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("items", JSON.stringify(items));
      formData.append("reason", reason);
      formData.append("returnType", returnType);

      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await api.post("/returns", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating return request:", error);
      return { success: false, error: error.response?.data?.error };
    }
  },
};
