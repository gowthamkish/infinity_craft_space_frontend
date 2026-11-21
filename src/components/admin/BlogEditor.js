import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import { FiArrowLeft, FiImage, FiUpload } from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import MarkdownLite from "../blog/MarkdownLite";
import { ToastContext } from "../../context/ToastContext";
import { errMsg } from "../../app/baseApi";
import {
  useGetAdminBlogPostQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useUploadBlogImageMutation,
} from "../../services/blogApi";
import "../../pages/blog.css";

const EMPTY = { title: "", slug: "", excerpt: "", content: "", tags: "", authorName: "Infinity Craft Space", metaTitle: "", metaDescription: "", coverImage: null, status: "draft" };
const MAX_IMAGE_MB = 8;

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const STARTER = `Write your story here. Use a blank line between paragraphs.

## A section heading

Some **bold** or *italic* text, and a [link to a product](/products).

- A bullet point
- Another one

> A pull-quote or a line from the artisan.
`;

export default function BlogEditor() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const { addToast } = useContext(ToastContext);
  const { data: existing, isLoading } = useGetAdminBlogPostQuery(id, { skip: isNew });
  const [createPost, { isLoading: creating }] = useCreateBlogPostMutation();
  const [updatePost, { isLoading: updating }] = useUpdateBlogPostMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadBlogImageMutation();

  const [form, setForm] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState("");
  const textRef = useRef(null);
  const coverInput = useRef(null);
  const bodyImgInput = useRef(null);

  useEffect(() => {
    if (existing) {
      setForm({ ...EMPTY, ...existing, tags: (existing.tags || []).join(", "), coverImage: existing.coverImage?.url ? existing.coverImage : null });
      setSlugTouched(true);
    }
  }, [existing]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const slugFrom = (t) => t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);

  const onTitle = (e) => {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, ...(isNew && !slugTouched ? { slug: slugFrom(title) } : {}) }));
  };

  const pickImage = async (file) => {
    if (!file) return null;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) { setError("Please choose a JPEG, PNG, WebP or GIF image."); return null; }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) { setError(`Image is too large (max ${MAX_IMAGE_MB} MB).`); return null; }
    setError("");
    try {
      return await uploadImage(await toDataUrl(file)).unwrap();
    } catch (e) {
      setError(errMsg(e, "Image upload failed"));
      return null;
    }
  };

  const onCover = async (e) => {
    const img = await pickImage(e.target.files?.[0]);
    e.target.value = "";
    if (img) setForm((f) => ({ ...f, coverImage: { ...img, alt: f.coverImage?.alt || "" } }));
  };

  const onBodyImage = async (e) => {
    const img = await pickImage(e.target.files?.[0]);
    e.target.value = "";
    if (!img) return;
    const ta = textRef.current;
    const pos = ta ? ta.selectionStart : form.content.length;
    const snippet = `\n\n![Describe the photo](${img.url})\n\n`;
    setForm((f) => ({ ...f, content: f.content.slice(0, pos) + snippet + f.content.slice(pos) }));
  };

  const save = async (status) => {
    setError("");
    if (!form.title.trim()) return setError("Please add a title.");
    if (!form.content.trim()) return setError("Please write the post body.");
    const payload = {
      title: form.title, slug: form.slug || undefined, excerpt: form.excerpt, content: form.content,
      tags: form.tags, authorName: form.authorName, metaTitle: form.metaTitle, metaDescription: form.metaDescription,
      coverImage: form.coverImage, status,
    };
    try {
      const saved = isNew ? await createPost(payload).unwrap() : await updatePost({ id, ...payload }).unwrap();
      addToast(status === "published" ? "Post published!" : "Draft saved", { type: "success" });
      if (isNew) navigate(`/admin/blog/${saved._id}`, { replace: true });
      else setForm((f) => ({ ...f, slug: saved.slug, status: saved.status }));
    } catch (e) {
      setError(errMsg(e, "Could not save the post"));
    }
  };

  const busy = creating || updating || uploading;
  const published = form.status === "published";

  return (
    <AdminLayout>
      <Button startIcon={<FiArrowLeft />} onClick={() => navigate("/admin/blog")} sx={{ textTransform: "none", mb: 1 }}>All posts</Button>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{isNew ? "New post" : "Edit post"} {!isNew && <Chip size="small" sx={{ ml: 1 }} label={published ? "Published" : "Draft"} color={published ? "success" : "default"} />}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" disabled={busy} onClick={() => save(published ? "published" : "draft")} sx={{ textTransform: "none" }}>{published ? "Save changes" : "Save draft"}</Button>
          {published
            ? <Button variant="text" color="warning" disabled={busy} onClick={() => save("draft")} sx={{ textTransform: "none" }}>Unpublish</Button>
            : <Button variant="contained" disabled={busy} onClick={() => save("published")} sx={{ textTransform: "none" }}>Publish</Button>}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {!isNew && isLoading ? <Typography color="text.secondary">Loading…</Typography> : (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, alignItems: "start" }}>
          <Paper variant="outlined" sx={{ p: 2.5, display: "grid", gap: 2 }}>
            <TextField label="Title" value={form.title} onChange={onTitle} inputProps={{ maxLength: 140 }} required fullWidth />
            <TextField label="Web address (slug)" value={form.slug} onChange={(e) => { setSlugTouched(true); setForm((f) => ({ ...f, slug: e.target.value })); }}
              helperText={`infinitycraftspace.com/blog/${form.slug || "your-title"}${published ? " — changing this breaks existing links" : ""}`} fullWidth />
            <TextField label="Short summary (shown on cards and in Google)" value={form.excerpt} onChange={set("excerpt")} inputProps={{ maxLength: 300 }} multiline minRows={2} helperText={`${form.excerpt.length}/300`} fullWidth />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Cover image</Typography>
              {form.coverImage?.url ? (
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <Box component="img" src={form.coverImage.url} alt="" sx={{ width: 180, height: 110, objectFit: "cover", borderRadius: 1 }} />
                  <Box sx={{ flex: 1, minWidth: 200, display: "grid", gap: 1 }}>
                    <TextField size="small" label="Image description (for accessibility & SEO)" value={form.coverImage.alt || ""} onChange={(e) => setForm((f) => ({ ...f, coverImage: { ...f.coverImage, alt: e.target.value } }))} />
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button size="small" onClick={() => coverInput.current?.click()} sx={{ textTransform: "none" }}>Replace</Button>
                      <Button size="small" color="error" onClick={() => setForm((f) => ({ ...f, coverImage: null }))} sx={{ textTransform: "none" }}>Remove</Button>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Button variant="outlined" startIcon={<FiUpload />} disabled={uploading} onClick={() => coverInput.current?.click()} sx={{ textTransform: "none" }}>{uploading ? "Uploading…" : "Upload cover image"}</Button>
              )}
              <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={onCover} />
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="subtitle2">Story</Typography>
                <Button size="small" startIcon={<FiImage />} disabled={uploading} onClick={() => bodyImgInput.current?.click()} sx={{ textTransform: "none" }}>Insert photo</Button>
                <input ref={bodyImgInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={onBodyImage} />
              </Box>
              <TextField inputRef={textRef} value={form.content} onChange={set("content")} multiline minRows={16} fullWidth placeholder={STARTER}
                helperText="Formatting: ## heading · **bold** · *italic* · [text](link) · - bullet · 1. numbered · > quote · --- divider" />
            </Box>

            <TextField label="Topics (comma separated)" value={form.tags} onChange={set("tags")} placeholder="jewellery care, artisans, gifting" fullWidth />
            <TextField label="Author name" value={form.authorName} onChange={set("authorName")} fullWidth />
            <TextField label="Google title (optional)" value={form.metaTitle} onChange={set("metaTitle")} inputProps={{ maxLength: 70 }} helperText="Leave blank to use the post title" fullWidth />
            <TextField label="Google description (optional)" value={form.metaDescription} onChange={set("metaDescription")} inputProps={{ maxLength: 170 }} multiline minRows={2} helperText="Leave blank to use the short summary" fullWidth />
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, position: { lg: "sticky" }, top: 16, maxHeight: { lg: "calc(100vh - 32px)" }, overflow: "auto" }}>
            <Typography variant="overline" color="text.secondary">Live preview</Typography>
            <Box className="blog-article-head" sx={{ mt: 1 }}>
              <h1 style={{ fontSize: "1.8rem", margin: "0 0 .6rem" }}>{form.title || "Your title"}</h1>
            </Box>
            {form.coverImage?.url && <figure className="blog-cover"><img src={form.coverImage.url} alt={form.coverImage.alt || ""} /></figure>}
            <MarkdownLite source={form.content || "_Start writing to see the preview…_"} />
          </Paper>
        </Box>
      )}
    </AdminLayout>
  );
}
