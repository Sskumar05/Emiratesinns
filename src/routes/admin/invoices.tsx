import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/hotel";
import { Download, Mail, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import { useSendEmail } from "@/hooks/useSendEmail";
import { CATEGORY_LABELS } from "@/lib/hotel";
import { downloadInvoice } from "@/lib/invoicePdf";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/admin/invoices")({ component: Invoices });

const getPaymentBadgeClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid': return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
    case 'partial': return 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20';
    case 'unpaid': return 'bg-red-500/10 text-red-600 border border-red-500/20';
    case 'refunded': return 'bg-slate-500/10 text-slate-600 border border-slate-500/20';
    default: return 'bg-gray-500/10 text-gray-600 border border-gray-500/20';
  }
};

const formatBadgeText = (text: string) => (text || '').replace('_', ' ');

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); // 30 Jun 2026
};

function Invoices() {
  const { sendInvoice, loading } = useSendEmail();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [hotelF, setHotelF] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: hotels = [] } = useQuery({
    queryKey: ["hotels"],
    queryFn: async () => (await supabase.from("hotels").select("*")).data ?? [],
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () =>
      (
        await supabase
          .from("invoices")
          .select(
            `*, 
            bookings(
              booking_code, check_in_date, check_out_date, num_days, num_guests,
              category, price_per_night, total_amount, payment_status, created_at,
              hotels(name, slug)
            ), 
            customers(full_name, email, mobile)`
          )
          .order("issued_at", { ascending: false })
      ).data ?? [],
  });

  const filtered = useMemo(() => {
    return invoices.filter((inv: any) => {
      const queryMatch = !q || 
        (inv.invoice_number || "").toLowerCase().includes(q.toLowerCase()) ||
        (inv.bookings?.booking_code || "").toLowerCase().includes(q.toLowerCase()) ||
        (inv.customers?.full_name || "").toLowerCase().includes(q.toLowerCase());
        
      const statusMatch = statusF === "all" || (inv.status || "").toLowerCase() === statusF.toLowerCase();
      
      const hotelMatch = hotelF === "all" || inv.bookings?.hotels?.slug === hotelF;
      
      let dateMatch = true;
      if (dateFrom || dateTo) {
        const d = inv.issued_at ? inv.issued_at.slice(0, 10) : "";
        if (d) {
          if (dateFrom && d < dateFrom) dateMatch = false;
          if (dateTo && d > dateTo) dateMatch = false;
        } else {
          dateMatch = false;
        }
      }
      
      return queryMatch && statusMatch && hotelMatch && dateMatch;
    });
  }, [invoices, q, statusF, hotelF, dateFrom, dateTo]);

  async function handleSendInvoiceEmail(inv: any) {
    if (!inv.customers?.email) {
      toast.error("Customer email not found");
      return;
    }
    const booking = inv.bookings;
    await sendInvoice(inv.customers.email, {
      customerName: inv.customers.full_name,
      invoiceNumber: inv.invoice_number,
      bookingCode: booking?.booking_code ?? "",
      hotelName: booking?.hotels?.name ?? "Emirates Grand Inn",
      roomType: CATEGORY_LABELS[booking?.category as keyof typeof CATEGORY_LABELS] ?? booking?.category ?? "",
      checkIn: booking?.check_in_date ?? "",
      checkOut: booking?.check_out_date ?? "",
      numDays: booking?.num_days ?? 1,
      amount: formatINR(inv.amount),
      taxAmount: formatINR(inv.tax_amount ?? 0),
      totalAmount: formatINR((inv.amount ?? 0) + (inv.tax_amount ?? 0)),
      issuedAt: new Date(inv.issued_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      paymentStatus: inv.status,
    });
  }

  async function handleDownloadPDF(inv: any) {
    if (downloadingId === inv.id) return;
    setDownloadingId(inv.id);
    try {
      downloadInvoice(inv);
      toast.success(`Invoice-${inv.invoice_number}.pdf is being generated`);
    } catch (e) {
      toast.error("Failed to generate invoice PDF. Please try again.");
    } finally {
      setTimeout(() => setDownloadingId(null), 1500);
    }
  }

  return (
    <div className="flex flex-col space-y-6 h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)]">
      
      {/* Filters Toolbar */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between shrink-0">
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <select
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            className="bg-card border border-border px-4 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="all">Any Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={hotelF}
            onChange={(e) => setHotelF(e.target.value)}
            className="bg-card border border-border px-4 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="all">All Hotels</option>
            {hotels.map((h: any) => (
              <option key={h.id} value={h.slug}>
                {h.name}
              </option>
            ))}
          </select>
          {/* <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-card border border-border px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-card border border-border px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div> */}
        </div>
        
        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Invoice No, Booking ID, Customer..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-card border border-border pl-9 pr-4 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-card border border-border overflow-auto rounded-lg shadow-sm flex-1 min-h-0 custom-scrollbar">
        <table className="w-full text-sm relative">
          <thead className="sticky top-0 z-20 bg-surface text-xs uppercase tracking-wider text-muted-foreground font-semibold shadow-[0_1px_0_0_var(--border)]">
            <tr>
              {[
                "Invoice No",
                "Booking ID",
                "Customer",
                "Hotel",
                "Amount",
                "Payment Status",
                "Invoice Date",
                "Actions",
              ].map((h) => (
                <th key={h} className="text-left py-4 px-4 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  No invoices found matching your criteria.
                </td>
              </tr>
            )}
            {filtered.map((inv: any) => (
              <tr key={inv.id} className="hover:bg-surface/30 transition-colors">
                <td className="py-3 px-4 text-gold font-medium whitespace-nowrap">{inv.invoice_number}</td>
                <td className="py-3 px-4 whitespace-nowrap">{inv.bookings?.booking_code}</td>
                <td className="py-3 px-4 whitespace-nowrap font-medium">{inv.customers?.full_name}</td>
                <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">{inv.bookings?.hotels?.name}</td>
                <td className="py-3 px-4 whitespace-nowrap font-medium">{formatINR(inv.amount)}</td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full ${getPaymentBadgeClass(inv.status)}`}
                  >
                    {formatBadgeText(inv.status)}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                  {formatDate(inv.issued_at)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex gap-2 items-center">
                    <button
                      title="View Invoice"
                      onClick={() => toast.info("PDF preview coming soon")}
                      className="flex items-center justify-center p-1.5 rounded bg-surface/50 border border-border text-foreground hover:border-gold hover:text-gold transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      title="Download PDF"
                      disabled={downloadingId === inv.id}
                      onClick={() => handleDownloadPDF(inv)}
                      className="flex items-center justify-center p-1.5 rounded bg-surface/50 border border-border text-foreground hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-wait"
                    >
                      <Download className={`h-4 w-4 ${downloadingId === inv.id ? "animate-bounce" : ""}`} />
                    </button>
                    <button
                      title="Email Invoice"
                      disabled={loading}
                      onClick={() => handleSendInvoiceEmail(inv)}
                      className="flex items-center justify-center p-1.5 rounded bg-surface/50 border border-border text-foreground hover:border-gold hover:text-gold transition-colors disabled:opacity-40"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
