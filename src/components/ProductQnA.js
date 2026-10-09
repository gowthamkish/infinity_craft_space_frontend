import { useState, useContext } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MuiAlert from "@mui/material/Alert";
import { DotsLoader } from "./Loader";
import { FiThumbsUp, FiMessageSquare, FiCheckCircle } from "react-icons/fi";
import {
  useGetQnAQuery,
  usePostQuestionMutation,
  usePostAnswerMutation,
  useMarkQnaHelpfulMutation,
} from "../services/engagementApi";
import { errMsg } from "../app/baseApi";
import { ToastContext } from "../context/ToastContext";
import { SkeletonListLoader } from "./SkeletonLoaders";
import "../styles/designPatterns.css";

/**
 * ProductQnA Component
 * Displays Q&A section for a product with ability to ask questions
 */
const EMPTY_LIST = [];

const ProductQnA = ({ productId, isAuthenticated, userName }) => {
  const [question, setQuestion] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const { addSuccess, addError } = useContext(ToastContext);

  const ITEMS_PER_PAGE = 10;

  // Cached per product + sort + page; posting a question invalidates the product's "Qna" tag,
  // which refetches the list on its own. "Helpful" is optimistic.
  const { data: qnaData, isFetching: loading } = useGetQnAQuery({
    productId,
    page,
    limit: ITEMS_PER_PAGE,
    sort: sortBy,
  });
  const qnaList = qnaData?.success ? qnaData.data : EMPTY_LIST;
  const totalPages = qnaData?.pagination?.pages || 1;
  const [postQuestion, { isLoading: asking }] = usePostQuestionMutation();
  const [markQnaHelpful] = useMarkQnaHelpfulMutation();

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

    try {
      const result = await postQuestion({ productId, question }).unwrap();
      if (result.success === false) {
        addError(result.error || "Failed to post question", "Error");
        return;
      }
      addSuccess("Question posted successfully!", "Question Added");
      setQuestion("");
      setPage(1);
    } catch (err) {
      console.error("Error posting question:", err);
      addError(errMsg(err, "An error occurred"), "Error");
    }
  };

  const handleMarkHelpful = async (qnaId) => {
    try {
      await markQnaHelpful(qnaId).unwrap();
    } catch (err) {
      console.error("Error marking helpful:", err); // optimistic increment is rolled back
    }
  };

  return (
    <section
      style={{
        paddingTop: "var(--spacing-3xl)",
        paddingBottom: "var(--spacing-3xl)",
      }}
    >
      <Box>
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
            <form onSubmit={handlePostQuestion}>
              <div style={{ marginBottom: "1rem" }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="What would you like to know about this product? (minimum 10 characters)"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={asking}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "var(--radius-md)" } }}
                />
              </div>
              <button
                type="submit"
                className="ics-btn ics-btn--primary"
                disabled={asking || question.length < 10}
              >
                {asking ? (
                  <>
                    <DotsLoader size="sm" />
                    Posting…
                  </>
                ) : (
                  <>
                    <FiMessageSquare size={16} style={{ marginRight: 8 }} />
                    Post Question
                  </>
                )}
              </button>
            </form>
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
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            style={{ maxWidth: "200px", borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-primary)", padding: "0.5rem 0.75rem",
              fontSize: "0.875rem", cursor: "pointer" }}
          >
            <option value="latest">Latest</option>
            <option value="helpful">Most Helpful</option>
            <option value="pinned">Pinned</option>
          </select>
        </div>

        {/* Q&A List */}
        {loading ? (
          <SkeletonListLoader items={3} />
        ) : qnaList.length === 0 ? (
          <MuiAlert severity="info" sx={{ borderRadius: "var(--radius-lg)" }}>
            No questions yet. Be the first to ask!
          </MuiAlert>
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
            <button
              className="ics-btn ics-btn--outline ics-btn--sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={{ padding: "var(--spacing-md)", fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="ics-btn ics-btn--outline ics-btn--sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </Box>
    </section>
  );
};

// Individual Q&A Item Component
const QnAItem = ({ qna, onMarkHelpful }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [newAnswer, setNewAnswer] = useState("");
  const [postAnswer, { isLoading: posting }] = usePostAnswerMutation();

  const handlePostAnswer = async (e) => {
    e.preventDefault();

    if (!newAnswer.trim()) {
      return;
    }

    try {
      await postAnswer({ qnaId: qna._id, content: newAnswer }).unwrap();
      setNewAnswer(""); // the Q&A list refreshes itself (tag invalidation)
    } catch (err) {
      console.error("Error posting answer:", err);
    }
  };

  return (
    <div
      style={{
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
