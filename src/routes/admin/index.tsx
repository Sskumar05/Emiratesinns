import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { BedDouble, CheckCircle2, Users, XCircle, TrendingUp, Mail } from "lucide-react";
import { formatINR, CATEGORY_LABELS } from "@/lib/hotel";
import { getOccupiedRoomStatusMap } from "@/lib/occupancy";
import { motion } from "framer-motion";

import { Link, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [hotelFilter, setHotelFilter] = useState<string>("all");
  const today = new Date().toISOString().slice(0, 10);

  const { data: hotels = [] } = useQuery({
    queryKey: ["hotels"], queryFn: async () => (await supabase.from("hotels").select("*")).data ?? [],
  });
  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms-all"], queryFn: async () => (await supabase.from("rooms").select("*, hotels(slug)")).data ?? [],
  });
  const { data: bookings = [], refetch } = useQuery({
    queryKey: ["bookings-all"], queryFn: async () => (await supabase.from("bookings").select("*, hotels(name, slug), customers(*)").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customers-count"], queryFn: async () => (await supabase.from("customers").select("id", { count: "exact" })).data ?? [],
  });
  const { data: contactMessages = [] } = useQuery({
    queryKey: ["contact_messages_new"], queryFn: async () => (await supabase.from("contact_messages").select("id").eq("status", "New")).data ?? [],
  });

  // Realtime
  useEffect(() => {
    const ch = supabase.channel("admin-dash")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refetch]);

  const occupiedRoomStatusMap = getOccupiedRoomStatusMap(bookings);

  const filteredRooms = rooms.filter((r: any) => hotelFilter === "all" || r.hotels?.slug === hotelFilter);
  const reserved = filteredRooms.filter((r: any) => r.status !== "maintenance" && occupiedRoomStatusMap.get(r.id) === "confirmed").length;
  const occupied = filteredRooms.filter((r: any) => r.status !== "maintenance" && occupiedRoomStatusMap.get(r.id) === "checked_in").length;
  const available = filteredRooms.filter((r: any) => r.status !== "maintenance" && !occupiedRoomStatusMap.has(r.id)).length;
  
  const cancelledToday = bookings.filter((b: any) =>
    (b.status === "cancelled" || b.status === "no_show") && b.cancelled_at?.slice(0, 10) === today
  ).length;

  const checkInsToday = bookings.filter((b: any) => b.check_in_date === today && (hotelFilter === "all" || b.hotels?.slug === hotelFilter));
  const checkOutsToday = bookings.filter((b: any) => b.check_out_date === today && (hotelFilter === "all" || b.hotels?.slug === hotelFilter));
  const upcoming = bookings.filter((b: any) => b.check_in_date > today && b.status !== "cancelled").slice(0, 5);

  const stats = [
    { I: BedDouble, label: "Occupied Rooms", value: occupied, accent: true },
    { I: BedDouble, label: "Reserved Rooms", value: reserved, accent: false },
    { I: CheckCircle2, label: "Available Rooms", value: available },
    { I: Mail, label: "New Messages", value: contactMessages.length, link: "/admin/contact-messages" },
  ];

  return (
    <div className="space-y-8 min-h-full -mx-6 -my-6 px-6 py-8 lg:-mx-10 lg:-my-10 lg:px-10 lg:py-10" style={{ backgroundColor: "#F8FAFC" }}>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-4xl text-gray-900 tracking-tight font-semibold">Welcome back</h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">Live operations overview</p>
        </div>
        <div className="flex gap-1 p-1 bg-white border border-[#E5E7EB] rounded-full shadow-sm">
          <button onClick={() => setHotelFilter("all")} className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${hotelFilter === "all" ? "bg-[#0B5CAD] text-white shadow-md" : "text-gray-500 hover:text-gray-900"}`}>All Hotels</button>
          {hotels.map((h: any) => (
            <button key={h.id} onClick={() => setHotelFilter(h.slug)} className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${hotelFilter === h.slug ? "bg-[#0B5CAD] text-white shadow-md" : "text-gray-500 hover:text-gray-900"}`}>{h.name}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => {
          const content = (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`p-8 bg-white border border-[#E5E7EB] flex flex-col justify-between h-full transition-all`}
              style={{ borderRadius: "18px", boxShadow: "0 10px 30px rgba(8,28,75,.06)" }}>
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${s.accent ? "bg-[#0B5CAD]/10" : "bg-gray-100"}`}>
                  <s.I className={`h-6 w-6 ${s.accent ? "text-[#0B5CAD]" : "text-gray-600"}`} />
                </div>
              </div>
              <div>
                <div className="font-display text-5xl font-semibold text-gray-900 tracking-tight">{s.value}</div>
                <div className="text-sm font-bold text-gray-500 mt-3 uppercase tracking-wider">{s.label}</div>
              </div>
            </motion.div>
          );
          return s.link ? <Link to={s.link as any} key={s.label} className="block h-full">{content}</Link> : <div key={s.label} className="h-full">{content}</div>;
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Today's Check-Ins" empty="No check-ins today">
          {checkInsToday.map((b: any) => <BookingRow key={b.id} b={b} />)}
        </Panel>
        <Panel title="Today's Check-Outs" empty="No check-outs today">
          {checkOutsToday.map((b: any) => <BookingRow key={b.id} b={b} />)}
        </Panel>
      </div>

      <Panel title="Upcoming Bookings" empty="No upcoming bookings">
        {upcoming.map((b: any) => <BookingRow key={b.id} b={b} />)}
      </Panel>

      <Panel title="Recent Activity" empty="No recent activity">
        {bookings.slice(0, 5).map((b: any) => (
          <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors rounded-xl m-1">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-[#0B5CAD]/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-[#0B5CAD]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">New booking <span className="text-[#0B5CAD] ml-1">{b.booking_code}</span></div>
                <div className="text-xs text-gray-500 mt-1 font-medium">{b.customers?.full_name} · {b.hotels?.name}</div>
              </div>
            </div>
            <div className="text-xs font-medium text-gray-500">{new Date(b.created_at).toLocaleString()}</div>
          </motion.div>
        ))}
      </Panel>
    </div>
  );
}

function Panel({ title, children, empty }: { title: string; children: React.ReactNode; empty: string }) {
  const arr = Array.isArray(children) ? children : [children];
  return (
    <div className="bg-white border border-[#E5E7EB] transition-all hover:shadow-lg" style={{ borderRadius: "18px", boxShadow: "0 10px 30px rgba(8,28,75,.06)" }}>
      <div className="px-8 py-6 border-b border-[#E5E7EB] flex justify-between items-center">
        <h3 className="font-display text-xl font-semibold text-gray-900 tracking-tight">{title}</h3>
      </div>
      <div className="p-2 sm:p-4">
        {arr.length === 0 ? <p className="text-sm text-gray-500 text-center py-10 font-medium">{empty}</p> : <div className="flex flex-col gap-1">{children}</div>}
      </div>
    </div>
  );
}

function BookingRow({ b }: { b: any }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors rounded-xl m-1">
      <div>
        <div className="text-sm font-semibold text-gray-900"><span className="text-[#0B5CAD] mr-1">{b.booking_code}</span> {b.customers?.full_name}</div>
        <div className="text-xs text-gray-500 mt-1.5 font-medium">{b.hotels?.name} · {CATEGORY_LABELS[b.category]} · {b.num_rooms} room(s)</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-gray-900">{formatINR(b.total_amount)}</div>
        <div className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mt-1.5">{b.status}</div>
      </div>
    </motion.div>
  );
}
