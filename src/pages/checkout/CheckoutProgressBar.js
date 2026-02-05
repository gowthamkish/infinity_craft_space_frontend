import { Check } from "react-feather";

export const CheckoutProgressBar = ({ steps, currentStep }) => (
  <div className="mb-4">
    <div className="d-flex justify-content-center align-items-center mb-4">
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
          padding: "clamp(0.75rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem)",
          borderRadius: "50px",
          color: "white",
          fontWeight: "600",
          fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
          boxShadow: "var(--shadow-md)",
          textAlign: "center",
          maxWidth: "90%",
        }}
      >
        🔒 Your payment information is secure and encrypted. Complete your order
        with confidence.
      </div>
    </div>

    <div className="d-none d-md-flex justify-content-center align-items-center position-relative">
      {steps.map((step, index) => (
        <div key={step.number} className="d-flex align-items-center">
          <div className="text-center">
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
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
              {currentStep > step.number ? <Check size={20} /> : step.number}
            </div>
            <div
              style={{
                color:
                  currentStep >= step.number
                    ? "var(--secondary-color)"
                    : "var(--text-secondary)",
                fontSize: "0.875rem",
                fontWeight: currentStep === step.number ? "600" : "500",
                marginTop: "0.5rem",
              }}
            >
              {step.title}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              style={{
                width: "100px",
                height: "3px",
                background:
                  currentStep > step.number
                    ? "var(--secondary-color)"
                    : "#e5e7eb",
                margin: "0 1rem",
                transition: "all 0.3s ease",
                position: "relative",
                top: "-12px",
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
