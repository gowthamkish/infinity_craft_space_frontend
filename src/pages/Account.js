import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Avatar,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PhoneIcon from "@mui/icons-material/Phone";
import MapIcon from "@mui/icons-material/Map";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import api from "../api/axios";
import Header from "../components/Header";
import { addToCart } from "../features/cartSlice";

const ADDRESS_FIELDS = [
  { key: "label", label: "Label" },
  { key: "street", label: "Street" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "zipCode", label: "ZIP Code" },
  { key: "phone", label: "Phone" },
];

export default function Account() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const authUser = useSelector((s) => s.auth.user);

  const [editingAddress, setEditingAddress] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/api/auth/addresses");
      setAddresses(res.data.addresses || []);
    } catch {
      /* ignore */
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/api/auth/wishlist");
      setWishlist(res.data.wishlist || []);
    } catch {
      /* ignore */
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/auth/profile");
      setProfile(res.data.user || res.data);
    } catch {
      /* ignore */
    }
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
    try {
      await api.delete(`/api/auth/addresses/${id}`);
      fetchAddresses();
    } catch {
      /* ignore */
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.post(`/api/auth/addresses/${id}/default`);
      fetchAddresses();
    } catch {
      /* ignore */
    }
  };

  const openEdit = (addr) => {
    setEditingAddress({ ...addr });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    try {
      await api.put(
        `/api/auth/addresses/${editingAddress._id}`,
        editingAddress,
      );
      setShowEditModal(false);
      fetchAddresses();
    } catch {
      /* ignore */
    }
  };

  const handleRemoveWishlist = async (productId) => {
    try {
      await api.delete(`/api/auth/wishlist/${productId}`);
      fetchWishlist();
    } catch {
      /* ignore */
    }
  };

  const moveToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    navigate("/checkout");
  };

  const tierColors = {
    bronze: { bg: "#fef3c7", color: "#92400e" },
    silver: { bg: "#f1f5f9", color: "#475569" },
    gold: { bg: "#fffbeb", color: "#b45309" },
  };

  return (
    <Box sx={{ bgcolor: "grey.50", minHeight: "100vh" }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50vh",
              gap: 2,
            }}
          >
            <CircularProgress size={56} />
            <Typography variant="h6" color="text.secondary">
              Loading your account…
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fetching addresses and wishlist
            </Typography>
          </Box>
        ) : (
          <>
            {/* Hero */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: "primary.main",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  mx: "auto",
                  mb: 2,
                }}
              >
                IC
              </Avatar>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                My Account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your addresses and wishlist
              </Typography>
            </Box>

            {/* Loyalty + Referral strip */}
            {(profile || authUser) &&
              (() => {
                const pts =
                  profile?.loyaltyPoints ?? authUser?.loyaltyPoints ?? 0;
                const tier =
                  profile?.loyaltyTier ?? authUser?.loyaltyTier ?? "bronze";
                const code = profile?.referralCode ?? authUser?.referralCode;
                const credits =
                  profile?.referralCredits ?? authUser?.referralCredits ?? 0;
                const tc = tierColors[tier] || tierColors.bronze;

                return (
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Loyalty points card */}
                    <Grid item xs={12} md={code ? 6 : 12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                          display: "flex",
                          gap: 2,
                          alignItems: "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: tc.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <EmojiEventsIcon sx={{ color: tc.color, fontSize: 24 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Loyalty Points
                          </Typography>
                          <Typography variant="h5" fontWeight={700}>
                            {pts.toLocaleString()} pts
                          </Typography>
                          <Chip
                            label={`${tier.charAt(0).toUpperCase() + tier.slice(1)} member`}
                            size="small"
                            sx={{
                              bgcolor: tc.bg,
                              color: tc.color,
                              fontWeight: 600,
                              mt: 0.5,
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mt: 1 }}
                          >
                            Earn points on every purchase. Redeem at checkout.
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Referral card */}
                    {code && (
                      <Grid item xs={12} md={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            display: "flex",
                            gap: 2,
                            alignItems: "flex-start",
                          }}
                        >
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: "#ede9fe",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <CardGiftcardIcon sx={{ color: "#8B1A4A", fontSize: 24 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Referral Code
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                              <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{
                                  fontFamily: "monospace",
                                  bgcolor: "grey.100",
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                }}
                              >
                                {code}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={handleCopyReferral}
                                title="Copy code"
                              >
                                {copiedCode ? (
                                  <CheckCircleIcon sx={{ color: "#10b981", fontSize: 18 }} />
                                ) : (
                                  <ContentCopyIcon sx={{ fontSize: 18 }} />
                                )}
                              </IconButton>
                            </Stack>
                            {credits > 0 && (
                              <Typography variant="body2" sx={{ color: "#8B1A4A", mt: 0.5 }}>
                                ₹{credits} referral credits available
                              </Typography>
                            )}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ mt: 1 }}
                            >
                              Share your code — you both get ₹100 store credit when they order!
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                );
              })()}

            <Grid container spacing={3}>
              {/* Address Book */}
              <Grid item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%" }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        p: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        bgcolor: "primary.50",
                      }}
                    >
                      <LocationOnIcon color="primary" sx={{ fontSize: 28 }} />
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          Address Book
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Manage your delivery addresses
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ p: 3 }}>
                      {addresses.length === 0 ? (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 6,
                            color: "text.secondary",
                          }}
                        >
                          <LocationOnIcon sx={{ fontSize: 56, mb: 2, opacity: 0.3 }} />
                          <Typography variant="body1" fontWeight={500} gutterBottom>
                            No saved addresses yet
                          </Typography>
                          <Typography variant="body2">
                            Add an address to get started with deliveries
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={2}>
                          {addresses.map((a) => (
                            <Paper
                              key={a._id}
                              elevation={0}
                              sx={{
                                p: 2,
                                border: "1px solid",
                                borderColor: a.isDefault ? "primary.main" : "divider",
                                borderRadius: 2,
                                bgcolor: a.isDefault ? "primary.50" : "background.paper",
                              }}
                            >
                              <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                                <Box>
                                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                      {a.label || `${a.city}, ${a.state}`}
                                    </Typography>
                                    {a.isDefault && (
                                      <Chip
                                        icon={<CheckCircleIcon />}
                                        label="Default"
                                        size="small"
                                        color="primary"
                                      />
                                    )}
                                  </Stack>
                                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                                    <MapIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {a.street}, {a.city}, {a.state} {a.zipCode}
                                    </Typography>
                                  </Stack>
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {a.phone}
                                    </Typography>
                                  </Stack>
                                </Box>
                              </Stack>
                              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<EditIcon />}
                                  onClick={() => openEdit(a)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  startIcon={<CheckCircleIcon />}
                                  onClick={() => handleSetDefault(a._id)}
                                >
                                  Set Default
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleDeleteAddress(a._id)}
                                >
                                  Delete
                                </Button>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Wishlist */}
              <Grid item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%" }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        p: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        bgcolor: "error.50",
                      }}
                    >
                      <FavoriteIcon color="error" sx={{ fontSize: 28 }} />
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          Wishlist
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your favorite products
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ p: 3 }}>
                      {wishlist.length === 0 ? (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 6,
                            color: "text.secondary",
                          }}
                        >
                          <FavoriteIcon sx={{ fontSize: 56, mb: 2, opacity: 0.3 }} />
                          <Typography variant="body1" fontWeight={500} gutterBottom>
                            Your wishlist is empty
                          </Typography>
                          <Typography variant="body2">
                            Add products you love to save them for later
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={2}>
                          {wishlist.map((p) => (
                            <Paper
                              key={p._id}
                              elevation={0}
                              sx={{
                                p: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                              }}
                            >
                              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                {p.name}
                              </Typography>
                              <Typography variant="h6" color="primary" fontWeight={700} sx={{ mb: 1.5 }}>
                                ₹{p.price}
                              </Typography>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  startIcon={<ShoppingCartIcon />}
                                  onClick={() => moveToCart(p)}
                                >
                                  Add to Cart
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleRemoveWishlist(p._id)}
                                >
                                  Remove
                                </Button>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {/* Edit Address Modal */}
        <Dialog
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1}>
              <EditIcon />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Edit Address
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Update your delivery address
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            {editingAddress && (
              <Stack spacing={2} sx={{ pt: 1 }}>
                {ADDRESS_FIELDS.map(({ key, label }) => (
                  <TextField
                    key={key}
                    label={label}
                    value={editingAddress[key] || ""}
                    onChange={(e) =>
                      setEditingAddress((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    fullWidth
                    size="small"
                  />
                ))}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!editingAddress.isDefault}
                      onChange={(e) =>
                        setEditingAddress((prev) => ({
                          ...prev,
                          isDefault: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="Set as default"
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={saveEdit}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
