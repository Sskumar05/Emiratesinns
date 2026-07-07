import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { Search, Eye, X, Mail, Phone, Calendar, FileSpreadsheet } from "lucide-react";
import { formatINR, CATEGORY_LABELS } from "@/lib/hotel";
import { downloadXlsx, fmtExcelDate } from "@/lib/exportExcel";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/customers")({ component: Customers });

const formatBadgeText = (text: string) => (text || '').replace('_', ' ');

function exportCustomersToExcel(filtered: any[]) {
  if (filtered.length === 0) { toast.error("No data available to export."); return; }
  const headers = [
    "Customer ID", "Customer Name", "Mobile", "Email",
    "Total Bookings", "Total Spend", "Current Stay", "Last Stay", "Status",
  ];
  const rows = filtered.map((c: any) => [
    c.customerId,
    c.full_name ?? "-",
    c.mobile ?? "-",
    c.email ?? "-",
    c.totalBookings,
    formatINR(c.totalSpend),
    c.currentStay,
    c.lastStay,
    c.status,
  ]);
  downloadXlsx([headers, ...rows], "Customers", `Customers_${new Date().toISOString().slice(0, 10)}.xlsx`);
  toast.success("Excel exported successfully.");
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20';
    case 'confirmed': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
    case 'checked_in': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    case 'checked_out': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
    case 'cancelled': return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
    case 'no_show': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
  }
};

function Customers() {
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [hotelF, setHotelF] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  const [viewCustomer, setViewCustomer] = useState<any | null>(null);

  const { data: hotels = [] } = useQuery({
    queryKey: ["hotels"],
    queryFn: async () => (await supabase.from("hotels").select("*")).data ?? [],
  });

  const { data: customersRaw = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await supabase.from("customers").select("*").order("created_at", { ascending: true })).data ?? [],
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["all-bookings-for-cust"],
    queryFn: async () => (await supabase.from("bookings").select("*, hotels(name, slug)").order("created_at", { ascending: false })).data ?? [],
  });

  const enriched = useMemo(() => {
    // customersRaw is sorted ASC by created_at. Assign IDs.
    const mapped = customersRaw.map((c: any, index: number) => {
      const customerId = `CUS-${String(index + 1).padStart(4, '0')}`;
      const cb = bookings.filter((b: any) => b.customer_id === c.id);
      
      const totalBookings = cb.length;
      const totalSpend = cb.reduce((sum: number, b: any) => sum + Number(b.total_amount), 0);
      
      // Calculate Current Stay
      let currentStay = "—";
      if (cb.some((b: any) => b.status === "checked_in")) {
        currentStay = "Checked-In";
      } else if (cb.some((b: any) => b.status === "confirmed" || b.status === "pending")) {
        currentStay = "Upcoming";
      }
      
      // Calculate Last Stay
      const pastStays = cb.filter((b: any) => b.status === "checked_out").map((b: any) => b.check_out_date).sort();
      const lastStayStr = pastStays.length > 0 ? pastStays[pastStays.length - 1] : null;
      let lastStay = "—";
      if (lastStayStr) {
        const d = new Date(lastStayStr);
        lastStay = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); // 01 Jul 2026
      }
      
      const status = totalBookings > 0 ? "Active" : "Inactive";
      
      return {
        ...c,
        customerId,
        totalBookings,
        totalSpend,
        currentStay,
        lastStay,
        status,
        bookings: cb
      };
    });
    
    // Sort by created_at DESC for display
    return mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [customersRaw, bookings]);

  const filtered = useMemo(() => {
    return enriched.filter((c: any) => {
      const queryMatch = !q || 
        c.customerId.toLowerCase().includes(q.toLowerCase()) ||
        c.full_name?.toLowerCase().includes(q.toLowerCase()) || 
        c.mobile?.includes(q) || 
        c.email?.toLowerCase().includes(q.toLowerCase());
        
      const statusMatch = statusF === "all" || c.status.toLowerCase() === statusF.toLowerCase();
      
      const hotelMatch = hotelF === "all" || c.bookings.some((b: any) => b.hotels?.slug === hotelF);
      
      let dateMatch = true;
      if (dateFrom || dateTo) {
        const d = c.created_at.slice(0, 10);
        if (dateFrom && d < dateFrom) dateMatch = false;
        if (dateTo && d > dateTo) dateMatch = false;
      }
      
      return queryMatch && statusMatch && hotelMatch && dateMatch;
    });
  }, [enriched, q, statusF, hotelF, dateFrom, dateTo]);

  return (
    <div className="flex flex-col space-y-6 h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)]">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between shrink-0">
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <select
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            className="bg-card border border-border px-4 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="all">Any Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
        
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full xl:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ID, Name, Mobile, Email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-card border border-border pl-9 pr-4 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <button
            onClick={() => exportCustomersToExcel(filtered)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold rounded-md shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-card border border-border overflow-auto rounded-lg shadow-sm flex-1 min-h-0 custom-scrollbar">
        <table className="w-full text-sm relative">
          <thead className="sticky top-0 z-20 bg-surface text-xs uppercase tracking-wider text-muted-foreground font-semibold shadow-[0_1px_0_0_var(--border)]">
            <tr>
              {[
                "Customer ID",
                "Customer Name",
                "Mobile",
                "Email",
                "Total Bookings",
                "Total Spend",
                "Current Stay",
                "Last Stay",
                "Status",
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
                <td colSpan={10} className="py-12 text-center text-muted-foreground">
                  No customers found matching your criteria.
                </td>
              </tr>
            )}
            {filtered.map((c: any) => (
              <tr key={c.id} className="hover:bg-surface/30 transition-colors">
                <td className="py-3 px-4 text-gold font-medium whitespace-nowrap">{c.customerId}</td>
                <td className="py-3 px-4 font-medium whitespace-nowrap">{c.full_name}</td>
                <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{c.mobile}</td>
                <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{c.email}</td>
                <td className="py-3 px-4 text-center whitespace-nowrap">{c.totalBookings}</td>
                <td className="py-3 px-4 font-medium whitespace-nowrap">{formatINR(c.totalSpend)}</td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {c.currentStay === "Checked-In" ? (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      {c.currentStay}
                    </span>
                  ) : c.currentStay === "Upcoming" ? (
                    <span className="text-blue-500 font-semibold">{c.currentStay}</span>
                  ) : (
                    <span className="text-muted-foreground">{c.currentStay}</span>
                  )}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">{c.lastStay}</td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {c.status === "Active" ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-500/10 text-slate-600 border border-slate-500/20">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <button
                    onClick={() => setViewCustomer(c)}
                    className="flex items-center gap-1.5 bg-surface/50 text-foreground border border-border px-3 py-1.5 rounded hover:border-gold hover:text-gold transition-colors whitespace-nowrap"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Customer Modal */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border bg-surface/30">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-xl uppercase">
                  {viewCustomer.full_name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {viewCustomer.full_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-md">
                      {viewCustomer.customerId}
                    </span>
                    {viewCustomer.status === "Active" ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-600 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewCustomer(null)}
                className="p-2 hover:bg-surface rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contact Details */}
                <div className="bg-surface rounded-lg p-5 border border-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Contact Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{viewCustomer.mobile}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{viewCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Joined {new Date(viewCustomer.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Key Statistics */}
                <div className="bg-surface rounded-lg p-5 border border-border md:col-span-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Key Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-foreground">{viewCustomer.totalBookings}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total Bookings</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gold">{formatINR(viewCustomer.totalSpend)}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total Spend</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {viewCustomer.bookings.reduce((sum: number, b: any) => sum + (b.status === "checked_out" || b.status === "checked_in" ? b.num_days : 0), 0)}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Nights Stayed</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-emerald-500 font-semibold">{viewCustomer.bookings.filter((b: any) => b.status === "checked_out").length}</span> Completed
                    </div>
                    <div>
                      <span className="text-red-500 font-semibold">{viewCustomer.bookings.filter((b: any) => b.status === "cancelled").length}</span> Cancelled
                    </div>
                    <div>
                      <span className="text-orange-500 font-semibold">{viewCustomer.bookings.filter((b: any) => b.status === "no_show").length}</span> No-Show
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking History */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground border-b border-border pb-2">
                  Booking History
                </h3>
                {viewCustomer.bookings.length === 0 ? (
                  <p className="text-muted-foreground text-sm">This customer has no bookings yet.</p>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold">Booking ID</th>
                          <th className="text-left py-3 px-4 font-semibold">Hotel</th>
                          <th className="text-left py-3 px-4 font-semibold">Category</th>
                          <th className="text-left py-3 px-4 font-semibold">Check-In</th>
                          <th className="text-left py-3 px-4 font-semibold">Total</th>
                          <th className="text-left py-3 px-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {viewCustomer.bookings.map((b: any) => (
                          <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-3 px-4 font-medium text-gold">{b.booking_code}</td>
                            <td className="py-3 px-4">{b.hotels?.name}</td>
                            <td className="py-3 px-4">{CATEGORY_LABELS[b.category as keyof typeof CATEGORY_LABELS] || b.category}</td>
                            <td className="py-3 px-4 text-muted-foreground">{b.check_in_date}</td>
                            <td className="py-3 px-4 font-medium">{formatINR(b.total_amount)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full ${getStatusBadgeClass(b.status)}`}>
                                {formatBadgeText(b.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
            
            <div className="p-6 border-t border-border flex justify-end">
              <button
                onClick={() => setViewCustomer(null)}
                className="px-6 py-2 bg-surface hover:bg-surface/80 text-foreground rounded-md transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
