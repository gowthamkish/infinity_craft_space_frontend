import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import { OrbitLoader, DotsLoader } from "../components/Loader";
import {
  FiMapPin, FiHeart, FiEdit2, FiTrash2, FiShoppingCart,
  FiCheckCircle, FiPhone, FiMap, FiUser, FiGift, FiShare2,
  FiCopy, FiAward,
} from "react-icons/fi";
import api from "../api/axios";
import Header from "../components/Header";
import { addToCart } from "../features/cartSlice";
import "./Account.css";

const ADDRESS_FIELDS = [
  { key: "label",   label: "Label"    },
  { key: "street",  label: "Street"   },
  { key: "city",    label: "City"     },
  { key: "state",   label: "State"    },
  { key: "zipCode", label: "ZIP Code" },
  { key: "phone",   label: "Phone"    },
];

export default function Account() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [addresses,    setAddresses]    = useState([]);
  const [wishlist,     setWishlist]     = useState([]);
  const [profile,      setProfile]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [copiedCode,   setCopiedCode]   = useState(false);
  const authUser = useSelector((s) => s.auth.user);

  const [editingAddress, setEditingAddress] = useState(null);
  const [showEditModal,  setShowEditModal]  = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/api/auth/addresses");
      setAddresses(res.data.addresses || []);
    } catch { /* ignore */ }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/api/auth/wishlist");
      setWishlist(res.data.wishlist || []);
    } catch { /* ignore */ }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/auth/profile");
      setProfile(res.data.user || res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchAddresses(), fetchWishlist(), fetchProfile()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCopyReferral = useCallback(() => {
    const code = profile?.referralCode || authUser?.referralCode;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  }, [profile, authUser]);

  const handleDeleteAddress = async (id) => {
    try { await api.delete(`/api/auth/addresses/${id}`); fetchAddresses(); } catch { /* ignore */ }
  };

  const handleSetDefault = async (id) => {
    try { await api.post(`/api/auth/addresses/${id}/default`); fetchAddresses(); } catch { /* ignore */ }
  };

  const openEdit = (addr) => {
    setEditingAddress({ ...addr });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    try {
      await api.put(`/api/auth/addresses/${editingAddress._id}`, editingAddress);
      setShowEditModal(false);
      fetchAddresses();
    } catch { /* ignore */ }
  };

  const handleRemoveWishlist = async (productId) => {
    try { await api.delete(`/api/auth/wishlist/${productId}`); fetchWishlist(); } catch { /* ignore */ }
  };

  const moveToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    navigate("/checkout");
  };

  return (
    <div className="account-page">
      <Header />
      <div className="account-container">
        {loading ? (
          <div className="account-loading">
            <div className="account-loading-spinner">
              <OrbitLoader size="lg" />
            </div>
            <h5>Loading your account…</h5>
            <p>Fetching addresses and wishlist</p>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="account-hero">
              <div className="account-avatar">IC</div>
              <h1 className="account-hero-title">My Account</h1>
              <p className="account-hero-sub">Manage your addresses and wishlist</p>
            </div>

            {/* ── Loyalty + Referral strip ── */}
            {(profile || authUser) && (() => {
              const pts  = profile?.loyaltyPoints  ?? authUser?.loyaltyPoints  ?? 0;
              const tier = profile?.loyaltyTier    ?? authUser?.loyaltyTier    ?? "bronze";
              const code = profile?.referralCode   ?? authUser?.referralCode;
              const credits = profile?.referralCredits ?? authUser?.referralCredits ?? 0;
              const tierColors = { bronze: "#92400e", silver: "#475569", gold: "#b45309" };
              const tierBg    = { bronze: "#fef3c7", silver: "#f1f5f9", gold: "#fffbeb" };

              return (
                <div className="account-loyalty-strip">
                  {/* Loyalty points card */}
                  <div className="account-loyalty-card">
                    <div className="account-loyalty-icon" style={{ background: tierBg[tier] }}>
                      <FiAward size={22} color={tierColors[tier]} />
                    </div>
                    <div className="account-loyalty-body">
                      <p className="account-loyalty-label">Loyalty Points</p>
                      <p className="account-loyalty-pts">{pts.toLocaleString()} pts</p>
                      <span className="account-loyalty-tier" style={{ background: tierBg[tier], color: tierColors[tier] }}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)} member
                      </span>
                    </div>
                    <div className="account-loyalty-note">
                      Earn points on every purchase. Redeem at checkout.
                    </div>
                  </div>

                  {/* Referral card */}
                  {code && (
                    <div className="account-loyalty-card">
                      <div className="account-loyalty-icon" style={{ background: "#ede9fe" }}>
                        <FiGift size={22} color="#7c3aed" />
                      </div>
                      <div className="account-loyalty-body">
                        <p className="account-loyalty-label">Referral Code</p>
                        <div className="account-referral-code-row">
                          <span className="account-referral-code">{code}</span>
                          <button
                            className="account-copy-btn"
                            onClick={handleCopyReferral}
                            title="Copy code"
                          >
                            {copiedCode ? <FiCheckCircle size={15} color="#10b981" /> : <FiCopy size={15} />}
                          </button>
                        </div>
                        {credits > 0 && (
                          <p className="account-referral-credits">
                            ₹{credits} referral credits available
                          </p>
                        )}
                      </div>
                      <div className="account-loyalty-note">
                        Share your code — you both get ₹100 store credit when they order!
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="account-grid">
              {/* ── Address Book ── */}
              <div>
                <div className="account-card card">
                  <div className="account-card-header account-card-header--address">
                    <FiMapPin size={24} />
                    <div className="account-card-header-text">
                      <h4>Address Book</h4>
                      <small>Manage your delivery addresses</small>
                    </div>
                  </div>
                  <div className="account-card-body card-body">
                    {addresses.length === 0 ? (
                      <div className="account-empty">
                        <FiMapPin size={56} className="account-empty-icon" />
                        <p className="account-empty-title">No saved addresses yet</p>
                        <p className="account-empty-sub">Add an address to get started with deliveries</p>
                      </div>
                    ) : (
                      <div className="account-items">
                        {addresses.map((a) => (
                          <div key={a._id} className="account-item">
                            <div className="account-item-name">
                              {a.label || `${a.city}, ${a.state}`}
                              {a.isDefault && (
                                <span className="account-default-badge">
                                  <FiCheckCircle size={11} /> Default
                                </span>
                              )}
                            </div>
                            <div className="account-item-meta">
                              <FiMap size={13} />
                              {a.street}, {a.city}, {a.state} {a.zipCode}
                            </div>
                            <div className="account-item-meta">
                              <FiPhone size={13} />
                              {a.phone}
                            </div>
                            <div className="account-item-actions">
                              <button className="acct-btn acct-btn--edit" onClick={() => openEdit(a)}>
                                <FiEdit2 size={13} /> Edit
                              </button>
                              <button className="acct-btn acct-btn--default" onClick={() => handleSetDefault(a._id)}>
                                <FiCheckCircle size={13} /> Set Default
                              </button>
                              <button className="acct-btn acct-btn--delete" onClick={() => handleDeleteAddress(a._id)}>
                                <FiTrash2 size={13} /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Wishlist ── */}
              <div>
                <div className="account-card card">
                  <div className="account-card-header account-card-header--wishlist">
                    <FiHeart size={24} />
                    <div className="account-card-header-text">
                      <h4>Wishlist</h4>
                      <small>Your favorite products</small>
                    </div>
                  </div>
                  <div className="account-card-body card-body">
                    {wishlist.length === 0 ? (
                      <div className="account-empty">
                        <FiHeart size={56} className="account-empty-icon" />
                        <p className="account-empty-title">Your wishlist is empty</p>
                        <p className="account-empty-sub">Add products you love to save them for later</p>
                      </div>
                    ) : (
                      <div className="account-items">
                        {wishlist.map((p) => (
                          <div key={p._id} className="account-item account-item--wishlist">
                            <p className="account-item-name">{p.name}</p>
                            <p className="account-item-price">₹{p.price}</p>
                            <div className="account-item-actions">
                              <button className="acct-btn acct-btn--cart" onClick={() => moveToCart(p)}>
                                <FiShoppingCart size={13} /> Add to Cart
                              </button>
                              <button className="acct-btn acct-btn--delete" onClick={() => handleRemoveWishlist(p._id)}>
                                <FiTrash2 size={13} /> Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Edit Address Modal ── */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <div className="acct-modal-header">
            <h5><FiEdit2 size={20} className="me-2" style={{ display: "inline" }} />Edit Address</h5>
            <small>Update your delivery address</small>
          </div>
          <Modal.Body className="acct-modal-body">
            {editingAddress && (
              <div style={{ display: "grid", gap: "1rem" }}>
                {ADDRESS_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <label className="acct-field-label">{label}</label>
                    <input
                      type="text"
                      className="acct-input form-control"
                      value={editingAddress[key] || ""}
                      onChange={(e) => setEditingAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={!!editingAddress.isDefault}
                      onChange={(e) => setEditingAddress((prev) => ({ ...prev, isDefault: e.target.checked }))}
                    />
                    <span className="acct-field-label" style={{ margin: 0 }}>Set as default</span>
                  </label>
                </div>
              </div>
            )}
          </Modal.Body>
          <div className="acct-modal-footer">
            <button className="acct-btn acct-btn--cancel btn" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button className="acct-btn acct-btn--save btn" onClick={saveEdit}>Save Changes</button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
