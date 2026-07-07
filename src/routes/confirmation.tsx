import { createFileRoute, Link } from "@tanstack/react-router";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABELS, formatINR, fmtDateTime, getDurationLabel, getRateLabel } from "@/lib/hotel";
import { generateInvoiceHTML as _generateInvoiceHTML, downloadInvoice } from "@/lib/invoicePdf";
import { Check, Download, Mail, Building, Loader2, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { useSendEmail } from "@/hooks/useSendEmail";
import { toast } from "sonner";

type Search = { bookingId?: string };

export const Route = createFileRoute("/confirmation")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    bookingId: typeof s.bookingId === "string" ? s.bookingId : undefined,
  }),
  component: Confirmation,
});

// ─── Confirmation Page ───────────────────────────────────────────────────────
function Confirmation() {
  const { bookingId } = Route.useSearch();
  const { sendConfirmation, loading: emailLoading } = useSendEmail();
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { data: booking } = useQuery({
    queryKey: ["booking", bookingId],
    enabled: !!bookingId,
    queryFn: async () =>
      (await supabase.from("bookings").select("*, hotels(name), customers(*)").eq("id", bookingId!).maybeSingle()).data,
  });

  const handleDownloadInvoice = useCallback(async () => {
    if (!booking) return;
    setPdfLoading(true);
    try {
      downloadInvoice(booking);
      toast.success(`Invoice-${booking.booking_code}.pdf is being downloaded`);
    } catch (e) {
      toast.error("Failed to generate invoice. Please try again.");
    } finally {
      setTimeout(() => setPdfLoading(false), 1200);
    }
  }, [booking]);

  const handleResendEmail = useCallback(async () => {
    if (!booking || emailSent) return;
    const customer = (booking as any).customers;
    const hotel = (booking as any).hotels;
    if (!customer?.email) {
      toast.error("No email address found for this booking.");
      return;
    }

    setEmailError(null);
    const result = await sendConfirmation(customer.email, {
      customerName: customer.full_name,
      bookingCode: booking.booking_code,
      hotelName: hotel?.name ?? "Emirates Grand Inn",
      roomType: CATEGORY_LABELS[booking.category] ?? booking.category,
      checkIn: fmtDateTime(booking.check_in_date, booking.check_in_time),
      checkOut: fmtDateTime(booking.check_out_date, booking.stay_type === '12_hours' ? (() => {
                 const d = new Date(`${booking.check_in_date}T${booking.check_in_time || "14:00"}:00`);
                 d.setHours(d.getHours() + 12);
                 return d.toTimeString().slice(0, 5);
              })() : '12:00'),
      durationLabel: getDurationLabel(booking.num_days, booking.stay_type),
      numGuests: booking.num_guests,
      numRooms: booking.num_rooms,
      totalAmount: formatINR(booking.total_amount),
      paymentStatus: booking.payment_status ?? "pending",
    });

    if (result.success) {
      setEmailSent(true);
      // useSendEmail hook already toasts success
    } else {
      setEmailError(result.error ?? "Unknown error");
      // useSendEmail hook already toasts the error
    }
  }, [booking, emailSent, sendConfirmation]);

  if (!booking)
    return (
      <WebsiteLayout>
        <div className="container-luxe py-32 text-center text-muted-foreground font-medium">Loading…</div>
      </WebsiteLayout>
    );

  const customer = (booking as any).customers ?? {};
  const hotel = (booking as any).hotels ?? {};
  const cat = CATEGORY_LABELS[booking.category] ?? booking.category;

  return (
    <WebsiteLayout>
      <div className="container-luxe pt-28 pb-20 max-w-2xl">

        {/* ── Success checkmark ── */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="h-20 w-20 rounded-full bg-primary mx-auto flex items-center justify-center mb-8 shadow-lg"
        >
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </motion.div>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-10"
        >
          <div className="h-12 w-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-bold text-4xl mb-3 text-foreground tracking-tight">Reservation Confirmed</h1>
          <p className="text-muted-foreground font-medium">
            Thank you, <span className="text-foreground font-semibold">{customer.full_name}</span>. Your stay awaits.
          </p>
        </motion.div>

        {/* ── Booking Detail Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card shadow-sm border border-border rounded-xl overflow-hidden mb-6"
        >
          {/* Booking reference header */}
          <div className="text-center py-6 px-8 border-b border-border bg-primary/5">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Booking Reference</div>
            <div className="font-extrabold text-3xl text-primary tracking-tight">{booking.booking_code}</div>
          </div>

          {/* Detail rows */}
          <dl className="divide-y divide-border">
            {[
              ["Hotel", hotel.name ?? "—"],
              ["Guest", customer.full_name ?? "—"],
              ["Mobile", customer.mobile ?? "—"],
              ["Email", customer.email ?? "—"],
              ["Room Category", cat],
              ["Check-in", fmtDateTime(booking.check_in_date, booking.check_in_time)],
              ["Check-out", fmtDateTime(booking.check_out_date, booking.stay_type === '12_hours' ? (() => {
                 const d = new Date(`${booking.check_in_date}T${booking.check_in_time || "14:00"}:00`);
                 d.setHours(d.getHours() + 12);
                 return d.toTimeString().slice(0, 5);
              })() : '12:00')],
              ["Duration", getDurationLabel(booking.num_days, booking.stay_type)],
              ["Guests", `${booking.num_guests} Guest${booking.num_guests !== 1 ? "s" : ""}`],
              [getRateLabel(booking.stay_type), formatINR(booking.price_per_night)],
              ["Total Paid", formatINR(booking.total_amount)],
              ["Payment Status", (booking.payment_status ?? "pending").charAt(0).toUpperCase() + (booking.payment_status ?? "pending").slice(1)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-3.5 px-8">
                <dt className="text-sm font-semibold text-muted-foreground">{k}</dt>
                <dd className="text-sm font-bold text-foreground text-right max-w-[60%]">{v}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        {/* ── Action Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid sm:grid-cols-2 gap-4 mb-10"
        >
          {/* Download Invoice */}
          <button
            id="download-invoice-btn"
            onClick={handleDownloadInvoice}
            disabled={pdfLoading}
            className="group relative overflow-hidden bg-primary/5 hover:bg-primary/10 text-primary py-3.5 px-5 text-sm font-semibold rounded-xl border border-primary/20 flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {pdfLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF…
              </>
            ) : (
              <>
                <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                Download Invoice
              </>
            )}
          </button>

          {/* Resend Email Confirmation */}
          <button
            id="resend-email-btn"
            onClick={handleResendEmail}
            disabled={emailLoading || emailSent}
            className={`group relative overflow-hidden py-3.5 px-5 text-sm font-semibold rounded-xl border flex items-center justify-center gap-2.5 transition-all duration-200 disabled:cursor-not-allowed active:scale-[0.98] ${
              emailSent
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800"
                : emailError
                ? "bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200 dark:border-red-800 hover:bg-red-100"
                : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border hover:border-foreground/30"
            }`}
          >
            {emailLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : emailSent ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Email Sent ✓
              </>
            ) : emailError ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                Retry Email
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Resend Confirmation
              </>
            )}
          </button>
        </motion.div>

        {/* Missing API Key Warning */}
        <AnimatePresence>
          {emailError && emailError.includes("RESEND_API_KEY") && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: -16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="mb-8"
            >
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3 text-amber-800 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold mb-1">Email Service Not Configured</p>
                  <p>The email service cannot work until the <code>RESEND_API_KEY</code> secret is added to your Supabase project. The Invoice Download feature remains fully functional.</p>
                </div>
              </div>
            </motion.div>
          )}

          {emailError && emailError.toLowerCase().includes("testing emails") && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: -16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="mb-8"
            >
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5 flex items-start gap-4 text-blue-800 dark:text-blue-300">
                <Info className="h-6 w-6 shrink-0 mt-0.5" />
                <div className="text-sm space-y-3">
                  <p className="font-bold text-base mb-1">Email Service Running in Test Mode</p>
                  <p>This project is currently using Resend's testing environment.</p>
                  <p>Only the verified developer email address can receive emails during development.</p>
                  <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                    <p className="font-semibold mb-1">To enable email delivery to all customers:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Verify a custom domain in Resend.</li>
                      <li>Configure the sender email using the verified domain.</li>
                      <li>Redeploy the Supabase Edge Function.</li>
                    </ul>
                  </div>
                  <p className="font-medium pt-1">This limitation only affects email delivery.<br/>Your booking has been completed successfully.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Home link ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-center"
        >
          <Link
            to="/"
            className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            Return Home →
          </Link>
        </motion.div>

      </div>
    </WebsiteLayout>
  );
}
