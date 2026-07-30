import { createFileRoute } from "@tanstack/react-router";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { motion } from "framer-motion";
import { Mail, Phone, Globe, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfServicePage,
});

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function TermsOfServicePage() {
  return (
    <WebsiteLayout>
      <div className="bg-[#FAF9F6] min-h-screen pt-28 pb-20">
        
        {/* ── Hero Section ── */}
        <section className="text-center px-6 mb-16 max-w-4xl mx-auto">
          <motion.div initial="initial" animate="animate" variants={fadeUp}>
            <h1 className="font-serif font-bold text-foreground tracking-tight leading-tight mb-4 text-4xl sm:text-5xl md:text-6xl">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl font-light mb-6">
              Please read these terms carefully before using our website or booking our services.
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
              Welcome to Emirates Inn and Emirates Grand Inn. These Terms of Service ("Terms") govern your access to and use of our website, online booking platform, and hotel services. By accessing our website or making a reservation, you agree to comply with these Terms.
            </div>

            {/* Section 1 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By using this website or booking a room through our platform, you confirm that you have read, understood, and agreed to these Terms of Service. If you do not agree with these Terms, please do not use our website or services.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">2. Eligibility</h2>
              <p className="text-muted-foreground">To make a reservation, you must:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Be at least 18 years of age or the legal age required in your jurisdiction.</li>
                <li>Provide accurate and complete booking information.</li>
                <li>Have the legal authority to enter into a binding agreement.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">3. Reservations</h2>
              <p className="text-muted-foreground">All bookings are subject to:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Room availability.</li>
                <li>Confirmation by the hotel.</li>
                <li>Successful payment where applicable.</li>
                <li>Verification of guest information.</li>
              </ul>
              <p className="text-muted-foreground">
                The hotel reserves the right to refuse or cancel any reservation that contains inaccurate, fraudulent, or incomplete information.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">4. Pricing</h2>
              <p className="text-muted-foreground">Room prices displayed on the website:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Are subject to availability.</li>
                <li>May change without prior notice until a reservation is confirmed.</li>
                <li>May include or exclude taxes and additional charges as specified during booking.</li>
                <li>Are confirmed only after successful reservation confirmation.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">5. Payments</h2>
              <p className="text-muted-foreground">Guests agree that:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Payment may be required at the time of booking or during check-in depending on the selected rate.</li>
                <li>All payments must be made using approved payment methods.</li>
                <li>Failed or declined transactions may result in cancellation of the reservation.</li>
                <li>Payment processing is handled through secure third-party payment providers.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">6. Check-In and Check-Out</h2>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Guests must comply with the hotel's standard check-in and check-out procedures.</li>
                <li>Valid government-issued identification may be required during check-in.</li>
                <li>Early check-in and late check-out are subject to availability and may incur additional charges.</li>
                <li>Guests are responsible for completing check-out within the permitted time.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">7. Cancellations and Refunds</h2>
              <p className="text-muted-foreground">Cancellation and refund eligibility depend on:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>The selected room type.</li>
                <li>The booking rate.</li>
                <li>The hotel's cancellation policy.</li>
              </ul>
              <p className="text-muted-foreground">
                Refunds, where applicable, will be processed according to the hotel's policies and the payment provider's processing timelines.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">8. Guest Responsibilities</h2>
              <p className="text-muted-foreground">Guests agree to:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Provide accurate booking information.</li>
                <li>Respect hotel property and facilities.</li>
                <li>Follow hotel rules and regulations.</li>
                <li>Maintain appropriate behavior during their stay.</li>
                <li>Be responsible for any damages caused by themselves or their visitors.</li>
              </ul>
              <p className="text-muted-foreground">
                The hotel reserves the right to charge for damages resulting from misuse or negligence.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">9. Prohibited Activities</h2>
              <p className="text-muted-foreground">Guests must not:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Engage in illegal activities.</li>
                <li>Damage hotel property.</li>
                <li>Disturb other guests.</li>
                <li>Use the premises for unlawful purposes.</li>
                <li>Attempt unauthorized access to hotel systems or networks.</li>
                <li>Submit false or misleading booking information.</li>
              </ul>
              <p className="text-muted-foreground">
                Violation of these rules may result in immediate cancellation of the reservation or removal from the property without refund.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">10. Hotel Rights</h2>
              <p className="text-muted-foreground">The hotel reserves the right to:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Refuse service where permitted by law.</li>
                <li>Cancel fraudulent or suspicious bookings.</li>
                <li>Modify room assignments when operationally necessary while providing an equivalent or upgraded accommodation whenever possible.</li>
                <li>Update hotel policies without prior notice.</li>
              </ul>
            </section>

            {/* Section 11 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">11. Website Usage</h2>
              <p className="text-muted-foreground">Users agree to:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Use the website only for lawful purposes.</li>
                <li>Not attempt to interfere with website functionality or security.</li>
                <li>Not copy, reproduce, or distribute website content without permission.</li>
                <li>Not misuse the booking platform or automated systems.</li>
              </ul>
            </section>

            {/* Section 12 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">12. Intellectual Property</h2>
              <p className="text-muted-foreground">All content on this website, including but not limited to:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Logos</li>
                <li>Images</li>
                <li>Text</li>
                <li>Graphics</li>
                <li>Icons</li>
                <li>Layouts</li>
                <li>Software</li>
                <li>Designs</li>
              </ul>
              <p className="text-muted-foreground">
                is the property of Emirates Inn & Emirates Grand Inn or its licensors and is protected by applicable intellectual property laws. Unauthorized use is prohibited.
              </p>
            </section>

            {/* Section 13 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">13. Limitation of Liability</h2>
              <p className="text-muted-foreground">To the fullest extent permitted by law, Emirates Inn & Emirates Grand Inn shall not be liable for:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Indirect or consequential damages.</li>
                <li>Loss of profits or business opportunities.</li>
                <li>Delays caused by events beyond our control.</li>
                <li>Technical interruptions or website downtime.</li>
                <li>Errors caused by third-party service providers.</li>
              </ul>
              <p className="text-muted-foreground">
                Our total liability shall not exceed the amount paid for the affected reservation where permitted by law.
              </p>
            </section>

            {/* Section 14 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">14. Force Majeure</h2>
              <p className="text-muted-foreground">
                The hotel shall not be held responsible for failure or delay in providing services due to circumstances beyond its reasonable control, including but not limited to:
              </p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Natural disasters</li>
                <li>Government restrictions</li>
                <li>Public health emergencies</li>
                <li>Power failures</li>
                <li>Civil unrest</li>
                <li>Acts of terrorism</li>
                <li>Internet or communication failures</li>
              </ul>
            </section>

            {/* Section 15 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">15. Privacy</h2>
              <p className="text-muted-foreground">
                Your use of our website is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information.
              </p>
            </section>

            {/* Section 16 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">16. Third-Party Services</h2>
              <p className="text-muted-foreground">
                Our website may contain links or integrations with third-party services such as payment gateways, maps, analytics, or email providers. We are not responsible for the content, availability, or privacy practices of third-party services.
              </p>
            </section>

            {/* Section 17 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">17. Modifications to the Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms of Service at any time. Any changes become effective upon publication on this website. Continued use of the website after changes constitutes acceptance of the revised Terms.
              </p>
            </section>

            {/* Section 18 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">18. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and interpreted in accordance with the applicable laws of the jurisdiction in which the hotel operates. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the competent courts of that jurisdiction.
              </p>
            </section>

            {/* Section 19 */}
            <section className="space-y-6 pt-6 border-t border-border">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">19. Contact Information</h2>
              <p className="text-muted-foreground mb-6">
                For questions regarding these Terms of Service, please contact:
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

            {/* Entire Agreement Card */}
            <section className="pt-8">
              <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left shadow-sm">
                <div className="bg-white p-3 rounded-full shadow-md shrink-0">
                  <ShieldCheck className="h-8 w-8 text-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">20. Entire Agreement</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms of Service, together with our Privacy Policy and any booking-specific policies, constitute the complete agreement between you and Emirates Inn & Emirates Grand Inn regarding your use of our website and services, superseding any prior agreements or communications.
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
