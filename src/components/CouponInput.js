import { useState } from "react";
import { DotsLoader } from "./Loader";
import { FiCheck, FiX } from "react-icons/fi";
import { couponAPI } from "../api/features";

const CouponInput = ({ cartTotal, onCouponApplied, appliedCoupon = null, onRemoveCoupon }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatedCoupon, setValidatedCoupon] = useState(appliedCoupon);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError("Please enter a coupon code"); return; }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await couponAPI.validate(code.toUpperCase(), cartTotal);
      if (result.success) {
        setValidatedCoupon(result.data);
        setSuccess(true);
        setCode("");
        if (onCouponApplied) onCouponApplied(result.data);
      } else {
        setError(result.error || "Invalid coupon code");
        setValidatedCoupon(null);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setValidatedCoupon(null);
    setSuccess(false);
    setCode("");
    if (onRemoveCoupon) onRemoveCoupon();
  };

  return (
    <div className="co-coupon">
      <p className="co-coupon-label">Have a Coupon Code?</p>

      {validatedCoupon ? (
        <div className="co-coupon-applied">
          <div className="co-coupon-applied-info">
            <FiCheck size={18} className="co-coupon-applied-icon" />
            <div>
              <p className="co-coupon-applied-code">{validatedCoupon.code} Applied</p>
              <p className="co-coupon-applied-discount">Discount: ₹{validatedCoupon.discount.toFixed(2)}</p>
            </div>
          </div>
          <button className="co-coupon-remove" onClick={handleRemove} aria-label="Remove coupon">
            <FiX size={14} /> Remove
          </button>
        </div>
      ) : (
        <form onSubmit={handleValidate} className="co-coupon-form" noValidate>
          <div className="co-coupon-row">
            <input
              type="text"
              className={`co-input co-coupon-input${error ? " co-input--error" : ""}`}
              placeholder="Enter coupon code"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
              disabled={loading}
              aria-label="Coupon code"
            />
            <button
              type="submit"
              className="co-coupon-apply"
              disabled={loading || !code.trim()}
            >
              {loading ? <DotsLoader size="sm" /> : "Apply"}
            </button>
          </div>

          {error && (
            <div className="co-error co-coupon-msg" role="alert">
              <FiX size={13} /> {error}
            </div>
          )}
          {success && (
            <div className="co-coupon-success" role="status">
              <FiCheck size={13} /> Coupon applied successfully!
            </div>
          )}
        </form>
      )}

      <p className="co-coupon-tip">💡 Check your emails for exclusive discount codes!</p>
    </div>
  );
};

export default CouponInput;
