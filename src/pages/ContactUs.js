import Header from "../components/Header";
import SEOHead, { SEO_CONFIG } from "../components/SEOHead";
import "./content-page.css";

export default function ContactUs() {
  return (
    <>
      <SEOHead
        title={`Contact Us - ${SEO_CONFIG.SITE_NAME}`}
        description="Get in touch with Infinity Craft Space support."
        url={`${SEO_CONFIG.SITE_URL}/contact-us`}
        canonical={`${SEO_CONFIG.SITE_URL}/contact-us`}
      />
      <Header />
      <div className="cp-page">
        <div className="cp-container">
          <div className="cp-card">
            <div className="cp-card-header">
              <div className="cp-eyebrow">Support</div>
              <h1 className="cp-title">Contact Us</h1>
              <p className="cp-lead">
                Have a question about your order or products? Reach out to us and we'll respond as soon as possible.
              </p>
            </div>
            <div className="cp-card-body cp-body">
              <div className="cp-contact-grid">
                <div className="cp-contact-card">
                  <p className="cp-contact-label">Support</p>
                  <div className="cp-contact-item">
                    <a href="mailto:jsaginfinitycraftspace@gmail.com">jsaginfinitycraftspace@gmail.com</a>
                    <a href="tel:+918925083167">+91 89250 83167</a>
                    <span>Hours: 10:00 AM – 6:00 PM IST</span>
                  </div>
                </div>
                <div className="cp-contact-card">
                  <p className="cp-contact-label">Address</p>
                  <div className="cp-contact-item">
                    <span>Infinity Craft Space</span>
                    <span>17, Beladingalu, Aishwaraya Crystal Layout,</span>
                    <span>MJ Infrastructure Road, Bangalore – 560068</span>
                    <span>Karnataka, India</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
