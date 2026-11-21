import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink } from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import BlogAgentPanel from "./BlogAgentPanel";
import { ToastContext } from "../../context/ToastContext";
import { errMsg } from "../../app/baseApi";
import {
  useGetAdminBlogPostsQuery,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
} from "../../services/blogApi";

const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");

export default function BlogManager() {
  const navigate = useNavigate();
  const { addToast } = useContext(ToastContext);
  const { data: posts = [], isLoading, isError } = useGetAdminBlogPostsQuery();
  const [updatePost] = useUpdateBlogPostMutation();
  const [deletePost] = useDeleteBlogPostMutation();
  const [busyId, setBusyId] = useState(null);

  const toggle = async (post) => {
    setBusyId(post._id);
    try {
      await updatePost({ id: post._id, status: post.status === "published" ? "draft" : "published" }).unwrap();
      addToast(post.status === "published" ? "Moved back to drafts" : "Published!", { type: "success" });
    } catch (e) {
      addToast(errMsg(e, "Could not update the post"), { type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (post) => {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    try {
      await deletePost(post._id).unwrap();
      addToast("Post deleted", { type: "success" });
    } catch (e) {
      addToast(errMsg(e, "Could not delete the post"), { type: "error" });
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Blog — Behind the craft</Typography>
          <Typography variant="body2" color="text.secondary">Write stories that show how your pieces are made. Published posts appear at /blog.</Typography>
        </Box>
        <Button variant="contained" startIcon={<FiPlus />} onClick={() => navigate("/admin/blog/new")} sx={{ textTransform: "none" }}>New post</Button>
      </Box>

      <BlogAgentPanel />

      {isLoading ? (
        <Typography color="text.secondary">Loading…</Typography>
      ) : isError ? (
        <Typography color="error">Couldn't load posts.</Typography>
      ) : posts.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 1 }}>No posts yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Start with a story about how one of your best-selling pieces is made.</Typography>
          <Button variant="contained" onClick={() => navigate("/admin/blog/new")} sx={{ textTransform: "none" }}>Write your first post</Button>
        </Paper>
      ) : (
        <Paper variant="outlined">
          {posts.map((p, i) => (
            <Box key={p._id} sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, flexWrap: "wrap", borderTop: i ? "1px solid" : "none", borderColor: "divider" }}>
              <Box component="img" src={p.coverImage?.url || ""} alt="" sx={{ width: 72, height: 54, objectFit: "cover", borderRadius: 1, bgcolor: "#efe9de", flexShrink: 0 }} onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography sx={{ fontWeight: 600 }}>{p.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {p.status === "published" ? `Published ${fmt(p.publishedAt)}` : `Draft · edited ${fmt(p.updatedAt)}`} · {p.readingMinutes} min · {p.views || 0} views
                </Typography>
              </Box>
              {p.generatedBy === "agent" && <Chip size="small" variant="outlined" label="AI-written" />}
              <Chip size="small" label={p.status === "published" ? "Published" : "Draft"} color={p.status === "published" ? "success" : "default"} />
              <Button size="small" disabled={busyId === p._id} onClick={() => toggle(p)} sx={{ textTransform: "none" }}>
                {p.status === "published" ? "Unpublish" : "Publish"}
              </Button>
              {p.status === "published" && (
                <Tooltip title="View on site"><IconButton size="small" component={Link} to={`/blog/${p.slug}`} target="_blank"><FiExternalLink size={16} /></IconButton></Tooltip>
              )}
              <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/admin/blog/${p._id}`)}><FiEdit2 size={16} /></IconButton></Tooltip>
              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => remove(p)}><FiTrash2 size={16} /></IconButton></Tooltip>
            </Box>
          ))}
        </Paper>
      )}
    </AdminLayout>
  );
}
