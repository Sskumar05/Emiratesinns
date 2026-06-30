import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABELS, formatINR } from "@/lib/hotel";
import { useState, useMemo } from "react";
import { Search, Eye, X } from "lucide-react";

export const Route = createFileRoute("/admin/cancelled")({ component: Cancelled });

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'cancelled': return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
    case 'no_show': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
  }
};

const getPaymentBadgeClass = (status: string) => {
  switch (status) {
    case 'paid': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    case 'pending': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20';
    case 'partial': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20';
    case 'refunded': return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
  }
};

const formatBadgeText = (text: string) => (text || '').replace('_', ' ');

const getCancelledBy = (reason?: string) => {
  if (!reason) return "System";
  const lower = reason.toLowerCase();
  if (lower.includes("admin") || lower.includes("no show") || lower.includes("no-show")) return "Admin";
  if (lower.includes("customer")) return "Customer";
  return "System";
};

const formatDateTime = (iso?: string) => {
  if (!iso) return { dateStr: "—", timeStr: "" };
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); // e.g. 30 Jun 2026
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); // e.g. 4:24 PM
  return { dateStr, timeStr };
};

function Cancelled() {
  const [hotelF, setHotelF] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewBooking, setViewBooking] = useState<any | null>(null);

  const { data: hotels = [] } = useQuery({
    queryKey: ["hotels"],
    queryFn: async () => (await supabase.from("hotels").select("*")).data ?? [],
  });

  const { data: allRooms = [] } = useQuery({
    queryKey: ["all-rooms"],
    queryFn: async () => (await supabase.from("rooms").select("id, room_number")).data ?? [],
  });

  const roomNumberMap = useMemo(() => {
    const map: Record<string, string> = {};
    allRooms.forEach((r: any) => {
      map[r.id] = r.room_number;
    });
    return map;
  }, [allRooms]);

  const resolveRoomNumbers = (roomIds: any) => {
    if (!roomIds || !Array.isArray(roomIds) || roomIds.length === 0) {
      return "-";
    }
    const resolved = roomIds
      .map((id: string) => roomNumberMap[id])
      .filter(Boolean);
    
    if (resolved.length === 0) return "-";
    return resolved.join(", ");
  };

  const { data: bookings = [] } = useQuery({
    queryKey: ["cancelled"],
    queryFn: async () => (await supabase.from("bookings").select("*, hotels(name, slug), customers(*)").in("status", ["cancelled", "no_show"]).order("cancelled_at", { ascending: false })).data ?? [],
  });

  const filtered = useMemo(() => {
    return bookings.filter((b: any) => {
      const matchHotel = hotelF === "all" || b.hotels?.slug === hotelF;
      const matchStatus = statusF === "all" || b.status === statusF;
      const q = searchQuery.toLowerCase();
      
      const roomsDisplay = resolveRoomNumbers(b.assigned_room_ids).toLowerCase();
      
      const matchSearch =
        !q ||
        (b.booking_code || "").toLowerCase().includes(q) ||
        (b.customers?.full_name || "").toLowerCase().includes(q) ||
        (b.customers?.mobile || "").toLowerCase().includes(q) ||
        roomsDisplay.includes(q);

      let matchDate = true;
      if (dateFrom || dateTo) {
        const cancelDate = b.cancelled_at ? b.cancelled_at.slice(0, 10) : "";
        if (cancelDate) {
          if (dateFrom && cancelDate < dateFrom) matchDate = false;
          if (dateTo && cancelDate > dateTo) matchDate = false;
        } else {
          matchDate = false;
        }
      }

      return matchHotel && matchStatus && matchSearch && matchDate;
    });
  }, [bookings, hotelF, statusF, searchQuery, dateFrom, dateTo, roomNumberMap]);

  return (
    <div className="flex flex-col space-y-6 h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)]">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between shrink-0">
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
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
          <select
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            className="bg-card border border-border px-4 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="all">Any Status</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
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
        
        <div className="relative w-full xl:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search ID, Name, Mobile, Room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border pl-9 pr-4 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
      </div>

      <div className="bg-card border border-border overflow-auto rounded-lg shadow-sm flex-1 min-h-0 custom-scrollbar">
        <table className="w-full text-sm relative">
          <thead className="sticky top-0 z-20 bg-surface text-xs uppercase tracking-wider text-muted-foreground font-semibold shadow-[0_1px_0_0_var(--border)]">
            <tr>
              {[
                "Booking ID",
                "Customer",
                "Hotel",
                "Room(s)",
                "Check-In",
                "Check-Out",
                "Total",
                "Status",
                "Cancelled By",
                "Cancelled At",
                "Reason",
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
                <td colSpan={12} className="py-12 text-center text-muted-foreground">
                  No cancelled bookings found matching your criteria.
                </td>
              </tr>
            )}
            {filtered.map((b: any) => {
              const roomsDisplay = resolveRoomNumbers(b.assigned_room_ids);
              const cancelledBy = getCancelledBy(b.cancellation_reason);
              const { dateStr, timeStr } = formatDateTime(b.cancelled_at);

              return (
                <tr key={b.id} className="hover:bg-surface/30 transition-colors">
                  <td className="py-3 px-4 text-gold font-medium whitespace-nowrap">{b.booking_code}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div>{b.customers?.full_name}</div>
                    <div className="text-xs text-muted-foreground">{b.customers?.mobile}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">{b.hotels?.name}</td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-muted-foreground">{roomsDisplay}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{b.check_in_date}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{b.check_out_date}</td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium">{formatINR(b.total_amount)}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full ${getStatusBadgeClass(b.status)}`}>
                      {formatBadgeText(b.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium">{cancelledBy}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {dateStr !== "—" ? (
                      <div className="flex flex-col">
                        <span>{dateStr}</span>
                        <span className="text-xs text-muted-foreground">{timeStr}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate" title={b.cancellation_reason}>
                    {b.cancellation_reason || "—"}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => setViewBooking(b)}
                      className="flex items-center gap-1.5 bg-surface/50 text-foreground border border-border px-3 py-1.5 rounded hover:border-gold hover:text-gold transition-colors whitespace-nowrap"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View Booking Modal */}
      {viewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
                Booking Details
                <span className="text-sm font-normal text-gold bg-gold/10 px-3 py-1 rounded-full">
                  {viewBooking.booking_code}
                </span>
              </h2>
              <button
                onClick={() => setViewBooking(null)}
                className="p-2 hover:bg-surface rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{viewBooking.customers?.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mobile:</span>
                      <span className="font-medium">{viewBooking.customers?.mobile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{viewBooking.customers?.email || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID Proof:</span>
                      <span className="font-medium">{viewBooking.customers?.id_proof_number || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Reservation Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                    Reservation Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hotel:</span>
                      <span className="font-medium text-gold">{viewBooking.hotels?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Category:</span>
                      <span className="font-medium">{CATEGORY_LABELS[viewBooking.category as keyof typeof CATEGORY_LABELS] || viewBooking.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full ${getStatusBadgeClass(viewBooking.status)}`}>
                        {formatBadgeText(viewBooking.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Booking Date:</span>
                      <span className="font-medium">{new Date(viewBooking.created_at).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Stay Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                    Stay Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-In:</span>
                      <span className="font-medium">{viewBooking.check_in_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-Out:</span>
                      <span className="font-medium">{viewBooking.check_out_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nights:</span>
                      <span className="font-medium">{viewBooking.num_days} Night(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guests:</span>
                      <span className="font-medium">{viewBooking.num_guests} Guest(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rooms Booked:</span>
                      <span className="font-medium">{viewBooking.num_rooms} Room(s)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Assigned Room(s):</span>
                      <span className="font-semibold bg-surface px-2 py-1 rounded">
                        {resolveRoomNumbers(viewBooking.assigned_room_ids)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                    Payment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="font-semibold text-lg">{formatINR(viewBooking.total_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full ${getPaymentBadgeClass(viewBooking.payment_status)}`}>
                        {formatBadgeText(viewBooking.payment_status || 'pending')}
                      </span>
                    </div>
                    {viewBooking.payment_id && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID:</span>
                        <span className="font-mono text-xs">{viewBooking.payment_id}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Cancellation Details */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-red-500 border-b border-border pb-2">
                    Cancellation Information
                  </h3>
                  <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cancelled By:</span>
                      <span className="font-medium text-foreground">{getCancelledBy(viewBooking.cancellation_reason)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cancelled At:</span>
                      <span className="font-medium">
                        {viewBooking.cancelled_at ? (
                          <>
                            {formatDateTime(viewBooking.cancelled_at).dateStr} at {formatDateTime(viewBooking.cancelled_at).timeStr}
                          </>
                        ) : "—"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Reason:</span>
                      <span className="font-medium">{viewBooking.cancellation_reason || "—"}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end">
              <button
                onClick={() => setViewBooking(null)}
                className="px-6 py-2 bg-surface hover:bg-surface/80 text-foreground rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
