import { useState } from "react";
import { FiTag, FiCheck, FiX } from "react-icons/fi";
import { useValidateCouponMutation } from "../services/engagementApi";
import { Spinner } from "../pages/checkout/ui";

/** Coupon box shown in the checkout summary (styles: styles/checkout.css .ck-coupon*) */
const CouponInput = ({ cartTotal, onCouponApplied, appliedCoupon = null, onRemoveCoupon }) => {
  const [code, setCode] = useState("");
  const [validateCoupon, { isLoading: loading }] = useValidateCouponMutation();
  const [validatedCoupon, setValidatedCoupon] = useState(appliedCoupon);
  const [error, setError] = useState(null);

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError("Please enter a coupon code"); return; }
    setError(null);
    try {
      const result = await validateCoupon({ code: code.toUpperCase(), cartTotal }).unwrap();
      if (result.success) {
        setValidatedCoupon(result.data);
        setCode("");
        if (onCouponApplied) onCouponApplied(result.data);
      } else {
        setError(result.error || "Invalid coupon code");
        setValidatedCoupon(null);
      }
    } catch (err) {
      // 400 responses carry { success:false, error } (invalid / expired / minimum not met)
      setError(err?.data?.error || "Invalid coupon code");
      setValidatedCoupon(null);
    }
  };

  const handleRemove = () => {
    setValidatedCoupon(null);
    setCode("");
    setError(null);
    if (onRemoveCoupon) onRemoveCoupon();
  };

  return (
    <div className="ck-coupon">
      <label className="ck-label" htmlFor="ck-coupon-code">Have a coupon?</label>

      {validatedCoupon ? (
        <div className="ck-coupon-applied" role="status">
          <span className="ck-coupon-tick" aria-hidden="true"><FiCheck size={16} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b>{validatedCoupon.code}</b>
            <small>−₹{validatedCoupon.discount?.toFixed(2)} discount applied</small>
          </div>
          <button type="button" className="ck-link" onClick={handleRemove} aria-label="Remove coupon">
            <FiX size={16} /> Remove
          </button>
        </div>
      ) : (
        <form className="ck-coupon-form" onSubmit={handleValidate} noValidate>
          <div className="ck-coupon-input">
            <FiTag size={17} aria-hidden="true" />
            <input
              id="ck-coupon-code"
              className={`ck-input ${error ? "is-error" : ""}`}
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
              placeholder="Enter code"
              autoComplete="off"
              disabled={loading}
              aria-invalid={!!error}
            />
          </div>
          <button type="submit" className="ck-btn ck-btn--ghost" disabled={loading || !code.trim()}>
            {loading ? <Spinner /> : "Apply"}
          </button>
        </form>
      )}

      {error && <span className="ck-help ck-help--err" role="alert">{error}</span>}
      <span className="ck-help">💡 Check your email for exclusive discount codes</span>
    </div>
  );
};

export default CouponInput;
