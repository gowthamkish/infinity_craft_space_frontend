import { useState, useEffect } from "react";

// Warehouse location: Bangalore
const WAREHOUSE = { lat: 12.9716, lng: 77.5946 };
const CACHE_KEY = "delivery_location_cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateFromDistance(km) {
  if (km < 50)   return { range: "1–2 days", min: 1, max: 2 };
  if (km < 300)  return { range: "2–3 days", min: 2, max: 3 };
  if (km < 800)  return { range: "3–5 days", min: 3, max: 5 };
  if (km < 1500) return { range: "5–7 days", min: 5, max: 7 };
  if (km < 2500) return { range: "7–9 days", min: 7, max: 9 };
  return          { range: "9–12 days", min: 9, max: 12 };
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.ts > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, ts: Date.now() }));
  } catch {}
}

/**
 * Requests the user's browser geolocation (once), calculates distance from
 * Bangalore warehouse, and returns delivery estimate.
 *
 * Returns:
 *   status: "idle" | "requesting" | "granted" | "denied" | "unavailable"
 *   delivery: { range, min, max } | null
 *   distanceKm: number | null
 *   requestLocation: () => void   (call to trigger prompt)
 */
export function useDeliveryEstimate() {
  const [status, setStatus] = useState("idle");
  const [delivery, setDelivery] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);

  const applyCoords = (lat, lng) => {
    const km = haversineKm(WAREHOUSE.lat, WAREHOUSE.lng, lat, lng);
    const est = estimateFromDistance(km);
    setDistanceKm(Math.round(km));
    setDelivery(est);
    setStatus("granted");
    saveCache({ lat, lng, km: Math.round(km), delivery: est });
  };

  // Restore from cache on mount
  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setDistanceKm(cached.km);
      setDelivery(cached.delivery);
      setStatus("granted");
    }
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => applyCoords(pos.coords.latitude, pos.coords.longitude),
      () => setStatus("denied"),
      { timeout: 10000, maximumAge: CACHE_TTL_MS },
    );
  };

  return { status, delivery, distanceKm, requestLocation };
}
