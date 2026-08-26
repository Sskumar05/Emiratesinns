import { createFileRoute } from "@tanstack/react-router";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { motion } from "framer-motion";
import { Mail, Phone, Globe, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/booking-information")({
  component: BookingInformationPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function BookingInformationPage() {
  return (
    <WebsiteLayout>
      <div className="bg-[#FAF9F6] min-h-screen pt-28 pb-20">
        
        {/* ── Hero Section ── */}
        <section className="text-center px-6 mb-16 max-w-4xl mx-auto">
          <motion.div initial="initial" animate="animate" variants={fadeUp}>
            <h1 className="font-serif font-bold text-[#C6A15B] tracking-tight leading-tight mb-4 text-4xl sm:text-5xl md:text-6xl">
              Cancellation Policy
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl font-light mb-6">
              We are committed to making your hotel booking experience simple, transparent, and convenient.
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
              Welcome to Emirates Inn and Emirates Grand Inn. This Booking and Cancellation Information explains the terms and procedures related to hotel reservations, booking modifications, cancellations, check-in, check-out, and related charges. By making a reservation through our website or using our services, you acknowledge and agree to the information provided below.
            </div>

            {/* Section 1 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">1. Booking Information</h2>
              <p className="text-muted-foreground">Guests can make reservations through our official website or other authorized booking channels.</p>
              <p className="text-muted-foreground">During the booking process, you may be required to provide:</p>
              
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Full Name</li>
                <li>Email Address</li>
                <li>Mobile Number</li>
                <li>Check-in Date</li>
                <li>Check-out Date</li>
                <li>Number of Guests</li>
                <li>Room Category</li>
                <li>Number of Rooms</li>
                <li>Special Requests, if applicable</li>
                <li>Identification details as required during check-in</li>
              </ul>
              <p className="text-muted-foreground">
                A booking is considered confirmed only after the required booking details and payment requirements have been successfully completed.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">2. Booking Confirmation</h2>
              <p className="text-muted-foreground">After a successful reservation, a booking confirmation will be provided to the guest. The confirmation may include:</p>
              
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Booking Reference Number</li>
                <li>Hotel Name</li>
                <li>Guest Name</li>
                <li>Room Category</li>
                <li>Check-in Date</li>
                <li>Check-out Date</li>
                <li>Number of Guests</li>
                <li>Booking Amount</li>
                <li>Payment Status</li>
                <li>Cancellation Terms</li>
                <li>Special instructions, if applicable</li>
              </ul>
              <p className="text-muted-foreground">
                Guests are requested to verify all booking details immediately after receiving the confirmation.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">3. Check-in and Check-out</h2>
              
              <div>
                <h3 className="font-semibold text-foreground mb-3 uppercase tracking-wider text-sm">Check-in</h3>
                <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                  <li>Guests must provide valid identification documents at the time of check-in as required by applicable laws and hotel policies.</li>
                  <li>The hotel reserves the right to verify the identity and booking details of the guest before providing room access.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3 uppercase tracking-wider text-sm">Check-out</h3>
                <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                  <li>Guests are required to check out according to the hotel's specified check-out time.</li>
                </ul>
                <p className="text-muted-foreground mt-3">Additional charges may apply for:</p>
                <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground mt-2">
                  <li>Late check-out</li>
                  <li>Additional guests</li>
                  <li>Additional services</li>
                  <li>Room damage</li>
                  <li>Loss or damage to hotel property</li>
                  <li>Other applicable hotel services</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">4. Booking Modification</h2>
              <p className="text-muted-foreground">Subject to availability and the applicable booking conditions, guests may request changes to:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Check-in date</li>
                <li>Check-out date</li>
                <li>Number of guests</li>
                <li>Room category</li>
                <li>Special requests</li>
              </ul>
              <p className="text-muted-foreground">
                Any modification may result in a change to the total booking amount or applicable charges. Modification requests should be made as early as possible before the scheduled check-in date.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">5. Cancellation of Booking</h2>
              <p className="text-muted-foreground">Guests may cancel their reservation according to the cancellation terms applicable to their booking.</p>
              <p className="text-muted-foreground">Cancellation policies may vary depending on:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Room category</li>
                <li>Rate plan</li>
                <li>Booking date</li>
                <li>Check-in date</li>
                <li>Promotional offers</li>
                <li>Payment method</li>
                <li>Special booking conditions</li>
              </ul>
              <p className="text-muted-foreground">
                Guests are advised to review the cancellation terms displayed during the booking process and in the booking confirmation.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">6. Cancellation Request</h2>
              <p className="text-muted-foreground">Cancellation requests can be submitted through the available booking channel or by contacting the hotel directly.</p>
              <p className="text-muted-foreground">When requesting cancellation, guests may be required to provide:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Guest Name</li>
                <li>Booking Reference Number</li>
                <li>Registered Mobile Number</li>
                <li>Registered Email Address</li>
                <li>Check-in Date</li>
                <li>Reason for cancellation, if required</li>
              </ul>
              <p className="text-muted-foreground">
                A cancellation will be considered successful only after the cancellation request has been acknowledged or confirmed.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">7. Cancellation Charges</h2>
              <p className="text-muted-foreground">Cancellation charges, if applicable, will be determined according to the cancellation policy associated with the reservation. Depending on the booking conditions:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Free cancellation may be available within the permitted cancellation period.</li>
                <li>A partial cancellation charge may apply after the permitted period.</li>
                <li>The full booking amount may be non-refundable for certain bookings.</li>
                <li>Promotional or special-rate bookings may have separate cancellation conditions.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">8. No-Show Policy</h2>
              <p className="text-muted-foreground">If a guest does not arrive at the hotel on the scheduled check-in date without cancelling the reservation, the booking may be treated as a No-Show. Depending on the applicable booking conditions, the hotel may:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Retain the applicable booking amount.</li>
                <li>Charge a cancellation or no-show fee.</li>
                <li>Release the reserved room.</li>
              </ul>
              <p className="text-muted-foreground">
                The exact terms will depend on the rate plan and booking conditions selected at the time of reservation.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">9. Refund Processing</h2>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>If a refund is applicable, it will be processed according to the hotel's cancellation and refund policy.</li>
                <li>Refunds will generally be made to the original payment method used for the reservation, where applicable.</li>
                <li>The time required for the refund to reflect in the guest's account may depend on the payment provider or bank.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">10. Special and Promotional Bookings</h2>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Bookings made under special offers, promotional rates, packages, or discounted plans may have specific booking and cancellation conditions.</li>
                <li>Such conditions will be displayed during the booking process or communicated in the booking confirmation.</li>
                <li>Guests are advised to carefully review these terms before completing the reservation.</li>
              </ul>
            </section>

            {/* Section 11 */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">11. Changes by the Hotel</h2>
              <p className="text-muted-foreground">In exceptional circumstances, the hotel may need to modify or cancel a reservation due to operational, safety, maintenance, or other unavoidable reasons. In such cases, the hotel will make reasonable efforts to:</p>
              <ul className="list-disc list-outside ml-5 space-y-2 text-muted-foreground">
                <li>Inform the guest as soon as possible.</li>
                <li>Provide an alternative arrangement where available.</li>
                <li>Offer an applicable refund where required.</li>
              </ul>
            </section>

            {/* Section 12 */}
            <section className="space-y-6 pt-6 border-t border-border">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F33] mb-6">12. Contact Us</h2>
              <p className="text-muted-foreground mb-6">
                For booking-related questions, modifications, or cancellation requests, please contact us.
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

            {/* Section 13 */}
            <section className="pt-8">
              <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left shadow-sm">
                <div className="bg-white p-3 rounded-full shadow-md shrink-0">
                  <ShieldCheck className="h-8 w-8 text-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Acknowledgement</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    By making a reservation with Emirates Inn or Emirates Grand Inn, you acknowledge that you have read and understood the applicable booking, cancellation, and refund terms associated with your reservation. These terms should be reviewed before completing your booking.
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
