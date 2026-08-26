import { createFileRoute } from "@tanstack/react-router";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { motion } from "framer-motion";
import { Mail, Phone, Globe, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/cancellation-policy")({
  component: CancellationPolicyPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function CancellationPolicyPage() {
  return (
    <WebsiteLayout>
      <div className="bg-[#FAF9F6] min-h-screen pt-28 pb-20">
        
        {/* ── Hero Section ── */}
        <section className="text-center px-6 mb-16 max-w-4xl mx-auto">
          <motion.div initial="initial" animate="animate" variants={fadeUp}>
            <h1 className="font-serif font-bold text-[#C6A15B] tracking-tight leading-tight mb-4 text-4xl sm:text-5xl md:text-6xl">
              Refund Policy
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl font-light mb-6">
              We aim to provide clear and transparent cancellation and refund terms for all reservations made with Emirates Inn and Emirates Grand Inn.
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
              This Cancellation and Refund Policy explains the conditions under which a reservation may be cancelled and when a refund may be provided. By making a reservation through our website or using our services, you agree to the terms outlined in this policy.
            </div>

            {/* Section 1 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">1. General Cancellation Policy</h2>
              <p className="text-muted-foreground">Guests may request cancellation of their reservation subject to the cancellation conditions applicable to their booking.</p>
              <p className="text-muted-foreground">Cancellation terms may vary depending on:</p>
              
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Hotel selected</li>
                <li>Room category</li>
                <li>Rate plan</li>
                <li>Booking date</li>
                <li>Check-in date</li>
                <li>Promotional offer</li>
                <li>Payment method</li>
                <li>Special booking conditions</li>
              </ul>
              <p className="text-muted-foreground">
                The cancellation terms applicable to a specific reservation will be displayed during the booking process and/or included in the booking confirmation.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">2. Free Cancellation</h2>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Where a reservation includes a free cancellation option, guests may cancel the booking within the specified cancellation period without incurring a cancellation charge.</li>
                <li>The applicable cancellation deadline will be mentioned in the booking confirmation.</li>
                <li>Cancellation requests received after the permitted free-cancellation period may be subject to applicable cancellation charges.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">3. Non-Refundable Bookings</h2>
              <p className="text-muted-foreground">Certain room rates, promotional offers, discounted plans, or special packages may be offered as non-refundable. For non-refundable reservations:</p>
              
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Cancellation may not be eligible for a refund.</li>
                <li>Changes to the reservation may be restricted.</li>
                <li>No refund may be provided for early departure or no-show, subject to the applicable booking terms.</li>
              </ul>
              <p className="text-muted-foreground">
                Guests should carefully review the rate conditions before completing a non-refundable booking.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">4. Partial Refunds</h2>
              <p className="text-muted-foreground">Where applicable, a partial refund may be provided after deducting the applicable cancellation charges.</p>
              <p className="text-muted-foreground">The refund amount will depend on:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Time of cancellation</li>
                <li>Booking value</li>
                <li>Cancellation terms</li>
                <li>Applicable hotel charges</li>
                <li>Payment processing charges, if applicable</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">5. No-Show</h2>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>If a guest fails to arrive on the scheduled check-in date without cancelling the reservation, the booking may be classified as a No-Show.</li>
                <li>Depending on the applicable rate plan, the hotel may retain part or all of the booking amount.</li>
                <li>No-show conditions will be determined according to the terms applicable to the reservation.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">6. Early Check-Out</h2>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>If a guest checks out before the originally confirmed departure date, the unused portion of the booking may not automatically qualify for a refund.</li>
                <li>Any refund or adjustment for early departure will depend on the applicable booking conditions and hotel policy.</li>
                <li>Guests are encouraged to contact the hotel before making changes to their stay.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">7. Refund Eligibility</h2>
              <p className="text-muted-foreground">A refund may be applicable in circumstances such as:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Cancellation within an eligible free-cancellation period.</li>
                <li>Duplicate payment.</li>
                <li>Payment received for a booking that was not successfully confirmed.</li>
                <li>Hotel-initiated cancellation where a refund is applicable.</li>
                <li>Other circumstances specifically approved by the hotel.</li>
              </ul>
              <p className="text-muted-foreground">
                Refund eligibility will be determined based on the booking terms and circumstances of the request.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">8. Refund Method</h2>
              <p className="text-muted-foreground">Approved refunds will generally be processed to the original payment method used during the booking. For example:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li><strong>Credit/Debit Card</strong> → Refund to the same card</li>
                <li><strong>UPI</strong> → Refund through the applicable payment channel</li>
                <li><strong>Online Payment</strong> → Refund through the original payment provider</li>
              </ul>
              <p className="text-muted-foreground">
                The availability of a particular refund method may depend on the payment provider.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">9. Refund Processing Time</h2>
              <p className="text-muted-foreground">Once a refund has been approved and initiated by the hotel, the time taken for the amount to appear in the guest's account may depend on:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Payment gateway</li>
                <li>Bank</li>
                <li>Card issuer</li>
                <li>UPI provider</li>
                <li>Other financial institutions</li>
              </ul>
              <p className="text-muted-foreground">
                The hotel is not responsible for delays caused by external banks or payment service providers.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">10. Cancellation by the Hotel</h2>
              <p className="text-muted-foreground">In exceptional situations, Emirates Inn or Emirates Grand Inn may need to cancel a confirmed reservation due to circumstances beyond reasonable control, operational requirements, safety concerns, or other unavoidable situations. Where applicable, the hotel will:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Inform the guest as soon as reasonably possible.</li>
                <li>Assist with alternative arrangements where available.</li>
                <li>Process an applicable refund according to the circumstances.</li>
              </ul>
            </section>
            
            {/* Section 11 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">11. Booking Modification Instead of Cancellation</h2>
              <p className="text-muted-foreground">Where possible, guests may request to modify their reservation instead of cancelling it. Changes may include:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Change of check-in date</li>
                <li>Change of check-out date</li>
                <li>Change of room category</li>
                <li>Change in number of guests</li>
              </ul>
              <p className="text-muted-foreground">
                Modifications are subject to availability and may result in additional charges or changes to the booking amount.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-6 pt-6 border-t border-border">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33] mb-6">12. How to Request Cancellation or Refund</h2>
              <p className="text-muted-foreground mb-6">
                To request a cancellation or enquire about a refund, please contact us with the following information:
              </p>
              
              <ul className="list-disc list-outside ml-5 space-y-4 text-muted-foreground mb-8">
                <li>Guest Name</li>
                <li>Booking Reference Number</li>
                <li>Registered Mobile Number</li>
                <li>Registered Email Address</li>
                <li>Check-in Date</li>
                <li>Reason for cancellation, if applicable</li>
              </ul>
              
              <div className="bg-[#FAF9F6] border border-border rounded-xl p-8 space-y-6">
                <h3 className="text-xl font-serif font-bold text-gold">Contact Details</h3>
                <h4 className="font-semibold text-foreground">Emirates Inn & Emirates Grand Inn</h4>
                <div className="space-y-4 mt-2">
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

            {/* Section 13 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">13. Important Information</h2>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Guests are responsible for reviewing the cancellation and refund conditions before completing their reservation.</li>
                <li>Different room types, promotional offers, and rate plans may have different cancellation conditions.</li>
                <li>In case of any conflict between this general policy and the specific cancellation terms displayed for a reservation, the terms applicable to that particular reservation will govern.</li>
              </ul>
            </section>
            
            {/* Section 14 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">14. Policy Updates</h2>
              <p className="text-muted-foreground">
                We may update this Cancellation and Refund Policy from time to time to reflect changes in our services, booking procedures, or applicable requirements. The latest version will be published on our website with the updated effective date.
              </p>
            </section>

            {/* Section 15 */}
            <section className="pt-8">
              <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left shadow-sm">
                <div className="bg-white p-3 rounded-full shadow-md shrink-0">
                  <ShieldCheck className="h-8 w-8 text-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Acknowledgement</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    By making a reservation with Emirates Inn or Emirates Grand Inn, you acknowledge that you have read, understood, and agreed to this Cancellation and Refund Policy. If you have any questions regarding cancellation or refunds, please contact our support team before making your reservation.
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
