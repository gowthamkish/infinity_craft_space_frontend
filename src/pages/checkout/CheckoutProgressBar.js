import { Check } from "react-feather";
import "./checkout-progress.css";

export const CheckoutProgressBar = ({ steps, currentStep }) => (
  <div className="cpb-wrap">
    {/* Security banner */}
    <div className="cpb-secure-banner">
      <span className="cpb-lock">🔒</span>
      <span>Your payment information is secure and encrypted. Complete your order with confidence.</span>
    </div>

    {/* Desktop steps */}
    <div className="d-none d-md-flex cpb-steps">
      {steps.map((step, index) => (
        <div key={step.number} className="cpb-step-group">
          <div className="cpb-step-col">
            <div className={`cpb-circle ${currentStep >= step.number ? "cpb-circle--done" : ""}`}>
              {currentStep > step.number ? <Check size={26} strokeWidth={3} /> : step.number}
            </div>
            <div className={`cpb-step-label ${currentStep >= step.number ? "cpb-step-label--active" : ""} ${currentStep === step.number ? "cpb-step-label--current" : ""}`}>
              {step.title}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`cpb-connector ${currentStep > step.number ? "cpb-connector--done" : ""}`} />
          )}
        </div>
      ))}
    </div>

    {/* Mobile steps */}
    <div className="d-flex d-md-none cpb-steps-mobile">
      {steps.map((step, index) => (
        <div key={step.number} className="cpb-step-mobile">
          <div className={`cpb-circle-sm ${currentStep >= step.number ? "cpb-circle--done" : ""}`}>
            {currentStep > step.number ? <Check size={13} /> : step.number}
          </div>
          <div className={`cpb-step-label-sm ${currentStep >= step.number ? "cpb-step-label--active" : ""}`}>
            {step.title}
          </div>
          {index < steps.length - 1 && (
            <div className={`cpb-connector-mobile ${currentStep > step.number ? "cpb-connector--done" : ""}`} />
          )}
        </div>
      ))}
    </div>
  </div>
);
