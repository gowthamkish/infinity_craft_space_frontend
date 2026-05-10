import { Check } from "react-feather";
import "./checkout-progress.css";

export const CheckoutProgressBar = ({ steps, currentStep }) => (
  <div className="cpb-root">
    <div className="cpb-secure">
      🔒 Secure &amp; Encrypted Checkout
    </div>

    <div className="cpb-steps">
      {steps.map((step, index) => {
        const isDone   = currentStep > step.number;
        const isActive = currentStep === step.number;
        return (
          <div key={step.number} className="cpb-step-group">
            <div className="cpb-step-col">
              <div
                className={[
                  "cpb-circle",
                  isDone   ? "cpb-circle--done"   : "",
                  isActive ? "cpb-circle--active"  : "",
                ].filter(Boolean).join(" ")}
                aria-label={`Step ${step.number}: ${step.title}${isDone ? " (completed)" : isActive ? " (current)" : ""}`}
              >
                {isDone ? <Check size={18} strokeWidth={3} /> : step.number}
              </div>
              <div
                className={[
                  "cpb-label",
                  isDone   ? "cpb-label--done"   : "",
                  isActive ? "cpb-label--active"  : "",
                ].filter(Boolean).join(" ")}
              >
                {step.title}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="cpb-connector" role="presentation">
                <div className="cpb-connector-fill" style={{ width: isDone ? "100%" : "0%" }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);
