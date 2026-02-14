import { Check } from "react-feather";

export const CheckoutProgressBar = ({ steps, currentStep }) => (
  <div className="mb-4">
    <div className="d-flex justify-content-center align-items-center mb-5">
      <div
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          padding: "clamp(0.85rem, 2vw, 1.15rem) clamp(1.25rem, 4vw, 2.25rem)",
          borderRadius: "60px",
          color: "white",
          fontWeight: "700",
          fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.25)",
          textAlign: "center",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.75rem",
          border: "3px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <span style={{ fontSize: "1.25rem" }}>🔒</span>
        <span>
          Your payment information is secure and encrypted. Complete your order
          with confidence.
        </span>
      </div>
    </div>

    <div className="d-none d-md-flex justify-content-center align-items-center position-relative">
      {steps.map((step, index) => (
        <div key={step.number} className="d-flex align-items-center">
          <div className="text-center">
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                fontWeight: "800",
                color: "white",
                background:
                  currentStep >= step.number
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "#e5e7eb",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                zIndex: 2,
                boxShadow:
                  currentStep >= step.number
                    ? "0 8px 20px rgba(16, 185, 129, 0.35)"
                    : "0 2px 8px rgba(0, 0, 0, 0.08)",
                border:
                  currentStep >= step.number
                    ? "4px solid rgba(255, 255, 255, 0.3)"
                    : "3px solid #f3f4f6",
              }}
            >
              {currentStep > step.number ? (
                <Check size={28} strokeWidth={3} />
              ) : (
                step.number
              )}
            </div>
            <div
              style={{
                color: currentStep >= step.number ? "#10b981" : "#9ca3af",
                fontSize: "0.95rem",
                fontWeight: currentStep === step.number ? "800" : "600",
                marginTop: "0.75rem",
                letterSpacing: "-0.01em",
              }}
            >
              {step.title}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              style={{
                width: "120px",
                height: "4px",
                background:
                  currentStep > step.number
                    ? "linear-gradient(90deg, #10b981, #059669)"
                    : "#e5e7eb",
                margin: "0 1.5rem",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                top: "-18px",
                borderRadius: "2px",
              }}
            />
          )}
        </div>
      ))}
    </div>

    <div className="d-flex d-md-none justify-content-between align-items-center position-relative px-3">
      {steps.map((step, index) => (
        <div
          key={step.number}
          className="d-flex flex-column align-items-center flex-fill"
        >
          <div
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "white",
              background:
                currentStep >= step.number
                  ? "var(--secondary-color)"
                  : "#e5e7eb",
              transition: "all 0.3s ease",
              position: "relative",
              zIndex: 2,
            }}
          >
            {currentStep > step.number ? <Check size={14} /> : step.number}
          </div>
          <div
            style={{
              color:
                currentStep >= step.number
                  ? "var(--secondary-color)"
                  : "var(--text-secondary)",
              fontSize: "0.7rem",
              fontWeight: currentStep === step.number ? "600" : "500",
              marginTop: "0.25rem",
              textAlign: "center",
            }}
          >
            {step.title}
          </div>

          {index < steps.length - 1 && (
            <div
              style={{
                position: "absolute",
                top: "17px",
                left: `${((index + 1) * 100) / steps.length - 10}%`,
                right: `${100 - ((index + 2) * 100) / steps.length + 10}%`,
                height: "2px",
                background:
                  currentStep > step.number
                    ? "var(--secondary-color)"
                    : "#e5e7eb",
                transition: "all 0.3s ease",
                zIndex: 1,
              }}
            />
          )}
        </div>
      ))}
    </div>
  </div>
);
