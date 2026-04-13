import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { FiCheck, FiX } from "react-icons/fi";
import { couponAPI } from "../api/features";
import "../styles/toastNotifications.css";

/**
 * CouponInput Component
 * Allows users to enter and validate coupon codes at checkout
 */
const CouponInput = ({
  cartTotal,
  onCouponApplied,
  appliedCoupon = null,
  onRemoveCoupon,
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatedCoupon, setValidatedCoupon] = useState(appliedCoupon);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleValidate = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await couponAPI.validate(code.toUpperCase(), cartTotal);

      if (result.success) {
        setValidatedCoupon(result.data);
        setSuccess(true);
        setCode("");

        // Call parent callback
        if (onCouponApplied) {
          onCouponApplied(result.data);
        }
      } else {
        setError(result.error || "Invalid coupon code");
        setValidatedCoupon(null);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Coupon validation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setValidatedCoupon(null);
    setSuccess(false);
    setCode("");

    if (onRemoveCoupon) {
      onRemoveCoupon();
    }
  };

  return (
    <div style={{ marginBottom: "var(--spacing-lg)" }}>
      <h5 style={{ marginBottom: "var(--spacing-md)", fontWeight: 600 }}>
        Have a Coupon Code?
      </h5>

      {validatedCoupon ? (
        <div
          style={{
            padding: "var(--spacing-md)",
            backgroundColor: "var(--success-50)",
            border: "1px solid var(--success-200)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-md)",
            }}
          >
            <FiCheck size={24} style={{ color: "var(--color-success)" }} />
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  color: "var(--success-700)",
                }}
              >
                {validatedCoupon.code} Applied
              </p>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                Discount: ₹{validatedCoupon.discount.toFixed(2)}
              </p>
            </div>
          </div>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleRemove}
            style={{ borderRadius: "var(--radius-md)" }}
          >
            Remove
          </Button>
        </div>
      ) : (
        <Form onSubmit={handleValidate}>
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <Form.Control
              type="text"
              placeholder="Enter coupon code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading}
              style={{
                borderRadius: "var(--radius-md)",
                borderColor: error ? "var(--danger-300)" : undefined,
              }}
            />
            <Button
              variant="outline-primary"
              onClick={handleValidate}
              disabled={loading || !code.trim()}
              style={{ borderRadius: "var(--radius-md)", minWidth: "100px" }}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Checking...
                </>
              ) : (
                "Apply"
              )}
            </Button>
          </div>

          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError(null)}
              style={{ marginTop: "var(--spacing-sm)", marginBottom: 0 }}
            >
              <FiX size={16} className="me-2" />
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              variant="success"
              dismissible
              onClose={() => setSuccess(false)}
              style={{ marginTop: "var(--spacing-sm)", marginBottom: 0 }}
            >
              <FiCheck size={16} className="me-2" />
              Coupon code applied successfully!
            </Alert>
          )}
        </Form>
      )}

      {/* Info text */}
      <p
        style={{
          marginTop: "var(--spacing-sm)",
          fontSize: "var(--font-size-xs)",
          color: "var(--text-secondary)",
          marginBottom: 0,
        }}
      >
        💡 Tip: Check your emails for exclusive discount codes!
      </p>
    </div>
  );
};

export default CouponInput;
