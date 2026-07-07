import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Users, LogIn, LogOut, Percent, BedDouble } from "lucide-react";

export const Route = createFileRoute("/admin/calendar")({ component: CalendarPage });

function CalendarPage() {
  const [hotelF, setHotelF] = useState("all");
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: hotels = [] } = useQuery({ queryKey: ["hotels"], queryFn: async () => (await supabase.from("hotels").select("*")).data ?? [] });
  const { data: rooms = [] } = useQuery({ queryKey: ["calendar-rooms"], queryFn: async () => (await supabase.from("rooms").select("*, hotels(slug)")).data ?? [] });
  const { data: bookings = [] } = useQuery({ 
    queryKey: ["calendar-bookings"], 
    queryFn: async () => (await supabase.from("bookings").select("*, hotels(slug), customers(full_name)").in("status", ["confirmed", "checked_in"])).data ?? [] 
  });

  const filteredRooms = rooms.filter((r: any) => hotelF === "all" || r.hotels?.slug === hotelF);
  const totalRooms = filteredRooms.length;

  const roomMap = useMemo(() => {
    const map: Record<string, string> = {};
    rooms.forEach((r: any) => { map[r.id] = r.room_number; });
    return map;
  }, [rooms]);

  const filteredBookings = bookings.filter((b: any) => hotelF === "all" || b.hotels?.slug === hotelF);

  const getOccupiedCount = (dateStr: string) => {
    const dayStart = new Date(`${dateStr}T00:00:00`).getTime();
    const dayEnd = new Date(`${dateStr}T23:59:59`).getTime();

    return filteredBookings.filter((b: any) => {
      const bStart = new Date(`${b.check_in_date}T${b.check_in_time || "14:00"}:00`).getTime();
      let bEnd;
      if (b.stay_type === "12_hours") {
        const d = new Date(bStart);
        d.setHours(d.getHours() + 12);
        bEnd = d.getTime();
      } else {
        bEnd = new Date(`${b.check_out_date}T12:00:00`).getTime();
      }
      return bStart < dayEnd && bEnd > dayStart;
    }).reduce((sum: number, b: any) => sum + (b.num_rooms ?? 1), 0);
  };

  // --- Summary Metrics ---
  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  
  // Format cursor to yyyy-mm to match check_in_date for current month bookings
  const cursorYear = cursor.getFullYear();
  const cursorMonthStr = String(cursor.getMonth() + 1).padStart(2, '0');
  const currentMonthPrefix = `${cursorYear}-${cursorMonthStr}`;
  
  const totalBookingsMonth = filteredBookings.filter((b: any) => (b.check_in_date || "").startsWith(currentMonthPrefix)).length;
  const todayCheckIns = filteredBookings.filter((b: any) => b.check_in_date === todayStr).length;
  const todayCheckOuts = filteredBookings.filter((b: any) => b.check_out_date === todayStr).length;
  const todayOccupied = getOccupiedCount(todayStr);
  const occupancyPct = totalRooms > 0 ? Math.round((todayOccupied / totalRooms) * 100) : 0;

  // --- Calendar Grid Logic ---
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const firstDow = start.getDay();
  const days: { date: string; day: number }[] = [];
  
  for (let i = 0; i < firstDow; i++) days.push({ date: "", day: 0 });
  for (let d = 1; d <= daysInMonth; d++) {
    const dtStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ date: dtStr, day: d });
  }

  if (view === "week") {
    const today = new Date();
    const wk: { date: string; day: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date(today); 
      dt.setDate(today.getDate() - today.getDay() + i);
      const dtStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      wk.push({ date: dtStr, day: dt.getDate() });
    }
    days.length = 0; days.push(...wk);
  }

  // --- Modal Logic ---
  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return [];
    const dayStart = new Date(`${selectedDate}T00:00:00`).getTime();
    const dayEnd = new Date(`${selectedDate}T23:59:59`).getTime();

    return filteredBookings.filter((b: any) => {
      const bStart = new Date(`${b.check_in_date}T${b.check_in_time || "14:00"}:00`).getTime();
      let bEnd;
      if (b.stay_type === "12_hours") {
        const d = new Date(bStart);
        d.setHours(d.getHours() + 12);
        bEnd = d.getTime();
      } else {
        bEnd = new Date(`${b.check_out_date}T12:00:00`).getTime();
      }
      return bStart < dayEnd && bEnd > dayStart;
    });
  }, [selectedDate, filteredBookings]);

  const selectedDateCheckIns = useMemo(() => {
    if (!selectedDate) return [];
    return filteredBookings.filter((b: any) => b.check_in_date === selectedDate);
  }, [selectedDate, filteredBookings]);

  const selectedDateCheckOuts = useMemo(() => {
    if (!selectedDate) return [];
    return filteredBookings.filter((b: any) => b.check_out_date === selectedDate);
  }, [selectedDate, filteredBookings]);

  const selectedDateBookedCount = getOccupiedCount(selectedDate ?? "");
  const selectedDateAvailableCount = Math.max(0, totalRooms - selectedDateBookedCount);

  // --- Helpers ---
  const getCellColor = (avail: number, total: number) => {
    if (total === 0) return "bg-surface border-border text-muted-foreground opacity-50";
    if (avail === 0) return "bg-red-500/10 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/20";
    const pct = (avail / total) * 100;
    if (pct <= 20) return "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/20";
    return "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/20";
  };
  
  const getDotColor = (avail: number, total: number) => {
    if (total === 0) return "bg-gray-400";
    if (avail === 0) return "bg-red-500";
    if ((avail / total) * 100 <= 20) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const resolveRooms = (roomIds: string[]) => {
    if (!roomIds || !roomIds.length) return "Unassigned";
    return roomIds.map(id => roomMap[id]).filter(Boolean).join(", ");
  };

  return (
    <div className="flex flex-col space-y-8 min-h-0">
      
      {/* --- Summary Cards --- */}
      {/* <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Rooms", value: totalRooms, icon: BedDouble },
          { label: "Month Bookings", value: totalBookingsMonth, icon: CalendarIcon },
          { label: "Today's Check-ins", value: todayCheckIns, icon: LogIn },
          { label: "Today's Check-outs", value: todayCheckOuts, icon: LogOut },
          { label: "Today's Occupancy", value: `${occupancyPct}%`, icon: Percent, accent: occupancyPct > 80 ? "text-emerald-500" : "text-foreground" },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.accent || 'text-foreground'}`}>{s.value}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center">
              <s.icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div> */}

      {/* --- Toolbar --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setHotelF("all")} 
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${hotelF === "all" ? "bg-gold text-white shadow-md shadow-gold/20" : "bg-surface text-muted-foreground hover:bg-surface/80"}`}
          >
            All Hotels
          </button>
          {hotels.map((h: any) => (
            <button 
              key={h.id} 
              onClick={() => setHotelF(h.slug)} 
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${hotelF === h.slug ? "bg-gold text-white shadow-md shadow-gold/20" : "bg-surface text-muted-foreground hover:bg-surface/80"}`}
            >
              {h.name}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 bg-surface p-1 rounded-lg border border-border">
          <div className="flex gap-1">
            <button 
              onClick={() => setView("month")} 
              className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${view === "month" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Month
            </button>
            <button 
              onClick={() => setView("week")} 
              className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${view === "week" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Week
            </button>
          </div>
          
          {view === "month" && (
            <div className="flex items-center gap-3 pr-2 border-l border-border pl-4">
              <button 
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} 
                className="p-1 hover:bg-card rounded transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold min-w-[120px] text-center">
                {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button 
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} 
                className="p-1 hover:bg-card rounded transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Calendar Grid --- */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1">
        <div className="grid grid-cols-7 border-b border-border bg-surface">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground py-4">
              {d}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((d, i) => {
            if (!d.date) return <div key={i} className="min-h-[120px] border-b border-r border-border bg-surface/30" />;
            
            const booked = getOccupiedCount(d.date);
            const avail = Math.max(0, totalRooms - booked);
            const cellColor = getCellColor(avail, totalRooms);
            
            const isToday = d.date === todayStr;

            return (
              <div 
                key={i} 
                onClick={() => setSelectedDate(d.date)}
                className={`min-h-[120px] border-b border-r border-border p-3 flex flex-col transition-all cursor-pointer ${cellColor} ${isToday ? 'ring-2 ring-gold ring-inset' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${isToday ? 'bg-gold text-white px-2 py-0.5 rounded-full' : 'text-foreground'}`}>
                    {d.day}
                  </span>
                </div>
                
                {totalRooms > 0 && (
                  <div className="mt-auto space-y-1.5 flex flex-col">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Available
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">{avail}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-red-700 dark:text-red-400">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span> Booked
                      </span>
                      <span className="text-red-700 dark:text-red-400 font-bold">{booked}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Legend --- */}
      <div className="flex justify-center gap-8 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" /> Plenty Available</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500 shadow-sm" /> Limited Availability ({"<"} 20%)</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500 shadow-sm" /> Fully Booked</span>
      </div>

      {/* --- Modal Popup --- */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-surface/30">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white ${getDotColor(selectedDateAvailableCount, totalRooms)} shadow-md`}>
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {new Date(selectedDate).toLocaleDateString("en-US", { weekday: 'long', month: "long", day: 'numeric', year: "numeric" })}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-sm font-semibold">
                    <span className="text-muted-foreground">Total Rooms: {totalRooms}</span>
                    <span className="text-emerald-500">Available: {selectedDateAvailableCount}</span>
                    <span className="text-red-500">Booked: {selectedDateBookedCount}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-2 hover:bg-surface rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Check-ins Card */}
                <div className="bg-surface rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <LogIn className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Today's Check-Ins ({selectedDateCheckIns.length})</h3>
                  </div>
                  {selectedDateCheckIns.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateCheckIns.map((b: any) => (
                        <div key={b.id} className="flex justify-between items-center text-sm p-2 bg-card rounded-md border border-border">
                          <div>
                            <span className="font-semibold">{b.customers?.full_name}</span>
                            <span className="text-xs text-muted-foreground block">{b.booking_code}</span>
                          </div>
                          <span className="text-xs font-mono bg-surface px-2 py-1 rounded">{resolveRooms(b.assigned_room_ids)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No check-ins scheduled.</p>
                  )}
                </div>

                {/* Check-outs Card */}
                <div className="bg-surface rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <LogOut className="h-4 w-4 text-orange-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Today's Check-Outs ({selectedDateCheckOuts.length})</h3>
                  </div>
                  {selectedDateCheckOuts.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateCheckOuts.map((b: any) => (
                        <div key={b.id} className="flex justify-between items-center text-sm p-2 bg-card rounded-md border border-border">
                          <div>
                            <span className="font-semibold">{b.customers?.full_name}</span>
                            <span className="text-xs text-muted-foreground block">{b.booking_code}</span>
                          </div>
                          <span className="text-xs font-mono bg-surface px-2 py-1 rounded">{resolveRooms(b.assigned_room_ids)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No check-outs scheduled.</p>
                  )}
                </div>
              </div>

              {/* Occupied Rooms List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <BedDouble className="h-5 w-5 text-gold" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    All Occupied Rooms ({selectedDateBookedCount})
                  </h3>
                </div>
                
                {selectedDateBookings.length > 0 ? (
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold">Room(s)</th>
                          <th className="text-left py-3 px-4 font-semibold">Customer Name</th>
                          <th className="text-left py-3 px-4 font-semibold">Booking ID</th>
                          <th className="text-left py-3 px-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedDateBookings.map((b: any) => (
                          <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-3 px-4 font-mono font-semibold">{resolveRooms(b.assigned_room_ids)}</td>
                            <td className="py-3 px-4 font-medium">{b.customers?.full_name}</td>
                            <td className="py-3 px-4 text-gold font-medium">{b.booking_code}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full ${b.status === 'checked_in' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'}`}>
                                {b.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground bg-surface p-4 rounded-lg border border-border text-center">
                    No occupied rooms for this date.
                  </p>
                )}
              </div>

            </div>
            
            <div className="p-6 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedDate(null)}
                className="px-6 py-2 bg-surface hover:bg-surface/80 text-foreground font-semibold rounded-md transition-colors shadow-sm"
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
