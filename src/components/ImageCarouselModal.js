import React, { useState, useRef, useCallback, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiRotateCw,
  FiDownload,
  FiShare2,
} from "react-icons/fi";

const BRAND_ROSE = "#8B1A4A";

const ImageCarouselModal = ({
  show,
  onHide,
  images = [],
  productName = "Product Images",
  initialIndex = 0,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const isZoomed = zoomLevel > 1;

  useEffect(() => {
    if (show) {
      setActiveIndex(initialIndex);
      setZoomLevel(1);
      setRotation(0);
      setDragOffset({ x: 0, y: 0 });
      setIsFullscreen(false);
    }
  }, [show, initialIndex]);

  const resetTransform = useCallback(() => {
    setZoomLevel(1);
    setRotation(0);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handlePrevious = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    resetTransform();
  }, [images.length, resetTransform]);

  const handleNext = useCallback(() => {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    resetTransform();
  }, [images.length, resetTransform]);

  const handleZoomIn = useCallback(() => setZoomLevel((z) => Math.min(z + 0.5, 5)), []);
  const handleZoomOut = useCallback(() => {
    setZoomLevel((z) => {
      const n = Math.max(z - 0.5, 1);
      if (n === 1) setDragOffset({ x: 0, y: 0 });
      return n;
    });
  }, []);

  const handleRotate = useCallback(() => setRotation((r) => (r + 90) % 360), []);
  const toggleFullscreen = useCallback(() => setIsFullscreen((f) => !f), []);

  const handleDownload = useCallback(async () => {
    const image = images[activeIndex];
    if (!image?.url) return;
    try {
      const res = await fetch(image.url);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = image.originalName || `${productName}-${activeIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {/* ignore */}
  }, [images, activeIndex, productName]);

  const handleShare = useCallback(async () => {
    const image = images[activeIndex];
    if (!image?.url) return;
    if (navigator.share) {
      try { await navigator.share({ title: productName, url: image.url }); } catch {/* ignore */}
    } else {
      navigator.clipboard?.writeText(image.url);
    }
  }, [images, activeIndex, productName]);

  /* ── Drag ── */
  const handleMouseDown = useCallback((e) => {
    if (!isZoomed) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    e.preventDefault();
  }, [isZoomed, dragOffset]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setDragOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  /* ── Keyboard ── */
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      switch (e.key) {
        case "ArrowLeft": handlePrevious(); break;
        case "ArrowRight": handleNext(); break;
        case "Escape": onHide(); break;
        case "+": case "=": handleZoomIn(); e.preventDefault(); break;
        case "-": handleZoomOut(); e.preventDefault(); break;
        case "0": resetTransform(); e.preventDefault(); break;
        case "r": case "R": handleRotate(); e.preventDefault(); break;
        case "f": case "F": toggleFullscreen(); e.preventDefault(); break;
        default: break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show, handlePrevious, handleNext, handleZoomIn, handleZoomOut, resetTransform, handleRotate, toggleFullscreen, onHide]);

  if (!images || images.length === 0) return null;

  const currentImage = images[activeIndex];

  const toolbarBtnSx = {
    color: "rgba(255,255,255,0.9)",
    bgcolor: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 1.5,
    p: 0.75,
    width: 36,
    height: 36,
    "&:hover": { bgcolor: "rgba(255,255,255,0.22)", color: "#fff" },
    "&:disabled": { opacity: 0.35, color: "rgba(255,255,255,0.5)" },
    transition: "all 0.15s ease",
  };

  return (
    <Dialog
      open={show}
      onClose={onHide}
      maxWidth={isFullscreen ? false : "md"}
      fullWidth={!isFullscreen}
      fullScreen={isFullscreen}
      PaperProps={{
        sx: {
          borderRadius: isFullscreen ? 0 : 3,
          overflow: "hidden",
          bgcolor: "#1A0A12",
          maxHeight: isFullscreen ? "100vh" : "92vh",
          m: isFullscreen ? 0 : { xs: 1, sm: 2 },
        },
      }}
    >
      {/* ── Dialog Title / Header ── */}
      <DialogTitle
        sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: "#2D0B1F",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#fff", lineHeight: 1.2 }}>
            {productName}
          </Typography>
          <Chip
            label={`${activeIndex + 1} of ${images.length}`}
            size="small"
            sx={{
              bgcolor: "rgba(201,168,76,0.2)",
              color: "#C9A84C",
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 22,
            }}
          />
        </Stack>

        {/* Toolbar icons */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title="Zoom out (−)">
            <span>
              <IconButton sx={toolbarBtnSx} onClick={handleZoomOut} disabled={zoomLevel <= 1} size="small">
                <FiZoomOut size={15} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Zoom in (+)">
            <span>
              <IconButton sx={toolbarBtnSx} onClick={handleZoomIn} disabled={zoomLevel >= 5} size="small">
                <FiZoomIn size={15} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Rotate (R)">
            <IconButton sx={toolbarBtnSx} onClick={handleRotate} size="small">
              <FiRotateCw size={15} />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen (F)"}>
            <IconButton sx={toolbarBtnSx} onClick={toggleFullscreen} size="small">
              <FiMaximize2 size={15} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton sx={toolbarBtnSx} onClick={handleDownload} size="small">
              <FiDownload size={15} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton sx={toolbarBtnSx} onClick={handleShare} size="small">
              <FiShare2 size={15} />
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={onHide}
            size="small"
            aria-label="Close"
            sx={{
              ...toolbarBtnSx,
              ml: 0.5,
              "&:hover": { bgcolor: "rgba(139,26,74,0.5)", color: "#fff" },
            }}
          >
            <FiX size={16} />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* ── Main Image Area ── */}
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#0D0508",
            minHeight: isFullscreen ? "calc(100vh - 64px)" : { xs: 260, sm: 380, md: 480 },
            overflow: "hidden",
            cursor: isZoomed ? (isDragging ? "grabbing" : "grab") : "zoom-in",
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={() => {
            if (isZoomed) { resetTransform(); } else { setZoomLevel(2.5); }
          }}
        >
          <Box
            ref={imageRef}
            component="img"
            src={currentImage?.url}
            alt={`${productName} — image ${activeIndex + 1}`}
            draggable={false}
            sx={{
              maxWidth: zoomLevel === 1 ? "100%" : "none",
              maxHeight: zoomLevel === 1 ? "100%" : "none",
              width: zoomLevel > 1 ? `${zoomLevel * 100}%` : "auto",
              height: zoomLevel > 1 ? `${zoomLevel * 100}%` : "auto",
              objectFit: "contain",
              transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
              transition: isDragging ? "none" : "transform 0.25s ease",
              userSelect: "none",
              pointerEvents: "none",
              display: "block",
            }}
            onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23222' width='200' height='150'/%3E%3Ctext fill='%23666' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage not found%3C/text%3E%3C/svg%3E"; }}
          />

          {/* Zoom badge */}
          {isZoomed && (
            <Box
              sx={{
                position: "absolute",
                bottom: 12,
                left: 12,
                bgcolor: "rgba(0,0,0,0.7)",
                color: "#C9A84C",
                px: 1.25,
                py: 0.5,
                borderRadius: 2,
                fontSize: "0.75rem",
                fontWeight: 700,
                backdropFilter: "blur(6px)",
              }}
            >
              {Math.round(zoomLevel * 100)}% · Double-click to reset
            </Box>
          )}

          {/* Prev / Next arrows */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                aria-label="Previous image"
                sx={{
                  position: "absolute",
                  left: 12,
                  bgcolor: "rgba(45,11,31,0.85)",
                  border: `1px solid ${BRAND_ROSE}`,
                  color: "#fff",
                  width: 44,
                  height: 44,
                  backdropFilter: "blur(8px)",
                  "&:hover": { bgcolor: BRAND_ROSE, transform: "scale(1.05)" },
                  transition: "all 0.15s ease",
                }}
              >
                <FiChevronLeft size={22} />
              </IconButton>
              <IconButton
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                aria-label="Next image"
                sx={{
                  position: "absolute",
                  right: 12,
                  bgcolor: "rgba(45,11,31,0.85)",
                  border: `1px solid ${BRAND_ROSE}`,
                  color: "#fff",
                  width: 44,
                  height: 44,
                  backdropFilter: "blur(8px)",
                  "&:hover": { bgcolor: BRAND_ROSE, transform: "scale(1.05)" },
                  transition: "all 0.15s ease",
                }}
              >
                <FiChevronRight size={22} />
              </IconButton>
            </>
          )}

          {/* Dot indicators (≤6 images) */}
          {images.length > 1 && images.length <= 6 && (
            <Stack
              direction="row"
              spacing={0.75}
              sx={{
                position: "absolute",
                bottom: 12,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {images.map((_, i) => (
                <Box
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i); resetTransform(); }}
                  sx={{
                    width: i === activeIndex ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: i === activeIndex ? BRAND_ROSE : "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* ── Thumbnail strip ── */}
        {images.length > 1 && !isFullscreen && (
          <Box
            sx={{
              bgcolor: "#2D0B1F",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              px: 2,
              py: 1.5,
              overflowX: "auto",
              "&::-webkit-scrollbar": { height: 4 },
              "&::-webkit-scrollbar-thumb": { bgcolor: BRAND_ROSE, borderRadius: 2 },
            }}
          >
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ minWidth: "fit-content" }}>
              {images.map((image, index) => (
                <Box
                  key={index}
                  onClick={() => { setActiveIndex(index); resetTransform(); }}
                  sx={{
                    width: 64,
                    height: 64,
                    flexShrink: 0,
                    borderRadius: 1.5,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: index === activeIndex ? BRAND_ROSE : "rgba(255,255,255,0.15)",
                    opacity: index === activeIndex ? 1 : 0.6,
                    transition: "all 0.15s ease",
                    "&:hover": { opacity: 1, borderColor: "rgba(201,168,76,0.6)" },
                  }}
                >
                  <Box
                    component="img"
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageCarouselModal;
