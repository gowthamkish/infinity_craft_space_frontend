import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { 
  FiX, 
  FiChevronLeft, 
  FiChevronRight, 
  FiZoomIn, 
  FiZoomOut, 
  FiMaximize2,
  FiRotateCw,
  FiDownload,
  FiShare2
} from 'react-icons/fi';

const ImageCarouselModal = ({ 
  show, 
  onHide, 
  images = [], 
  productName = "Product Images",
  initialIndex = 0 
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showImageInfo, setShowImageInfo] = useState(false);
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Reset active index when modal opens with different initial index
  useEffect(() => {
    if (show) {
      setActiveIndex(initialIndex);
      setZoomLevel(1);
      setRotation(0);
      setDragOffset({ x: 0, y: 0 });
      setIsZoomed(false);
      setIsFullscreen(false);
    }
  }, [show, initialIndex]);

  // Reset image transform state
  const resetImageTransform = useCallback(() => {
    setZoomLevel(1);
    setRotation(0);
    setDragOffset({ x: 0, y: 0 });
    setIsZoomed(false);
  }, []);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
    resetImageTransform();
  }, [activeIndex, images.length, resetImageTransform]);

  const handleNext = useCallback(() => {
    const newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(newIndex);
    resetImageTransform();
  }, [activeIndex, images.length, resetImageTransform]);

  const handleThumbnailClick = useCallback((index) => {
    setActiveIndex(index);
    resetImageTransform();
  }, [resetImageTransform]);

  // Zoom functionality
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.5, 5));
    setIsZoomed(true);
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const newLevel = Math.max(prev - 0.5, 1);
      if (newLevel === 1) {
        setIsZoomed(false);
        setDragOffset({ x: 0, y: 0 });
      }
      return newLevel;
    });
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
    setIsZoomed(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Rotation
  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Image download
  const handleDownload = useCallback(async () => {
    try {
      const image = images[activeIndex];
      if (image?.url) {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = image.originalName || `${productName}-image-${activeIndex + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [images, activeIndex, productName]);

  // Share functionality
  const handleShare = useCallback(async () => {
    const image = images[activeIndex];
    if (navigator.share && image?.url) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out this image from ${productName}`,
          url: image.url,
        });
      } catch (error) {
        // Fallback to copy to clipboard
        navigator.clipboard?.writeText(image.url);
        alert('Image URL copied to clipboard!');
      }
    } else if (image?.url) {
      navigator.clipboard?.writeText(image.url);
      alert('Image URL copied to clipboard!');
    }
  }, [images, activeIndex, productName]);

  // Mouse drag functionality for zoomed images
  const handleMouseDown = useCallback((e) => {
    if (isZoomed && zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
      e.preventDefault();
    }
  }, [isZoomed, zoomLevel, dragOffset]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && isZoomed) {
      setDragOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, isZoomed, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e) => {
    if (isZoomed && zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - dragOffset.x,
        y: touch.clientY - dragOffset.y
      });
    }
  }, [isZoomed, zoomLevel, dragOffset]);

  const handleTouchMove = useCallback((e) => {
    if (isDragging && isZoomed && e.touches.length === 1) {
      const touch = e.touches[0];
      setDragOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
      e.preventDefault();
    }
  }, [isDragging, isZoomed, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Double click to zoom
  const handleDoubleClick = useCallback((e) => {
    if (isZoomed) {
      handleZoomReset();
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * -200;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -200;
      
      setZoomLevel(2.5);
      setIsZoomed(true);
      setDragOffset({ x, y });
    }
  }, [isZoomed, handleZoomReset]);

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!show) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          onHide();
          break;
        case '+':
        case '=':
          handleZoomIn();
          e.preventDefault();
          break;
        case '-':
          handleZoomOut();
          e.preventDefault();
          break;
        case '0':
          handleZoomReset();
          e.preventDefault();
          break;
        case 'r':
        case 'R':
          handleRotate();
          e.preventDefault();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          e.preventDefault();
          break;
        case 'i':
        case 'I':
          setShowImageInfo(prev => !prev);
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, handlePrevious, handleNext, handleZoomIn, handleZoomOut, handleZoomReset, handleRotate, toggleFullscreen, onHide]);

  // Mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  if (!images || images.length === 0) return null;

  const currentImage = images[activeIndex];

  return (
    <>
      <style jsx>{`
        .image-modal-fullscreen {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          margin: 0 !important;
          max-width: none !important;
          z-index: 9999 !important;
        }
        
        .image-viewer-container {
          background: #000;
          position: relative;
          overflow: hidden;
        }
        
        .image-toolbar {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 25px;
          padding: 8px;
          margin: 12px;
        }
        
        .thumbnail-strip {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .thumbnail-item {
          position: relative;
          cursor: pointer;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }
        
        .thumbnail-item:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .thumbnail-item.active {
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        
        .zoom-indicator {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 14px;
          backdrop-filter: blur(10px);
        }
        
        .image-info-panel {
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          height: 100%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-left: 1px solid rgba(0, 0, 0, 0.1);
          transform: translateX(100%);
          transition: transform 0.3s ease;
          padding: 20px;
          overflow-y: auto;
        }
        
        .image-info-panel.show {
          transform: translateX(0);
        }
      `}</style>

      <Modal 
        show={show} 
        onHide={onHide} 
        size={isFullscreen ? undefined : "xl"}
        centered={!isFullscreen}
        className={`image-carousel-modal ${isFullscreen ? 'image-modal-fullscreen' : ''}`}
        backdrop={!isFullscreen}
        dialogClassName={isFullscreen ? 'w-100 h-100 m-0 mw-100' : ''}
      >
        {/* Header - Only show when not fullscreen */}
        {!isFullscreen && (
          <Modal.Header className="border-0 pb-2" style={{ background: '#f8f9fa',display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Modal.Title className="h5 text-dark d-flex align-items-center">
              <span className="me-2">{productName}</span>
              <small className="badge bg-secondary">
                {activeIndex + 1} of {images.length}
              </small>
            </Modal.Title>
            <Button 
              variant="outline-secondary"
              size="sm"
              onClick={onHide}
              style={{
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'rgba(0,0,0,0.05)'
              }}
            >
              <FiX size={16} />
            </Button>
          </Modal.Header>
        )}

        <Modal.Body className="p-0">
          <div className="image-viewer-container position-relative">
            {/* Top Toolbar */}
            <div className="position-absolute top-0 start-50 translate-middle-x image-toolbar d-flex align-items-center gap-2" style={{ zIndex: 10 }}>
              {isFullscreen && (
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={onHide}
                  className="d-flex align-items-center justify-content-center"
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  title="Close (ESC)"
                >
                  <FiX size={16} />
                </Button>
              )}
              
              <Button
                variant="outline-light"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                title="Zoom Out (-)"
              >
                <FiZoomOut size={14} />
              </Button>
              
              <Button
                variant="outline-light"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 5}
                className="d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                title="Zoom In (+)"
              >
                <FiZoomIn size={14} />
              </Button>
              
              <Button
                variant="outline-light"
                size="sm"
                onClick={handleRotate}
                className="d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                title="Rotate (R)"
              >
                <FiRotateCw size={14} />
              </Button>
              
              <Button
                variant="outline-light"
                size="sm"
                onClick={toggleFullscreen}
                className="d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                title="Fullscreen (F)"
              >
                <FiMaximize2 size={14} />
              </Button>
              
              <Button
                variant="outline-light"
                size="sm"
                onClick={handleDownload}
                className="d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                title="Download Image"
              >
                <FiDownload size={14} />
              </Button>
              
              <Button
                variant="outline-light"
                size="sm"
                onClick={handleShare}
                className="d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                title="Share Image"
              >
                <FiShare2 size={14} />
              </Button>
            </div>

            {/* Main Image Display */}
            <div 
              ref={containerRef}
              className="d-flex align-items-center justify-content-center position-relative"
              style={{
                height: isFullscreen ? '100vh' : '75vh',
                background: '#000',
                cursor: isZoomed && zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                overflow: 'hidden'
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <img
                ref={imageRef}
                src={currentImage?.url}
                alt={`Product - ${activeIndex + 1}`}
                style={{
                  maxWidth: zoomLevel === 1 ? '100%' : 'none',
                  maxHeight: zoomLevel === 1 ? '100%' : 'none',
                  width: zoomLevel > 1 ? `${zoomLevel * 100}%` : 'auto',
                  height: zoomLevel > 1 ? `${zoomLevel * 100}%` : 'auto',
                  objectFit: 'contain',
                  transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
                onDoubleClick={handleDoubleClick}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
                }}
                draggable={false}
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="dark"
                    className="position-absolute start-0 ms-3"
                    style={{
                      borderRadius: '50%',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: 'none',
                      backdropFilter: 'blur(10px)',
                      opacity: 0.8,
                      transition: 'all 0.2s ease'
                    }}
                    onClick={handlePrevious}
                    onMouseEnter={(e) => e.target.closest('button').style.opacity = '1'}
                    onMouseLeave={(e) => e.target.closest('button').style.opacity = '0.8'}
                    title="Previous Image (←)"
                  >
                    <FiChevronLeft size={24} color="white" />
                  </Button>

                  <Button
                    variant="dark"
                    className="position-absolute end-0 me-3"
                    style={{
                      borderRadius: '50%',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: 'none',
                      backdropFilter: 'blur(10px)',
                      opacity: 0.8,
                      transition: 'all 0.2s ease'
                    }}
                    onClick={handleNext}
                    onMouseEnter={(e) => e.target.closest('button').style.opacity = '1'}
                    onMouseLeave={(e) => e.target.closest('button').style.opacity = '0.8'}
                    title="Next Image (→)"
                  >
                    <FiChevronRight size={24} color="white" />
                  </Button>
                </>
              )}

              {/* Zoom Indicator */}
              {isZoomed && (
                <div className="zoom-indicator">
                  {Math.round(zoomLevel * 100)}% • Double-click to reset
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && !isFullscreen && (
              <div className="thumbnail-strip p-3">
                <div className="d-flex gap-3 justify-content-center align-items-center" style={{ overflowX: 'auto', maxWidth: '100%' }}>
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`thumbnail-item ${index === activeIndex ? 'active' : ''}`}
                      style={{
                        width: '80px',
                        height: '80px',
                        flexShrink: 0
                      }}
                      onClick={() => handleThumbnailClick(index)}
                      title={`View image ${index + 1}`}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/80x80?text=?";
                        }}
                      />
                      {index === activeIndex && (
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 123, 255, 0.2)' }}>
                          <div style={{ width: '12px', height: '12px', background: '#007bff', borderRadius: '50%', border: '2px solid white' }}></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Info Panel */}
            <div className={`image-info-panel ${showImageInfo ? 'show' : ''}`}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 fw-bold">Image Details</h6>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowImageInfo(false)}
                  style={{ width: '24px', height: '24px', borderRadius: '50%', padding: 0 }}
                >
                  <FiX size={12} />
                </Button>
              </div>
              
              <div className="mb-3">
                <small className="text-muted d-block">Image {activeIndex + 1} of {images.length}</small>
                <h6 className="mt-1">{productName}</h6>
              </div>
              
              {currentImage?.originalName && (
                <div className="mb-3">
                  <small className="text-muted d-block">Filename</small>
                  <div className="small">{currentImage.originalName}</div>
                </div>
              )}
              
              <div className="mb-3">
                <small className="text-muted d-block">Zoom Level</small>
                <div className="small">{Math.round(zoomLevel * 100)}%</div>
              </div>
              
              {rotation !== 0 && (
                <div className="mb-3">
                  <small className="text-muted d-block">Rotation</small>
                  <div className="small">{rotation}°</div>
                </div>
              )}
              
              <div className="border-top pt-3 mt-3">
                <small className="text-muted d-block mb-2">Keyboard Shortcuts</small>
                <div className="small">
                  <div>← → Navigate images</div>
                  <div>+ - Zoom in/out</div>
                  <div>0 Reset zoom</div>
                  <div>R Rotate image</div>
                  <div>F Toggle fullscreen</div>
                  <div>I Toggle this panel</div>
                  <div>ESC Close viewer</div>
                </div>
              </div>
            </div>

            {/* Bottom Info Bar */}
            {!isFullscreen && (
              <div className="position-absolute bottom-0 start-0 w-100 p-3 text-center" style={{ background: 'rgba(0, 0, 0, 0.5)', color: 'white' }}>
                <small>
                  Double-click to zoom • Use keyboard shortcuts for quick navigation • 
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 ms-1 text-white" 
                    style={{ textDecoration: 'underline', fontSize: 'inherit' }}
                    onClick={() => setShowImageInfo(true)}
                  >
                    View shortcuts (I)
                  </Button>
                </small>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ImageCarouselModal;