/**
 * <DeliveryEstimator productId={id} isCustomizable processingDaysMin processingDaysMax />
 *
 * Reusable delivery date estimator.
 * - Shows a pincode input + "Check Delivery" button
 * - Calls POST /api/delivery/estimate
 * - Displays formatted delivery range, custom-product notice, and zone info
 * - Persists last used pincode in localStorage
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiMapPin, FiTruck, FiClock, FiAlertTriangle, FiX, FiChevronRight } from "react-icons/fi";
import api from "../api/axios";
import "./DeliveryEstimator.css";

const LS_PINCODE_KEY = "de_last_pincode";

export default function DeliveryEstimator({
  productId,
  isCustomizable = false,
  processingDaysMin = 10,
  processingDaysMax = 12,
  className = "",
}) {
  const [pincode, setPincode] = useState(() => localStorage.getItem(LS_PINCODE_KEY) || "");
  const [result, setResult] = useState(null);   // success result from API
  const [error, setError] = useState(null);     // error message string
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  // Auto-check if we already have a valid pincode saved
  useEffect(() => {
    const saved = localStorage.getItem(LS_PINCODE_KEY);
    if (saved && /^[1-9][0-9]{5}$/.test(saved) && productId) {
      handleCheck(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleCheck = useCallback(
    async (pin = pincode) => {
      const trimmed = String(pin).trim();

      // Client-side validation first
      if (!/^[1-9][0-9]{5}$/.test(trimmed)) {
        setError("Enter a valid 6-digit PIN code.");
        setResult(null);
        return;
      }

      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const res = await api.post(
          "/api/delivery/estimate",
          { pincode: trimmed, productId },
          { signal: controller.signal },
        );
        localStorage.setItem(LS_PINCODE_KEY, trimmed);
        setResult(res.data);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        const msg =
          err.response?.data?.message ||
          "Could not check delivery. Please try again.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [pincode, productId],
  );

  const handleClear = () => {
    setPincode("");
    setResult(null);
    setError(null);
    localStorage.removeItem(LS_PINCODE_KEY);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleCheck();
  };

  // ── Custom product notice (always shown if product is customizable) ─────────
  const showCustomBanner = isCustomizable;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`de-root ${className}`} aria-label="Delivery estimator">

      {/* Custom product banner */}
      {showCustomBanner && (
        <div className="de-custom-banner" role="note">
          <FiClock size={15} className="de-custom-icon" aria-hidden="true" />
          <div>
            <strong>Handcrafted / Made-to-Order</strong>
            <p className="de-custom-sub">
              This item takes{" "}
              <strong>
                {processingDaysMin}–{processingDaysMax} business days
              </strong>{" "}
              to prepare before dispatch.
            </p>
          </div>
        </div>
      )}

      {/* Pincode input row */}
      <div className="de-input-row">
        <label className="de-label" htmlFor="de-pincode-input">
          <FiMapPin size={13} aria-hidden="true" />
          Check delivery
        </label>
        <div className="de-input-btn-row">
        <div className="de-input-wrap">
          <input
            ref={inputRef}
            id="de-pincode-input"
            type="tel"
            inputMode="numeric"
            maxLength={6}
            className={`de-input ${error ? "de-input--error" : ""}`}
            placeholder="Enter PIN code"
            value={pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              setPincode(val);
              if (error) setError(null);
              if (result) setResult(null);
            }}
            onKeyDown={handleKeyDown}
            aria-label="Enter PIN code"
            aria-describedby={error ? "de-error" : result ? "de-result" : undefined}
            disabled={loading}
          />
          {pincode && !loading && (
            <button
              className="de-clear-btn"
              onClick={handleClear}
              aria-label="Clear PIN code"
              tabIndex={-1}
            >
              <FiX size={13} />
            </button>
          )}
        </div>
        <button
          className="de-check-btn"
          onClick={() => handleCheck()}
          disabled={loading || pincode.length < 6}
          aria-label="Check delivery availability"
        >
          {loading ? (
            <span className="de-spinner" aria-hidden="true" />
          ) : (
            <>
              Check <FiChevronRight size={14} aria-hidden="true" />
            </>
          )}
        </button>
        </div>{/* end de-input-btn-row */}
      </div>

      {/* Error state */}
      {error && (
        <p id="de-error" className="de-error" role="alert">
          <FiAlertTriangle size={13} aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Success result */}
      {result && (
        <div id="de-result" className="de-result" role="status" aria-live="polite">
          <FiTruck size={15} className="de-result-icon" aria-hidden="true" />
          <div className="de-result-body">
            <p className="de-result-headline">
              Delivery by{" "}
              <strong className="de-result-dates">{result.displayRange}</strong>
            </p>

            {/* Shipping breakdown */}
            <ul className="de-breakdown">
              {result.isCustom && (
                <li>
                  <span className="de-breakdown-label">Processing</span>
                  <span className="de-breakdown-value">
                    {result.processingDaysMin}–{result.processingDaysMax} business days
                  </span>
                </li>
              )}
              <li>
                <span className="de-breakdown-label">Shipping</span>
                <span className="de-breakdown-value">
                  {result.minDays}–{result.maxDays} days
                </span>
              </li>
              {result.isCustom && (
                <li className="de-breakdown-total">
                  <span className="de-breakdown-label">Total</span>
                  <span className="de-breakdown-value">
                    {result.totalMinDays}–{result.totalMaxDays} days
                  </span>
                </li>
              )}
            </ul>

            {/* Zone / state info */}
            <p className="de-zone-info">
              Ships from Bangalore → {result.customerState}{" "}
              <span className="de-zone-tag">{result.customerZone}</span>
            </p>

            {/* Custom product reminder in result */}
            {result.isCustom && (
              <p className="de-result-custom-note">
                ⚠️ Custom orders dispatch in {result.processingDaysMin}–
                {result.processingDaysMax} business days after order placement.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
