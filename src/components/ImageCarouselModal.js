import React, { useState } from 'react';
import { Modal, Carousel, Button } from 'react-bootstrap';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ImageCarouselModal = ({ 
  show, 
  onHide, 
  images = [], 
  productName = "Product Images",
  initialIndex = 0 
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Reset active index when modal opens with different initial index
  React.useEffect(() => {
    if (show) {
      setActiveIndex(initialIndex);
    }
  }, [show, initialIndex]);

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  const handlePrevious = () => {
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(newIndex);
  };

  // Handle keyboard navigation
  React.useEffect(() => {
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
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, activeIndex, images.length]);

  if (!images || images.length === 0) return null;

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      centered
      className="image-carousel-modal"
    >
      <Modal.Header className="border-0 pb-3" style={{display: 'flex', justifyContent: 'space-between' }}>
        <Modal.Title className="h5 text-dark">
          {productName}
          <small className="text-muted ms-2">
            ({activeIndex + 1} of {images.length})
          </small>
        </Modal.Title>
        <Button 
          variant="outline-secondary"
          size="sm"
          onClick={onHide}
          className="btn-close-custom"
          style={{
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'rgba(0,0,0,0.1)'
          }}
        >
          <FiX size={18} />
        </Button>
      </Modal.Header>

      <Modal.Body className="p-0">
        <div className="position-relative">
          {/* Main Image Display */}
          <div 
            className="d-flex align-items-center justify-content-center"
            style={{
              height: '70vh',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              position: 'relative'
            }}
          >
            <img
              src={images[activeIndex]?.url}
              alt={`${productName} - Image ${activeIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x400?text=Image+Not+Found";
              }}
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="light"
                  className="position-absolute start-0 ms-3"
                  style={{
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                  onClick={handlePrevious}
                >
                  <FiChevronLeft size={20} />
                </Button>

                <Button
                  variant="light"
                  className="position-absolute end-0 me-3"
                  style={{
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                  onClick={handleNext}
                >
                  <FiChevronRight size={20} />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div 
              className="p-3 bg-light border-top"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            >
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`border rounded cursor-pointer ${
                      index === activeIndex ? 'border-primary border-3' : 'border-2'
                    }`}
                    style={{
                      width: '60px',
                      height: '60px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: index === activeIndex ? 1 : 0.7
                    }}
                    onClick={() => setActiveIndex(index)}
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
                        e.target.src = "https://via.placeholder.com/60x60?text=?";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Info */}
          <div className="px-3 pb-3">
            <div className="text-center text-muted small">
              {images[activeIndex]?.originalName && (
                <div>📁 {images[activeIndex].originalName}</div>
              )}
              <div className="mt-1">
                Use ← → arrow keys to navigate • ESC to close
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ImageCarouselModal;