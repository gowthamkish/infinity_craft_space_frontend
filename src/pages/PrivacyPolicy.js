import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Header from "../components/Header";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import { useLaunchLock } from "../config/launch";
import "./content-page.css";

const EMAIL = "infinitycraftspacejsag@gmail.com";

const SECTIONS = [
  {
    title: "1. Who we are",
    body: "InfinityCraftSpace (\"we\", \"us\") is an online store for handcrafted gifts and craft products, based in Bangalore, Karnataka, India. We decide how and why your personal data is used (a \"data fiduciary\" under India's Digital Personal Data Protection Act, 2023).",
  },
  {
    title: "2. What information we collect",
    list: [
      "Launch updates: your email address when you ask to be notified about our launch or subscribe to our newsletter.",
      "Account: your name or username, email address and a securely hashed password.",
      "Orders: items purchased, delivery address, phone number and order history.",
      "Payments: handled by our payment partner Razorpay. We receive confirmation and a payment reference, but we never see or store your card, UPI or bank details.",
      "Support and chat: messages you send us or our shopping assistant, and your reviews or questions on products.",
      "Technical data: cookies, device and browser information, and pages visited, used to keep you signed in and to understand how the site is used.",
    ],
  },
  {
    title: "3. Why we use your information",
    list: [
      "To process and deliver orders, send order updates and provide invoices and support.",
      "To run your account and keep it secure and free from fraud.",
      "To email you about our launch, new collections and offers — only if you asked us to.",
      "To improve the website, products and customer service.",
      "To meet legal, tax and accounting obligations.",
    ],
  },
  {
    title: "4. Launch notifications & marketing emails",
    body: "When you enter your email on our launch page and tap \"Notify me\", you agree that we may email you about the launch and, afterwards, about new collections and offers. We will not sell your email address. Every email contains an unsubscribe link, and you can also write to us at any time to stop receiving them. Order-related emails are separate and will still reach you.",
  },
  {
    title: "5. Who we share it with",
    body: "We share only what is needed, with service providers who help us run the store: Razorpay (payments), courier and logistics partners (delivery), our email and messaging providers (order and launch emails, WhatsApp updates), image-hosting and website-hosting providers, analytics tools such as Google Analytics, and the AI provider that powers our shopping assistant. We may also disclose information when required by law. We do not sell your personal data.",
  },
  {
    title: "6. Cookies",
    body: "We use essential cookies to keep you signed in and protect your session, and analytics cookies to understand site usage. You can block or delete cookies in your browser settings, but parts of the site (such as signing in and checkout) may stop working.",
  },
  {
    title: "7. How long we keep it",
    body: "We keep launch-list emails until you unsubscribe or ask us to delete them. Account and order information is kept for as long as your account is active and for the period the law requires for tax and accounting records. After that it is deleted or anonymised.",
  },
  {
    title: "8. Your rights",
    body: "You may ask us to show you the personal data we hold about you, correct it, update it, or delete it; withdraw your consent at any time (for example, unsubscribing from marketing emails); and raise a grievance about how your data is handled. Withdrawing consent does not affect processing done before you withdrew it.",
  },
  {
    title: "9. Security",
    body: "We protect your data with encrypted connections (HTTPS), hashed passwords, and restricted access to our systems. No online service can be completely risk-free, so please use a strong, unique password and tell us straight away if you suspect your account has been misused.",
  },
  {
    title: "10. Children",
    body: "Our store is meant for adults. If you are under 18, please use it only with a parent or guardian, and do not give us your personal data without their consent.",
  },
  {
    title: "11. Changes to this policy",
    body: "We may update this policy from time to time. The date at the top shows when it was last changed, and significant changes will be announced on the website.",
  },
];

export default function PrivacyPolicy() {
  const locked = useLaunchLock(); // before launch the rest of the site is unreachable, so keep the navigation inert

  return (
    <>
      <SEOHead
        title={`Privacy Policy - ${SEO_CONFIG.SITE_NAME}`}
        description="How InfinityCraftSpace collects, uses and protects your personal information, including launch-notification emails."
        url={`${SEO_CONFIG.SITE_URL}/privacy-policy`}
        canonical={`${SEO_CONFIG.SITE_URL}/privacy-policy`}
      />
      <div className={locked ? "launch-blurred" : undefined} {...(locked ? { inert: "", "aria-hidden": "true" } : {})}>
        <Header />
      </div>
      <main className="cp-page">
        <div className="cp-container">
          {locked && (
            <p style={{ margin: "0 0 16px" }}>
              <Link to="/" className="cp-back" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                <FiArrowLeft aria-hidden="true" /> Back to the launch page
              </Link>
            </p>
          )}
          <div className="cp-card">
            <div className="cp-card-header">
              <div className="cp-eyebrow">Legal</div>
              <h1 className="cp-title">Privacy Policy</h1>
              <p className="cp-lead">
                Last updated: 12 October 2026. This policy explains what personal information InfinityCraftSpace collects, why, and the choices you have.
              </p>
            </div>
            <div className="cp-card-body cp-body">
              {SECTIONS.map((s) => (
                <div key={s.title}>
                  <h2 className="cp-section-heading">{s.title}</h2>
                  {s.body && <p>{s.body}</p>}
                  {s.list && <ul>{s.list.map((item) => <li key={item}>{item}</li>)}</ul>}
                </div>
              ))}

              <h2 className="cp-section-heading">12. Contact & grievances</h2>
              <p>
                To access, correct or delete your data, to unsubscribe, or to raise a concern, write to{" "}
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or call/WhatsApp <a href="tel:+918925083167">+91 89250 83167</a>.
                We aim to respond within 7 working days.
              </p>
              <p>
                InfinityCraftSpace, 17 Beladingalu, Manipal County Road, Aishwarya Crystal Layout, MJ Infrastructure Road,
                Bangalore, Karnataka - 560068.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
