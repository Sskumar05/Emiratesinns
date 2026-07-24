import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CheckCircle, Printer, Download, Mail, ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { getOrGenerateInvoicePDF } from "@/lib/invoiceBackend";
import { formatINR } from "@/lib/hotel";

type Search = {
  bookingId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  amountReceived?: number;
  balanceReturn?: number;
};

export const Route = createFileRoute("/admin/booking-success")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    bookingId: typeof s.bookingId === "string" ? s.bookingId : undefined,
    paymentMethod: typeof s.paymentMethod === "string" ? s.paymentMethod : undefined,
    paymentStatus: typeof s.paymentStatus === "string" ? s.paymentStatus : undefined,
    amountReceived: typeof s.amountReceived === "number" ? s.amountReceived : undefined,
    balanceReturn: typeof s.balanceReturn === "number" ? s.balanceReturn : undefined,
  }),
  component: BookingSuccessPage,
});

function BookingSuccessPage() {
  const search = Route.useSearch();
  const nav = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!search.bookingId) {
      nav({ to: "/admin/bookings" });
    }
  }, [search, nav]);

  if (!search.bookingId) return null;

  async function handleDownloadInvoice() {
    setIsGenerating(true);
    try {
      const result = await getOrGenerateInvoicePDF(search.bookingId!);
      const link = document.createElement("a");
      link.href = result.pdfDataUrl;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Invoice downloaded successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to download invoice");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handlePrintInvoice() {
    setIsGenerating(true);
    try {
      const result = await getOrGenerateInvoicePDF(search.bookingId!);
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${result.filename}</title>
              <style>
                body { margin: 0; padding: 0; }
                iframe { width: 100%; height: 100vh; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${result.pdfDataUrl}"></iframe>
              <script>
                setTimeout(() => {
                  window.print();
                }, 1000);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        toast.error("Please allow popups to print");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to print invoice");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto flex flex-col items-center text-center mt-12">
      <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold font-display text-foreground mb-2">Booking Created Successfully!</h1>
      <p className="text-muted-foreground mb-10 max-w-lg">
        The walk-in booking has been recorded. The room is now occupied and the invoice is ready.
      </p>

      {search.paymentMethod === 'cash' && (search.balanceReturn || 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg mb-10 max-w-md w-full">
          <p className="text-amber-800 text-sm font-semibold uppercase tracking-wider mb-2">Cash Change Return</p>
          <p className="text-4xl font-bold text-amber-900">{formatINR(search.balanceReturn || 0)}</p>
          <p className="text-sm text-amber-700 mt-2">Amount Received: {formatINR(search.amountReceived || 0)}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-12">
        <button 
          onClick={handlePrintInvoice} 
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 bg-card border border-border px-6 py-4 rounded-lg hover:border-gold hover:text-gold transition-colors font-semibold disabled:opacity-50"
        >
          <Printer className="h-5 w-5" /> Print Invoice
        </button>
        <button 
          onClick={handleDownloadInvoice}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 bg-card border border-border px-6 py-4 rounded-lg hover:border-gold hover:text-gold transition-colors font-semibold disabled:opacity-50"
        >
          <Download className="h-5 w-5" /> Download Invoice
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center border-t border-border pt-8 w-full">
        <Link to="/admin/new-booking" className="flex items-center gap-2 text-gold hover:text-gold-hover font-medium">
          <Plus className="h-4 w-4" /> New Booking
        </Link>
        <span className="text-border hidden sm:inline">|</span>
        <Link to="/admin/bookings" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Bookings
        </Link>
      </div>
    </div>
  );
}
