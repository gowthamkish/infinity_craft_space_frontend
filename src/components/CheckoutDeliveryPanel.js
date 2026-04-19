/**
 * CheckoutDeliveryPanel
 *
 * Auto-fetches delivery estimates for all cart items given a shipping pincode.
 * Used in PaymentStep (and optionally CartReviewStep) to show per-item EDD.
 */

import React, { useEffect, useState } from "react";
import { FiTruck, FiClock, FiAlertTriangle } from "react-icons/fi";
import api from "../api/axios";
import "./CheckoutDeliveryPanel.css";

const CUSTOM_KEYWORDS = ["embroidery", "kundan", "thread bangle", "thread bangles"];

export function isCustomItem(item) {
  if (item.product?.isCustomizable) return true;
  const text = `${item.product?.name ?? ""} ${item.product?.category ?? ""} ${item.product?.subCategory ?? ""}`.toLowerCase();
  return CUSTOM_KEYWORDS.some((kw) => text.includes(kw));
}

/**
 * Fetches EDD for a single cart item.
 * Returns the estimate object, or null on failure.
 */
async function fetchItemEDD(pincode, productId, signal) {
  try {
    const res = await api.post(
      "/api/delivery/estimate",
      { pincode, productId },
      { signal },
    );
    return res.data;
  } catch {
    return null;
  }
}

export default function CheckoutDeliveryPanel({ cartItems, pincode }) {
  const [estimates, setEstimates] = useState({}); // productId → estimate | null
  const [loading, setLoading] = useState(false);

  const hasCustomItems = cartItems.some(isCustomItem);
  const validPin = /^[1-9][0-9]{5}$/.test(String(pincode ?? "").trim());

  useEffect(() => {
    if (!validPin) return;

    const controller = new AbortController();
    setLoading(true);

    Promise.all(
      cartItems.map((item) =>
        fetchItemEDD(pincode, item.product._id, controller.signal).then(
          (est) => ({ id: item.product._id, est }),
        ),
      ),
    ).then((results) => {
      if (controller.signal.aborted) return;
      const map = {};
      results.forEach(({ id, est }) => { map[id] = est; });
      setEstimates(map);
      setLoading(false);
    });

    return () => controller.abort();
  }, [pincode, cartItems]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="cdp-root">
      {/* Custom product global warning */}
      {hasCustomItems && (
        <div className="cdp-custom-banner" role="note">
          <FiClock size={15} className="cdp-custom-icon" aria-hidden="true" />
          <div>
            <strong>Handcrafted items in your order</strong>
            <p className="cdp-custom-sub">
              One or more items require <strong>10–12 business days</strong>{" "}
              of preparation before dispatch. Final delivery date includes this
              processing time.
            </p>
          </div>
        </div>
      )}

      {/* Per-item estimates */}
      <div className="cdp-title">
        <FiTruck size={14} aria-hidden="true" />
        Delivery Estimates
        {!validPin && (
          <span className="cdp-pin-hint">
            (based on your shipping PIN: {pincode || "—"})
          </span>
        )}
      </div>

      {loading && (
        <div className="cdp-loading" aria-live="polite">
          <span className="cdp-spinner" aria-hidden="true" />
          Calculating delivery dates…
        </div>
      )}

      {!loading && (
        <ul className="cdp-list">
          {cartItems.map((item) => {
            const est = estimates[item.product._id];
            const custom = isCustomItem(item);
            return (
              <li key={item.product._id} className="cdp-item">
                <div className="cdp-item-name">
                  {item.product.name}
                  {custom && (
                    <span className="cdp-custom-tag" title="Handcrafted / made-to-order">
                      ✦ Custom
                    </span>
                  )}
                </div>
                <div className="cdp-item-edd">
                  {!validPin ? (
                    <span className="cdp-no-pin">Pincode required</span>
                  ) : !est ? (
                    <span className="cdp-unavail">
                      <FiAlertTriangle size={11} /> Not serviceable
                    </span>
                  ) : (
                    <span className="cdp-dates">
                      🚚 {est.displayRange}
                      {est.isCustom && (
                        <span className="cdp-incl">
                          (incl. {est.processingDaysMin}–{est.processingDaysMax}d processing)
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
