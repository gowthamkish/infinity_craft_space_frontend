import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./pagination.css";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}) => {
  const pageNumbers = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  // Ensure we always show 5 page numbers if available
  if (endPage - startPage < 4) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + 4);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 4);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="adm-pagination-wrapper">
      <div className="adm-pagination-info">
        <span className="adm-pagination-text">
          Showing <strong>{startIndex}</strong> to <strong>{endIndex}</strong>{" "}
          of <strong>{totalItems}</strong> orders
        </span>
        <div className="adm-pagination-per-page">
          <label htmlFor="itemsPerPage" className="adm-pagination-label">
            Items per page:
          </label>
          <select
            id="itemsPerPage"
            className="adm-pagination-select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="adm-pagination-controls">
        <button
          className="adm-pagination-btn adm-pagination-btn-prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous page"
        >
          <FiChevronLeft size={18} />
          <span className="adm-pagination-btn-text">Prev</span>
        </button>

        <div className="adm-pagination-pages">
          {startPage > 1 && (
            <>
              <button
                className="adm-pagination-page-btn"
                onClick={() => onPageChange(1)}
                title="Go to page 1"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="adm-pagination-ellipsis">...</span>
              )}
            </>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              className={`adm-pagination-page-btn ${
                page === currentPage ? "active" : ""
              }`}
              onClick={() => onPageChange(page)}
              title={`Go to page ${page}`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="adm-pagination-ellipsis">...</span>
              )}
              <button
                className="adm-pagination-page-btn"
                onClick={() => onPageChange(totalPages)}
                title={`Go to page ${totalPages}`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          className="adm-pagination-btn adm-pagination-btn-next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next page"
        >
          <span className="adm-pagination-btn-text">Next</span>
          <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
