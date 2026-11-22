import { useContext, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip from "@mui/material/Tooltip";
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiInstagram } from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import { ToastContext } from "../../context/ToastContext";
import { errMsg } from "../../app/baseApi";
import { IG_PROFILE_URL, IG_HANDLE } from "../home/InstagramFeed";
import {
  useGetAdminInstagramPostsQuery,
  useCreateInstagramPostMutation,
  useUpdateInstagramPostMutation,
  useDeleteInstagramPostMutation,
  useUploadInstagramImageMutation,
  useSearchInstagramProductsQuery,
} from "../../services/instagramApi";

const MAX_TAGS = 6;
const MAX_IMAGE_MB = 8;
const EMPTY = { imageUrl: "", imagePublicId: "", permalink: "", caption: "", isActive: true, tags: [] };

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

/* Dialog: upload a photo, paste the Instagram link, click the photo to drop numbered pins, pick a product per pin */
function PostEditor({ post, onClose }) {
  const { addToast } = useContext(ToastContext);
  const isNew = !post?._id;
  const [form, setForm] = useState(post ? { ...EMPTY, ...post, tags: post.tags.map((t) => ({ x: t.x, y: t.y, product: t.product })) } : EMPTY);
  const [error, setError] = useState("");
  const [term, setTerm] = useState("");
  const fileRef = useRef(null);
  const [upload, { isLoading: uploading }] = useUploadInstagramImageMutation();
  const [create, { isLoading: creating }] = useCreateInstagramPostMutation();
  const [update, { isLoading: updating }] = useUpdateInstagramPostMutation();
  const { data: results = [], isFetching } = useSearchInstagramProductsQuery(term, { skip: term.trim().length < 2 });

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError("Please choose a JPEG, PNG or WebP photo.");
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setError(`Photo is too large (max ${MAX_IMAGE_MB} MB).`);
    setError("");
    try {
      const img = await upload(await toDataUrl(file)).unwrap();
      setForm((f) => ({ ...f, imageUrl: img.url, imagePublicId: img.publicId }));
    } catch (err) {
      setError(errMsg(err, "Upload failed"));
    }
  };

  const placePin = (e) => {
    if (form.tags.length >= MAX_TAGS) return setError(`You can tag at most ${MAX_TAGS} products per photo.`);
    const box = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - box.left) / box.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - box.top) / box.height) * 100));
    setError("");
    setForm((f) => ({ ...f, tags: [...f.tags, { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, product: null }] }));
  };
  const setProduct = (i, product) => setForm((f) => ({ ...f, tags: f.tags.map((t, j) => (j === i ? { ...t, product } : t)) }));
  const removePin = (i) => setForm((f) => ({ ...f, tags: f.tags.filter((_, j) => j !== i) }));

  const save = async () => {
    setError("");
    if (!form.imageUrl) return setError("Upload a photo first.");
    const untagged = form.tags.findIndex((t) => !t.product);
    if (untagged !== -1) return setError(`Pin ${untagged + 1} has no product yet — choose one or remove the pin.`);
    const payload = {
      imageUrl: form.imageUrl, imagePublicId: form.imagePublicId, permalink: form.permalink, caption: form.caption, isActive: form.isActive,
      tags: form.tags.map((t) => ({ product: t.product._id, x: t.x, y: t.y })),
    };
    try {
      if (isNew) await create(payload).unwrap();
      else await update({ id: post._id, ...payload }).unwrap();
      addToast(isNew ? "Post added to the feed" : "Post updated", { type: "success" });
      onClose();
    } catch (err) {
      setError(errMsg(err, "Could not save the post"));
    }
  };

  const busy = uploading || creating || updating;
  return (
    <Dialog open onClose={busy ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isNew ? "Add Instagram post" : "Edit Instagram post"}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          {/* Photo + pins */}
          <Box>
            {form.imageUrl ? (
              <>
                <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", cursor: "crosshair", lineHeight: 0 }} onClick={placePin} role="presentation">
                  <img src={form.imageUrl} alt="" style={{ width: "100%", display: "block" }} draggable={false} />
                  {form.tags.map((t, i) => (
                    <Box key={i} sx={{ position: "absolute", left: `${t.x}%`, top: `${t.y}%`, transform: "translate(-50%,-50%)", width: 26, height: 26, borderRadius: "50%", bgcolor: t.product ? "#d24e33" : "#6b7280", color: "#fff", border: "2px solid #fff", fontSize: 13, fontWeight: 700, display: "grid", placeItems: "center", boxShadow: 3, pointerEvents: "none" }}>{i + 1}</Box>
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Click on the photo where a product appears to drop a numbered pin ({form.tags.length}/{MAX_TAGS}).
                </Typography>
                <Button size="small" startIcon={<FiUpload />} onClick={() => fileRef.current?.click()} disabled={uploading} sx={{ textTransform: "none", mt: 0.5 }}>Replace photo</Button>
              </>
            ) : (
              <Button variant="outlined" startIcon={<FiUpload />} onClick={() => fileRef.current?.click()} disabled={uploading} sx={{ textTransform: "none", width: "100%", height: 220, borderStyle: "dashed" }}>
                {uploading ? "Uploading…" : "Upload the photo (square or portrait works best)"}
              </Button>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onFile} />
          </Box>

          {/* Details + tags */}
          <Box sx={{ display: "grid", gap: 2, alignContent: "start" }}>
            <TextField size="small" label="Instagram post link (optional)" placeholder="https://www.instagram.com/p/…" value={form.permalink} onChange={(e) => setForm((f) => ({ ...f, permalink: e.target.value }))} helperText="Shown as “View on Instagram”" />
            <TextField size="small" label="Caption (optional)" value={form.caption} onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))} inputProps={{ maxLength: 300 }} multiline minRows={2} />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Tagged products</Typography>
              {form.tags.length === 0 && <Typography variant="body2" color="text.secondary">No pins yet. Click on the photo to add one.</Typography>}
              {form.tags.map((t, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Chip size="small" label={i + 1} color={t.product ? "primary" : "default"} />
                  <Autocomplete
                    size="small" fullWidth
                    options={results}
                    loading={isFetching}
                    value={t.product}
                    onChange={(_, v) => setProduct(i, v)}
                    onInputChange={(_, v, reason) => reason === "input" && setTerm(v)}
                    getOptionLabel={(o) => o.name || ""}
                    isOptionEqualToValue={(a, b) => a._id === b._id}
                    filterOptions={(x) => x}
                    noOptionsText="Type at least 2 letters of the product name"
                    renderOption={(props, o) => (
                      <li {...props} key={o._id}>
                        <img src={o.image || ""} alt="" width="32" height="32" style={{ objectFit: "cover", borderRadius: 4, marginRight: 8 }} onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
                        {o.name} <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>₹{o.price}</Typography>
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} placeholder="Search a product…" />}
                  />
                  <IconButton size="small" color="error" onClick={() => removePin(i)} aria-label={`Remove pin ${i + 1}`}><FiTrash2 size={15} /></IconButton>
                </Box>
              ))}
            </Box>

            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />} label={form.isActive ? "Shown on the home page" : "Hidden"} />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={busy} sx={{ textTransform: "none" }}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={busy} sx={{ textTransform: "none" }}>{busy ? "Saving…" : "Save post"}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function InstagramManager() {
  const { addToast } = useContext(ToastContext);
  const { data: posts = [], isLoading, isError } = useGetAdminInstagramPostsQuery();
  const [update] = useUpdateInstagramPostMutation();
  const [remove] = useDeleteInstagramPostMutation();
  const [editing, setEditing] = useState(null); // null | {} (new) | post

  useEffect(() => { document.title = "Instagram feed – Admin"; }, []);

  const toggle = async (p) => {
    try { await update({ id: p._id, isActive: !p.isActive }).unwrap(); }
    catch (e) { addToast(errMsg(e, "Could not update"), { type: "error" }); }
  };
  const del = async (p) => {
    if (!window.confirm("Remove this photo from the feed? This cannot be undone.")) return;
    try { await remove(p._id).unwrap(); addToast("Removed", { type: "success" }); }
    catch (e) { addToast(errMsg(e, "Could not delete"), { type: "error" }); }
  };

  return (
    <AdminLayout>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Instagram feed — shop the look</Typography>
          <Typography variant="body2" color="text.secondary">
            The six newest active photos appear on the home page. Tag products on each photo so customers can shop the look. Profile: <a href={IG_PROFILE_URL} target="_blank" rel="noopener noreferrer">@{IG_HANDLE}</a>
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<FiPlus />} onClick={() => setEditing({})} sx={{ textTransform: "none" }}>Add post</Button>
      </Box>

      {isLoading ? <Typography color="text.secondary">Loading…</Typography>
        : isError ? <Typography color="error">Couldn't load posts.</Typography>
        : posts.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 5, textAlign: "center" }}>
            <FiInstagram size={28} />
            <Typography variant="h6" sx={{ my: 1 }}>No photos yet</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>Add a photo you posted on Instagram, tag the products in it, and it appears on your home page. Until then the section stays hidden.</Typography>
            <Button variant="contained" onClick={() => setEditing({})} sx={{ textTransform: "none" }}>Add your first photo</Button>
          </Paper>
        ) : (
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" }}>
            {posts.map((p) => (
              <Paper key={p._id} variant="outlined" sx={{ overflow: "hidden", opacity: p.isActive ? 1 : 0.6 }}>
                <Box component="img" src={p.imageUrl} alt="" sx={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
                <Box sx={{ p: 1.5 }}>
                  <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", mb: 0.5, flexWrap: "wrap" }}>
                    <Chip size="small" label={`${p.tags.length} tagged`} color={p.tags.length ? "primary" : "default"} variant="outlined" />
                    {!p.isActive && <Chip size="small" label="Hidden" />}
                  </Box>
                  {p.caption && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }} noWrap>{p.caption}</Typography>}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Tooltip title={p.isActive ? "Hide from home page" : "Show on home page"}>
                      <Switch size="small" checked={p.isActive} onChange={() => toggle(p)} />
                    </Tooltip>
                    <Box>
                      <IconButton size="small" onClick={() => setEditing(p)} aria-label="Edit"><FiEdit2 size={15} /></IconButton>
                      <IconButton size="small" color="error" onClick={() => del(p)} aria-label="Delete"><FiTrash2 size={15} /></IconButton>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

      {editing && <PostEditor key={editing._id || "new"} post={editing._id ? editing : null} onClose={() => setEditing(null)} />}
    </AdminLayout>
  );
}
