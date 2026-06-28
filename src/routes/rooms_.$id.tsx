import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABELS, formatINR, AMENITY_LABELS, isoDate } from "@/lib/hotel";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, ArrowLeft, Wifi, Tv, Car, Droplet, ChefHat, Camera, Wine,
  Users, BedDouble, ArrowRight, Home, CalendarDays, UserCheck, ShieldCheck, AlertCircle, Moon,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

export const Route = createFileRoute("/rooms_/$id")({
  component: RoomDetail,
});

const FALLBACK = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80";
const AMENITY_ICON: Record<string, any> = {
  WiFi: Wifi, TV: Tv, Parking: Car, "Hot Water": Droplet,
  Kitchen: ChefHat, CCTV: Camera, "Welcome Drink": Wine,
};

/** Format ISO date string as "28 Jun 2026" */
function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** Return number of nights between two ISO date strings (positive integer, or 0) */
function calcNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const msPerDay = 86400000;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(diff / msPerDay));
}

/** Return tomorrow's ISO date string */
function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return isoDate(d);
}

function RoomDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();

  const [activeImg, setActiveImg] = useState(0);
  const today = isoDate(new Date());
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow());
  const [numGuests, setNumGuests] = useState(1);

  const { data: room, isLoading } = useQuery({
    queryKey: ["room", id],
    queryFn: async () =>
      (await supabase.from("rooms").select("*, hotels(id, name, slug, address)").eq("id", id).maybeSingle()).data,
  });

  // Derived values — auto-calculated, never stored
  const numNights = useMemo(() => calcNights(checkInDate, checkOutDate), [checkInDate, checkOutDate]);
  const isDateInvalid = numNights < 1; // check-out must be at least 1 night after check-in

  useEffect(() => {
    if (room?.max_guests && numGuests > room.max_guests) setNumGuests(room.max_guests);
  }, [room, numGuests]);

  // When check-in changes, push check-out forward if it's no longer valid
  const handleCheckInChange = (newDate: string) => {
    setCheckInDate(newDate);
    if (newDate >= checkOutDate) {
      const d = new Date(newDate + "T00:00:00");
      d.setDate(d.getDate() + 1);
      setCheckOutDate(isoDate(d));
    }
  };

  if (isLoading)
    return <WebsiteLayout><div className="container-luxe py-32 text-center text-muted-foreground font-medium">Loading…</div></WebsiteLayout>;
  if (!room)
    return <WebsiteLayout><div className="container-luxe py-32 text-center font-medium">Room not found.</div></WebsiteLayout>;

  const images =
    room.images?.length > 0
      ? room.images
      : [FALLBACK, "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80"];

  const price = Number(room.price_per_night) || 0;
  const totalAmount = price * numNights;

  const handleBookNow = () => {
    if (isDateInvalid) return;
    nav({
      to: "/booking",
      search: {
        roomId: room.id,
        hotelId: (room as any).hotels?.id,
        checkInDate,
        numDays: numNights,
        numGuests,
      } as any,
    });
  };

  const isBookingDisabled = room.status === "maintenance" || isDateInvalid;

  return (
    <WebsiteLayout>
      <div className="container-luxe pt-28 pb-20">
        <Link to="/rooms" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Rooms
        </Link>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ── Image Gallery ── */}
          <div className="order-1 lg:col-span-8 w-full space-y-4">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-md border border-border bg-muted">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={images[activeImg]}
                    alt="Room"
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`relative shrink-0 w-24 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${activeImg === idx ? "border-gold shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

          {/* ── Room Info Details ── */}
          <div className="order-2 lg:col-span-8 w-full bg-card p-6 sm:p-8 rounded-xl shadow-sm border border-border">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-gold/10 text-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {(room as any).hotels?.name}
                </span>
                {room.status === "available" ? (
                  <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Available</span>
                ) : (
                  <span className="bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Limited</span>
                )}
              </div>

              <h1 className="font-bold text-3xl sm:text-4xl text-foreground mb-6">{CATEGORY_LABELS[room.category] || room.category}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">{room.description}</p>

              {/* Feature Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-8 border-y border-border mb-8">
                {[
                  { icon: Users, label: "Capacity", value: `Up to ${room.max_guests}` },
                  { icon: BedDouble, label: "Bed Type", value: room.bed_type || "Standard" },
                  { icon: Home, label: "Floor", value: room.floor || "N/A" },
                  { icon: Check, label: "Room No.", value: room.room_number },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col gap-2 text-center items-center">
                    <div className="bg-primary/5 p-3 rounded-full text-primary"><Icon className="h-5 w-5" /></div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
                      <div className="font-medium">{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-bold text-xl text-foreground mb-6">Premium Amenities</h3>
                <ul className="grid sm:grid-cols-2 gap-y-5 gap-x-8">
                  {(room.amenities ?? []).map((a: string) => {
                    const Icon = AMENITY_ICON[a] || Check;
                    return (
                      <li key={a} className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-md"><Icon className="h-4 w-4 text-primary" /></div>
                        <span className="font-medium">{AMENITY_LABELS[a] ?? a}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Right: Premium Sticky Booking Card ── */}
          <div className="order-3 lg:col-span-4 lg:sticky lg:top-24 w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
            >
              {/* Gold gradient top bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-gold via-yellow-400 to-gold" />

              <div className="p-6 sm:p-7 space-y-5">

                {/* Price Header */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Starting from</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold text-[2rem] leading-none text-primary">{formatINR(price)}</span>
                    <span className="text-sm font-semibold text-muted-foreground">/ night</span>
                  </div>
                </div>

                {/* ── Check-In / Check-Out — both editable ── */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Check-In */}
                  <div>
                    <label htmlFor="room-check-in" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                      <CalendarDays className="h-3 w-3" /> Check-In
                    </label>
                    <input
                      id="room-check-in"
                      type="date"
                      min={today}
                      value={checkInDate}
                      onChange={(e) => handleCheckInChange(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-medium focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Check-Out — editable, min = checkIn + 1 day */}
                  <div>
                    <label htmlFor="room-check-out" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                      <CalendarDays className="h-3 w-3" /> Check-Out
                    </label>
                    <input
                      id="room-check-out"
                      type="date"
                      min={(() => { const d = new Date(checkInDate + "T00:00:00"); d.setDate(d.getDate() + 1); return isoDate(d); })()}
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-1 focus:outline-none transition-colors ${
                        isDateInvalid
                          ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                          : "border-border focus:border-gold focus:ring-gold"
                      }`}
                    />
                  </div>
                </div>

                {/* Validation message */}
                <AnimatePresence>
                  {isDateInvalid && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-semibold">Check-out must be after check-in.</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Auto-calculated Nights + Guests ── */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Nights — read-only, derived from dates */}
                  <div>
                    <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                      <Moon className="h-3 w-3" /> Nights
                    </label>
                    <motion.div
                      key={numNights}
                      initial={{ opacity: 0.7, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="w-full bg-muted/70 border border-border rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground select-none"
                    >
                      {isDateInvalid ? "—" : `${numNights} ${numNights === 1 ? "Night" : "Nights"}`}
                    </motion.div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label htmlFor="room-guests" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                      <UserCheck className="h-3 w-3" /> Guests
                    </label>
                    <select
                      id="room-guests"
                      value={numGuests}
                      onChange={(e) => setNumGuests(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-medium focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                    >
                      {Array.from({ length: room.max_guests || 4 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── Price Breakdown ── */}
                <motion.div
                  key={`${totalAmount}-${numNights}`}
                  initial={{ opacity: 0.7, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-muted/50 rounded-xl border border-border p-4 space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatINR(price)} × {isDateInvalid ? "—" : `${numNights} ${numNights === 1 ? "night" : "nights"}`}
                    </span>
                    <span className="font-semibold">{isDateInvalid ? "—" : formatINR(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{numGuests} {numGuests === 1 ? "guest" : "guests"}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="font-bold text-sm">Total Amount</span>
                    <motion.span
                      key={totalAmount}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`font-extrabold text-xl ${isDateInvalid ? "text-muted-foreground" : "text-primary"}`}
                    >
                      {isDateInvalid ? "—" : formatINR(totalAmount)}
                    </motion.span>
                  </div>
                </motion.div>

                {/* ── Book Now CTA ── */}
                <button
                  id="book-now-btn"
                  onClick={handleBookNow}
                  disabled={isBookingDisabled}
                  className="w-full bg-gold hover:bg-gold-hover text-white py-4 text-sm font-bold uppercase tracking-widest rounded-xl shadow-md transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {room.status === "maintenance" ? "Under Maintenance" : "Book Now"}
                  {!isBookingDisabled && <ArrowRight className="h-4 w-4" />}
                </button>

                {/* Trust signal */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[11px] text-muted-foreground font-medium">Secure booking · No hidden charges</span>
                </div>

              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </WebsiteLayout>
  );
}
