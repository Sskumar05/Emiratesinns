import { createFileRoute } from "@tanstack/react-router";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { motion } from "framer-motion";
import { Info, Mail, Phone, Globe, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function PrivacyPolicyPage() {
  return (
    <WebsiteLayout>
      <div className="bg-[#FAF9F6] min-h-screen pt-28 pb-20">
        
        {/* ── Hero Section ── */}
        <section className="text-center px-6 mb-16 max-w-4xl mx-auto">
          <motion.div initial="initial" animate="animate" variants={fadeUp}>
            <h1 className="font-serif font-bold text-foreground tracking-tight leading-tight mb-4 text-4xl sm:text-5xl md:text-6xl">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl font-light mb-6">
              Your privacy and personal information are important to us.
            </p>
            <div className="inline-flex items-center justify-center bg-white border border-border shadow-sm px-6 py-2 rounded-full">
              <span className="text-sm font-semibold tracking-wide text-primary uppercase">
                Effective Date: [30/07/2026]
              </span>
            </div>
          </motion.div>
        </section>

        {/* ── Content Container ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="container-luxe max-w-5xl mx-auto px-6 lg:px-0"
        >
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border p-8 sm:p-12 md:p-16 space-y-12">
            
            {/* Introduction */}
            <div className="text-lg leading-relaxed text-muted-foreground font-light">
              Welcome to Emirates Inn and Emirates Grand Inn. Your privacy is important to us. This Privacy Policy explains how we collect, use, store, protect, and disclose your personal information when you use our website, make a reservation, or interact with our services. By using our website, you agree to the terms outlined in this Privacy Policy.
            </div>

            {/* Section 1 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">1. Information We Collect</h2>
              <p className="text-muted-foreground">We may collect the following information from you:</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3 uppercase tracking-wider text-sm">Personal Information</h3>
                  <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                    <li>Full Name</li>
                    <li>Email Address</li>
                    <li>Mobile Number</li>
                    <li>Residential Address (if required)</li>
                    <li>Nationality (if required)</li>
                    <li>Identification details during check-in (as required by law)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3 uppercase tracking-wider text-sm">Booking Information</h3>
                  <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                    <li>Hotel selected</li>
                    <li>Room category</li>
                    <li>Check-in and Check-out dates</li>
                    <li>Number of guests</li>
                    <li>Special requests</li>
                    <li>Booking reference number</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3 uppercase tracking-wider text-sm">Payment Information</h3>
                  <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                    <li>Payment status</li>
                    <li>Transaction reference</li>
                    <li>Billing details</li>
                  </ul>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-full shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 leading-relaxed">
                      <strong>Note:</strong> We do not store your complete debit or credit card information on our servers. Payments are processed securely through authorized payment providers.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3 uppercase tracking-wider text-sm">Technical Information</h3>
                  <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                    <li>IP Address</li>
                    <li>Browser type</li>
                    <li>Device information</li>
                    <li>Operating system</li>
                    <li>Website usage statistics</li>
                    <li>Cookies and analytics data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">2. How We Use Your Information</h2>
              <p className="text-muted-foreground">Your information is used to:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Process and confirm hotel reservations.</li>
                <li>Manage bookings, cancellations, and modifications.</li>
                <li>Communicate booking confirmations and updates.</li>
                <li>Respond to customer enquiries.</li>
                <li>Provide customer support.</li>
                <li>Improve our website and services.</li>
                <li>Prevent fraud and unauthorized activity.</li>
                <li>Comply with legal and regulatory obligations.</li>
                <li>Generate invoices and booking records.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">3. Cookies</h2>
              <p className="text-muted-foreground">Our website uses cookies to improve your browsing experience. Cookies help us:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Remember your preferences.</li>
                <li>Improve website performance.</li>
                <li>Analyze website traffic.</li>
                <li>Maintain secure user sessions.</li>
              </ul>
              <p className="text-muted-foreground">
                You may disable cookies through your browser settings; however, certain website features may not function properly.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">4. Sharing of Information</h2>
              <p className="text-muted-foreground">We do not sell, rent, or trade your personal information. Your information may only be shared with:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Authorized hotel staff.</li>
                <li>Trusted payment service providers.</li>
                <li>Government or legal authorities when required by law.</li>
                <li>Technology providers who assist in operating our website.</li>
              </ul>
              <p className="text-muted-foreground">
                All third-party providers are required to protect your information appropriately.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">5. Data Security</h2>
              <p className="text-muted-foreground">We implement appropriate technical and organizational measures to safeguard your personal information. These include:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Secure servers</li>
                <li>Encrypted communication (HTTPS/SSL)</li>
                <li>Restricted administrative access</li>
                <li>Regular security monitoring</li>
                <li>Data backup procedures</li>
              </ul>
              <p className="text-muted-foreground">
                While we strive to protect your information, no online system can guarantee absolute security.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">6. Data Retention</h2>
              <p className="text-muted-foreground">We retain your personal information only for as long as necessary to:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Complete your reservation.</li>
                <li>Provide customer support.</li>
                <li>Meet legal, tax, and accounting obligations.</li>
                <li>Resolve disputes.</li>
                <li>Enforce our policies.</li>
              </ul>
              <p className="text-muted-foreground">
                Once the retention period expires, your information is securely deleted or anonymized.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">7. Your Rights</h2>
              <p className="text-muted-foreground">Depending on applicable laws, you may have the right to:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Access your personal information.</li>
                <li>Request correction of inaccurate information.</li>
                <li>Request deletion of your data where legally permitted.</li>
                <li>Withdraw consent where applicable.</li>
                <li>Request a copy of your stored personal information.</li>
                <li>Object to certain processing activities.</li>
              </ul>
              <p className="text-muted-foreground">
                Requests can be made using the contact details provided below.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">8. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our website and services are not intended for individuals under the age of 18 without the supervision of a parent or legal guardian. We do not knowingly collect personal information from children.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">9. Third-Party Services</h2>
              <p className="text-muted-foreground">Our website may include links or integrations with third-party services such as:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Payment gateways</li>
                <li>Maps</li>
                <li>Email services</li>
                <li>Analytics tools</li>
              </ul>
              <p className="text-muted-foreground">
                These third-party services operate under their own privacy policies, and we encourage you to review them before providing personal information.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">10. Marketing Communications</h2>
              <p className="text-muted-foreground">With your consent, we may send you:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Promotional offers</li>
                <li>Seasonal discounts</li>
                <li>Hotel updates</li>
                <li>Special packages</li>
                <li>Newsletters</li>
              </ul>
              <p className="text-muted-foreground">
                You may unsubscribe from marketing communications at any time using the unsubscribe option or by contacting us directly.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">11. International Data Transfers</h2>
              <p className="text-muted-foreground">
                If required for operational purposes, your information may be processed or stored in locations outside your country, subject to appropriate safeguards and applicable data protection laws.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">12. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy periodically to reflect changes in our services or legal requirements. The latest version will always be available on our website with the updated effective date.
              </p>
            </section>

            {/* Section 13 */}
            <section className="space-y-6 pt-6 border-t border-border">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">13. Contact Us</h2>
              <p className="text-muted-foreground mb-6">
                If you have any questions or concerns regarding this Privacy Policy or the handling of your personal information, please contact us.
              </p>
              
              <div className="bg-[#FAF9F6] border border-border rounded-xl p-8 space-y-6">
                <h3 className="text-xl font-serif font-bold text-gold">Emirates Inn & Emirates Grand Inn</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2.5 rounded-full shadow-sm">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <a href="mailto:support@emiratesinns.com" className="text-foreground font-medium hover:text-gold transition-colors">
                      support@emiratesinns.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2.5 rounded-full shadow-sm">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <a href="tel:+917339226598" className="text-foreground font-medium hover:text-gold transition-colors">
                      +91 73392 26598
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2.5 rounded-full shadow-sm">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <a href="https://www.emiratesinns.com" target="_blank" rel="noopener noreferrer" className="text-foreground font-medium hover:text-gold transition-colors">
                      www.emiratesinns.com
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Consent Card */}
            <section className="pt-8">
              <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left shadow-sm">
                <div className="bg-white p-3 rounded-full shadow-md shrink-0">
                  <ShieldCheck className="h-8 w-8 text-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Consent</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    By using our website, making a reservation, or using our services, you acknowledge that you have read, understood, and agreed to this Privacy Policy.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </motion.div>
      </div>
    </WebsiteLayout>
  );
}
