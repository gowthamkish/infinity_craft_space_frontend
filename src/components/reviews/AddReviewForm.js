import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { FiCamera, FiX, FiCheck } from "react-icons/fi";
import {
  createReview,
  clearReviewError,
  clearSuccessMessage,
} from "../../features/reviewsSlice";
import { StarRatingInput } from "./StarRating";
import "./reviews.css";

const AddReviewForm = ({ productId, productName, onReviewSubmitted }) => {
  const dispatch = useDispatch();
  const { createLoading, error, successMessage } = useSelector(
    (state) => state.reviews,
  );
  const isAuthenticated = useSelector((state) => !!state.auth.token);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [validationError, setValidationError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const handleImageSelect = (files) => {
    const validFiles = [];
    const newPreviews = [];
    const maxImages = 5;
    const remainingSlots = maxImages - images.length;

    if (remainingSlots <= 0) {
      setValidationError("Maximum 5 images allowed");
      return;
    }

    Array.from(files)
      .slice(0, remainingSlots)
      .forEach((file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          setValidationError("Only image files are allowed");
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setValidationError(`${file.name} is too large. Maximum size is 5MB`);
          return;
        }

        validFiles.push(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({
            id: Date.now() + Math.random(),
            file: file,
            preview: reader.result,
            name: file.name,
          });

          if (newPreviews.length === validFiles.length) {
            setImages((prev) => [...prev, ...validFiles]);
            setImagePreviews((prev) => [...prev, ...newPreviews]);
            setValidationError("");
          }
        };
        reader.readAsDataURL(file);
      });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageSelect(e.dataTransfer.files);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    dispatch(clearReviewError());

    // Validation
    if (rating === 0) {
      setValidationError("Please select a rating");
      return;
    }

    if (!title.trim()) {
      setValidationError("Please enter a review title");
      return;
    }

    if (title.trim().length < 5) {
      setValidationError("Title must be at least 5 characters");
      return;
    }

    if (!comment.trim()) {
      setValidationError("Please enter your review");
      return;
    }

    if (comment.trim().length < 20) {
      setValidationError("Review must be at least 20 characters");
      return;
    }

    // Prepare images as base64
    const imageData = imagePreviews.map((preview) => ({
      base64: preview.preview,
      name: preview.name,
    }));

    try {
      await dispatch(
        createReview({
          productId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
          images: imageData,
        }),
      ).unwrap();

      // Reset form
      setRating(0);
      setTitle("");
      setComment("");
      setImages([]);
      setImagePreviews([]);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
    } catch (err) {
      // Error is handled by Redux
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert variant="info" className="text-center">
        <strong>Please login to write a review</strong>
        <p className="mb-0 mt-2">
          Share your experience with this product after logging in.
        </p>
      </Alert>
    );
  }

  return (
    <div className="add-review-form">
      <h5
        style={{
          fontWeight: "600",
          marginBottom: "1.5rem",
          color: "var(--text-primary)",
        }}
      >
        Write a Review for {productName}
      </h5>

      {successMessage && (
        <Alert variant="success" className="d-flex align-items-center gap-2">
          <FiCheck size={18} />
          {successMessage}
        </Alert>
      )}

      {(error || validationError) && (
        <Alert
          variant="danger"
          onClose={() => {
            setValidationError("");
            dispatch(clearReviewError());
          }}
          dismissible
        >
          {validationError || error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="form-section">
          <label className="form-section-label">Your Rating *</label>
          <StarRatingInput rating={rating} onRatingChange={setRating} />
          {rating > 0 && (
            <small className="text-muted d-block mt-1">
              {rating === 5 && "Excellent!"}
              {rating === 4 && "Very Good"}
              {rating === 3 && "Good"}
              {rating === 2 && "Fair"}
              {rating === 1 && "Poor"}
            </small>
          )}
        </div>

        {/* Title */}
        <div className="form-section">
          <label className="form-section-label">Review Title *</label>
          <Form.Control
            type="text"
            placeholder="Summarize your experience (e.g., 'Beautiful bangles, perfect for wedding!')"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            style={{ borderRadius: "8px" }}
          />
          <small className="text-muted">{title.length}/100 characters</small>
        </div>

        {/* Comment */}
        <div className="form-section">
          <label className="form-section-label">Your Review *</label>
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Share your experience with this product. What did you like? How is the quality? Would you recommend it to others?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            style={{ borderRadius: "8px", resize: "none" }}
          />
          <small className="text-muted">{comment.length}/1000 characters</small>
        </div>

        {/* Image Upload */}
        <div className="form-section">
          <label className="form-section-label">
            Add Photos (Optional)
            <small className="text-muted ms-2">
              Share how you're using the product!
            </small>
          </label>

          <div
            className={`image-upload-area ${dragOver ? "dragover" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FiCamera className="upload-icon" />
            <div className="upload-text">Click to upload or drag and drop</div>
            <div className="upload-hint">
              JPG, PNG or GIF • Max 5MB each • Up to 5 images
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleImageSelect(e.target.files)}
            accept="image/*"
            multiple
            style={{ display: "none" }}
          />

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="image-previews">
              {imagePreviews.map((preview, index) => (
                <div key={preview.id} className="image-preview-item">
                  <img
                    src={preview.preview}
                    alt={`Preview ${index + 1}`}
                    className="image-preview"
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={createLoading}
          style={{
            width: "100%",
            borderRadius: "12px",
            fontWeight: "600",
            padding: "0.875rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
          }}
        >
          {createLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Submitting Review...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </Form>
    </div>
  );
};

export default AddReviewForm;
