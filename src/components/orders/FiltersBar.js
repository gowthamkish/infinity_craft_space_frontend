import React from "react";
import { Row, Col } from "react-bootstrap";
import { FiSearch, FiFilter } from "react-icons/fi";

const FiltersBar = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="filters-bar mb-4">
      <div className="card border-0 shadow-sm rounded-16">
        <div className="card-body p-3">
          <Row className="g-3">
            <Col md={6}>
              <div className="position-relative">
                <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search orders by number, customer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    borderRadius: "12px",
                    border: "2px solid #e9ecef",
                    fontSize: "0.95rem",
                    padding: "10px 10px 10px 2.2rem",
                  }}
                />
              </div>
            </Col>
            <Col md={6}>
              <div className="position-relative">
                <FiFilter className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <select
                  className="form-control ps-5"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    borderRadius: "12px",
                    border: "2px solid #e9ecef",
                    fontSize: "0.95rem",
                    padding: "10px 10px 10px 2.2rem",
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
