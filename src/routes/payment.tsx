import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABELS, formatINR, fmtDateTime, getDurationLabel } from "@/lib/hotel";
import { sendBookingConfirmation } from "@/lib/email";
import { getOrGenerateInvoicePDF } from "@/lib/invoiceBackend";
import { Lock, CreditCard, ShieldCheck, Check, Loader2, Download } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState, useCallback } from "react";

type Search = { bookingId?: string };

export const Route = createFileRoute("/payment")({
  validateSearch: (s: Record<string, unknown>): Search => ({ bookingId: typeof s.bookingId === "string" ? s.bookingId : undefined }),
  component: Payment,
});

function Payment() {
  const { bookingId } = Route.useSearch();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { data: booking } = useQuery({
    queryKey: ["booking", bookingId],
    enabled: !!bookingId,
    queryFn: async () => (await supabase.from("bookings").select("*, hotels(name), customers(*)").eq("id", bookingId!).maybeSingle()).data,
  });

  const handleDownloadInvoice = useCallback(async () => {
    if (!booking || pdfLoading) return;
    setPdfLoading(true);
    try {
      // 1. Request existing invoice PDF from backend (generates once if missing, never duplicates)
      const pdfResult = await getOrGenerateInvoicePDF(booking.id);

      // 2. Trigger browser download of valid PDF document
      const link = document.createElement("a");
      link.href = pdfResult.pdfDataUrl;
      link.download = pdfResult.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${pdfResult.filename} downloaded successfully`);
    } catch (e) {
      console.error("[payment] Backend invoice download error:", e);
      toast.error("Unable to download invoice. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }, [booking, pdfLoading]);

  if (!bookingId) return <WebsiteLayout><div className="container-luxe py-32 text-center font-medium">Invalid payment session.</div></WebsiteLayout>;
  if (!booking) return <WebsiteLayout><div className="container-luxe py-32 text-center text-muted-foreground font-medium">Loading…</div></WebsiteLayout>;

  const isAlreadyPaid = booking.payment_status === "paid" || completed;

  async function payNow() {
    if (!booking || processing || isAlreadyPaid) return;
    setProcessing(true);
    try {
      const payRef = `RZP_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      
      // 1. Complete booking using existing booking flow logic
      const { error } = await supabase.from("bookings").update({
        status: "confirmed", payment_status: "paid", payment_ref: payRef,
      }).eq("id", bookingId!);
      if (error) throw error;

      // 2. Generate PDF invoice on backend & store in database invoices table
      let pdfResult = null;
      try {
        pdfResult = await getOrGenerateInvoicePDF(bookingId!);
      } catch (pdfErr) {
        console.warn("[payment] Backend PDF generation warning:", pdfErr);
      }

      // 3. Automatically send booking confirmation email with attached backend PDF invoice
      const customer = (booking as any)?.customers;
      const hotel = (booking as any)?.hotels;
      
      try {
        await sendBookingConfirmation(customer?.email || "pending_resolution@emirates.internal", {
          bookingId: booking.id,
          customerName: customer?.full_name || "Valued Guest",
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
          numDays: booking.num_days,
          totalAmount: formatINR(booking.total_amount),
          paymentStatus: "paid",
          pdfBase64: pdfResult?.pdfBase64,
        });
      } catch (emailErr) {
        console.warn("[payment] Automatic confirmation email failed or queued:", emailErr);
      }

      await queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      setCompleted(true);
      toast.success("Payment successful");
    } catch (e: any) {
      toast.error(e.message ?? "Payment failed");
    } finally {
      setProcessing(false);
    }
  }

  // ─── Minimal "Payment Successful" / "Thank You" View ───────────────────────
  if (isAlreadyPaid) {
    return (
      <WebsiteLayout>
        <div className="container-luxe pt-28 pb-20 max-w-xl text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="bg-card shadow-lg border border-border p-8 sm:p-12 rounded-2xl flex flex-col items-center"
          >
            {/* Large success check icon */}
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mb-6 shadow-md">
              <Check className="h-10 w-10 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
            </div>

            {/* Heading */}
            <h1 className="font-bold text-3xl sm:text-4xl text-foreground tracking-tight mb-2">
              Payment Successful!
            </h1>

            {/* Subheading */}
            <p className="text-gold font-semibold text-lg mb-6">
              Thank you for choosing Emirates.
            </p>

            {/* Message */}
            <p className="text-foreground font-semibold text-base mb-2">
              Your reservation has been confirmed successfully.
            </p>

            {/* Secondary message */}
            {/* <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-3 flex items-center justify-center gap-1.5">
              <Check className="h-4 w-4 stroke-[2.5]" />
              A booking confirmation email has been sent to your registered email address.
            </p> */}

            {/* Small note */}
            <p className="text-xs text-muted-foreground mb-8">
              You can download your invoice below or find it in your confirmation email.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
              {/* Primary Button: Download Invoice */}
              <button
                id="download-invoice-btn"
                onClick={handleDownloadInvoice}
                disabled={pdfLoading}
                className="w-full sm:w-1/2 bg-primary text-white py-3.5 px-3 text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pdfLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing Invoice...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download Invoice
                  </>
                )}
              </button>

              {/* Secondary Button: Return Home */}
              <Link
                to="/"
                className="w-full sm:w-1/2 bg-muted hover:bg-muted/80 text-foreground py-3.5 px-6 text-sm font-semibold rounded-xl transition-all duration-200 border border-border flex items-center justify-center font-semibold text-sm"
              >
                Return Home
              </Link>
            </div>
          </motion.div>
        </div>
      </WebsiteLayout>
    );
  }

  // Processing state view while payment runs
  if (processing) {
    return (
      <WebsiteLayout>
        <div className="container-luxe pt-28 pb-20 max-w-xl text-center">
          <div className="bg-card shadow-lg border border-border p-8 sm:p-12 rounded-2xl flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-6" />
            <h2 className="font-bold text-2xl text-foreground mb-2">Processing Payment…</h2>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your reservation.</p>
          </div>
        </div>
      </WebsiteLayout>
    );
  }

  return (
    <WebsiteLayout>
      <div className="container-luxe pt-28 pb-20 max-w-2xl">
        <div className="text-center mb-10">
          <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-bold text-4xl text-foreground tracking-tight">Secure Payment</h1>
          <p className="text-sm font-medium text-muted-foreground mt-3">Powered by Razorpay (integration-ready)</p>
        </div>
        <div className="bg-card shadow-sm border border-border p-8 rounded-lg">
          <div className="flex justify-between mb-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gold">{(booking as any).hotels?.name}</div>
              <div className="text-sm font-medium text-foreground mt-2">Booking {booking.booking_code}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Amount Due</div>
              <div className="font-bold text-3xl text-primary">{formatINR(booking.total_amount)}</div>
            </div>
          </div>
          
          <div className="bg-muted/30 border border-border rounded-lg p-5 mb-8 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Check-in</span>
              <span className="font-semibold">{fmtDateTime(booking.check_in_date, booking.check_in_time)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Check-out</span>
              <span className="font-semibold">{fmtDateTime(booking.check_out_date, booking.stay_type === '12_hours' ? (() => {
                 const d = new Date(`${booking.check_in_date}T${booking.check_in_time || "14:00"}:00`);
                 d.setHours(d.getHours() + 12);
                 return d.toTimeString().slice(0, 5);
              })() : '12:00')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold">{getDurationLabel(booking.num_days, booking.stay_type)}</span>
            </div>
          </div>
          
          <div className="bg-background border border-dashed border-border rounded-md p-6 mb-8 text-center text-sm font-medium text-muted-foreground">
            <CreditCard className="h-6 w-6 mx-auto text-primary mb-3" />
            Razorpay checkout will open here once API keys are configured. For now, click below to simulate a successful payment.
          </div>
          <button onClick={payNow} disabled={processing} className="w-full bg-gold text-white font-semibold py-4 text-sm rounded-md shadow-md hover:bg-gold-hover transition disabled:opacity-60 disabled:cursor-not-allowed">
            Pay {formatINR(booking.total_amount)} Securely
          </button>
          <div className="flex items-center justify-center gap-2 mt-6 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" /> 256-bit SSL secured
          </div>
        </div>
      </div>
    </WebsiteLayout>
  );
}


