import React, { useState, useEffect, useContext } from "react";
import { Container, Form, Button, Spinner, Alert } from "react-bootstrap";
import { FiThumbsUp, FiMessageSquare, FiCheckCircle } from "react-icons/fi";
import { qnaAPI } from "../api/features";
import { ToastContext } from "../context/ToastContext";
import { SkeletonListLoader } from "./SkeletonLoaders";
import "../styles/designPatterns.css";

/**
 * ProductQnA Component
 * Displays Q&A section for a product with ability to ask questions
 */
const ProductQnA = ({ productId, isAuthenticated, userName }) => {
  const [qnaList, setQnaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [question, setQuestion] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addSuccess, addError } = useContext(ToastContext);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchQnA();
  }, [productId, sortBy, page]);

  const fetchQnA = async () => {
    setLoading(true);
    try {
      const result = await qnaAPI.getByProduct(
        productId,
        page,
        ITEMS_PER_PAGE,
        sortBy,
      );
      if (result.success) {
        setQnaList(result.data);
        setTotalPages(result.pagination?.pages || 1);
      }
    } catch (err) {
      console.error("Error fetching Q&A:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostQuestion = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addError("Please login to ask a question", "Login Required");
      return;
    }

    if (!question.trim() || question.length < 10) {
      addError("Question must be at least 10 characters", "Too Short");
      return;
    }

    setAsking(true);
    try {
      const result = await qnaAPI.postQuestion(productId, question);
      if (result.success) {
        addSuccess("Question posted successfully!", "Question Added");
        setQuestion("");
        setPage(1);
        await fetchQnA();
      } else {
        addError(result.error || "Failed to post question", "Error");
      }
    } catch (err) {
      console.error("Error posting question:", err);
      addError("An error occurred", "Error");
    } finally {
      setAsking(false);
    }
  };

  const handleMarkHelpful = async (qnaId) => {
    try {
      const result = await qnaAPI.markHelpful(qnaId);
      if (result.success) {
        // Update the QnA item
        setQnaList((prev) =>
          prev.map((item) =>
            item._id === qnaId ? { ...item, helpful: item.helpful + 1 } : item,
          ),
        );
      }
    } catch (err) {
      console.error("Error marking helpful:", err);
    }
  };

  return (
    <section
      style={{
        paddingTop: "var(--spacing-3xl)",
        paddingBottom: "var(--spacing-3xl)",
      }}
    >
      <Container>
        <div style={{ marginBottom: "var(--spacing-xl)" }}>
          <h2
            style={{
              marginBottom: "var(--spacing-md)",
              fontWeight: 700,
              fontSize: "var(--font-size-2xl)",
            }}
          >
            Questions & Answers
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 0 }}>
            Ask a question about this product. Get answers from other customers
            or our team.
          </p>
        </div>

        {/* Ask Question Form */}
        {isAuthenticated && (
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              padding: "var(--spacing-lg)",
              borderRadius: "var(--radius-lg)",
              marginBottom: "var(--spacing-xl)",
            }}
          >
            <h4 style={{ marginBottom: "var(--spacing-md)", fontWeight: 600 }}>
              Ask a Question
            </h4>
            <Form onSubmit={handlePostQuestion}>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="What would you like to know about this product? (minimum 10 characters)"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={asking}
                  style={{
                    borderRadius: "var(--radius-md)",
                    borderColor: "var(--border-primary)",
                    padding: "var(--spacing-md)",
                  }}
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                disabled={asking || question.length < 10}
                style={{
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-primary)",
                  border: "none",
                  fontWeight: 600,
                  padding: "var(--spacing-sm) var(--spacing-lg)",
                }}
              >
                {asking ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <FiMessageSquare size={16} className="me-2" />
                    Post Question
                  </>
                )}
              </Button>
            </Form>
          </div>
        )}

        {/* Sort Options */}
        <div
          style={{
            marginBottom: "var(--spacing-lg)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ marginBottom: 0, color: "var(--text-secondary)" }}>
            Showing {qnaList.length} of {totalPages * ITEMS_PER_PAGE} questions
          </p>
          <Form.Select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            style={{
              maxWidth: "200px",
              borderRadius: "var(--radius-md)",
              borderColor: "var(--border-primary)",
            }}
          >
            <option value="latest">Latest</option>
            <option value="helpful">Most Helpful</option>
            <option value="pinned">Pinned</option>
          </Form.Select>
        </div>

        {/* Q&A List */}
        {loading ? (
          <SkeletonListLoader items={3} />
        ) : qnaList.length === 0 ? (
          <Alert variant="info" style={{ borderRadius: "var(--radius-lg)" }}>
            No questions yet. Be the first to ask!
          </Alert>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-lg)",
            }}
          >
            {qnaList.map((qna) => (
              <QnAItem
                key={qna._id}
                qna={qna}
                onMarkHelpful={handleMarkHelpful}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              marginTop: "var(--spacing-xl)",
              display: "flex",
              justifyContent: "center",
              gap: "var(--spacing-md)",
            }}
          >
            <Button
              variant="outline-primary"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span style={{ padding: "var(--spacing-md)", fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline-primary"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
};

// Individual Q&A Item Component
const QnAItem = ({ qna, onMarkHelpful }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [newAnswer, setNewAnswer] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePostAnswer = async (e) => {
    e.preventDefault();

    if (!newAnswer.trim()) {
      return;
    }

    setPosting(true);
    try {
      const result = await qnaAPI.postAnswer(qna._id, newAnswer);
      if (result.success) {
        setNewAnswer("");
        // Refresh Q&A list from parent
      }
    } catch (err) {
      console.error("Error posting answer:", err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div
      Style={{
        padding: "var(--spacing-lg)",
        backgroundColor: "var(--bg-primary)",
        border: "1px solid var(--border-primary)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      {/* Question */}
      <div style={{ marginBottom: "var(--spacing-md)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "var(--spacing-md)",
            marginBottom: "var(--spacing-sm)",
          }}
        >
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: "var(--font-size-base)",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {qna.question}
            </p>
            <p
              style={{
                margin: "var(--spacing-xs) 0 0 0",
                fontSize: "var(--font-size-xs)",
                color: "var(--text-tertiary)",
              }}
            >
              asked by {qna.userName} •{" "}
              {new Date(qna.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Helpful Button */}
        <div
          style={{
            display: "flex",
            gap: "var(--spacing-md)",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => onMarkHelpful(qna._id)}
            style={{
              background: "none",
              border: "1px solid var(--border-primary)",
              padding: "var(--spacing-xs) var(--spacing-sm)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--text-secondary)",
              fontSize: "var(--font-size-xs)",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "var(--primary-50)";
              e.target.style.color = "var(--color-primary)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "var(--text-secondary)";
            }}
          >
            <FiThumbsUp size={14} />
            Helpful ({qna.helpful})
          </button>
        </div>
      </div>

      {/* Answers */}
      {qna.answers && qna.answers.length > 0 && (
        <div
          style={{
            marginTop: "var(--spacing-lg)",
            borderTop: "1px solid var(--border-primary)",
            paddingTop: "var(--spacing-lg)",
          }}
        >
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "var(--color-primary)",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {showAnswers ? "▼" : "▶"} {qna.answers.length} Answer
            {qna.answers.length !== 1 ? "s" : ""}
          </button>

          {showAnswers && (
            <div
              style={{
                marginTop: "var(--spacing-md)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-md)",
              }}
            >
              {qna.answers.map((answer) => (
                <div
                  key={answer._id}
                  style={{
                    padding: "var(--spacing-md)",
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    borderLeft: answer.isSellerResponse
                      ? "3px solid var(--color-success)"
                      : "3px solid var(--neutral-300)",
                  }}
                >
                  {answer.isSellerResponse && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginBottom: "4px",
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-success)",
                        fontWeight: 600,
                      }}
                    >
                      <FiCheckCircle size={14} /> Seller Response
                    </div>
                  )}
                  <p
                    style={{
                      margin: 0,
                      marginBottom: "var(--spacing-xs)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {answer.content}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {answer.userName} •{" "}
                    {new Date(answer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductQnA;
