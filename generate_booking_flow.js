const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const bookingFlowCode = `import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABELS, formatINR, isoDate, addDays, fmtDateTime, getDurationLabel, getRateLabel } from "@/lib/hotel";
import { motion } from "framer-motion";
import { Check, ArrowRight, ArrowLeft, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { sendAdminNotification } from "@/lib/email";
import { getOccupiedRoomStatusMap } from "@/lib/occupancy";

export interface BookingCreatedPayload {
  bookingId: string;
  paymentMethod?: string;
  paymentStatus?: string;
  amountReceived?: number;
  balanceReturn?: number;
}

export interface BookingFlowProps {
  isAdmin: boolean;
  onSuccess: (payload: BookingCreatedPayload) => void;
  initialRoomId?: string;
  initialSearch?: {
    checkInDate?: string;
    numDays?: number;
    numGuests?: number;
    numRooms?: number;
  };
}

const websiteGuestSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  mobile: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(255),
  num_guests: z.number().int().min(1).max(20),
  num_rooms: z.number().int().min(1).max(10),
  check_in_date: z.string(),
  check_in_time: z.string().optional(),
  num_days: z.number().int().min(1).max(60),
});

const adminGuestSchema = websiteGuestSchema.extend({
  adults: z.number().int().min(1),
  children: z.number().int().min(0),
  address: z.string().optional(),
  id_proof_type: z.string().optional(),
  id_proof_number: z.string().optional(),
  special_request: z.string().optional(),
});

export function BookingFlow({ isAdmin, onSuccess, initialRoomId, initialSearch }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    full_name: "", mobile: "", email: "",
    num_guests: initialSearch?.numGuests || 1,
    num_rooms: initialSearch?.numRooms || 1,
    check_in_date: initialSearch?.checkInDate || isoDate(new Date()),
    check_in_time: "14:00",
    num_days: initialSearch?.numDays || 1,
    // Admin specific
    address: "",
    adults: initialSearch?.numGuests || 1,
    children: 0,
    id_proof_type: "Aadhaar",
    id_proof_number: "",
    special_request: "",
  });

  const [payment, setPayment] = useState({
    method: "cash",
    status: "paid",
    amountReceived: 0,
  });

  const { data: stayModeData } = useQuery({
    queryKey: ["system_settings", "global_stay_mode"],
    queryFn: async () => {
      try {
        const { data } = await supabase.from("system_settings").select("value").eq("key", "global_stay_mode").maybeSingle();
        if (data) {
          let val = data.value;
          if (typeof val === "string") val = val.replace(/^"|"$/g, "");
          return val;
        }
        return "standard";
      } catch {
        return "standard";
      }
    },
    retry: false,
  });
  const is12HoursMode = stayModeData === "12_hours";

  // Data queries
  const { data: hotels = [] } = useQuery({
    queryKey: ["hotels"],
    enabled: isAdmin,
    queryFn: async () => (await supabase.from("hotels").select("*")).data || [],
  });

  const { data: initialRoom } = useQuery({
    queryKey: ["room", initialRoomId],
    enabled: !!initialRoomId,
    queryFn: async () => (await supabase.from("rooms").select("*, hotels(*)").eq("id", initialRoomId!).maybeSingle()).data,
  });

  const { data: allRooms = [] } = useQuery({
    queryKey: ["rooms", selectedHotelId],
    enabled: isAdmin && !!selectedHotelId,
    queryFn: async () => (await supabase.from("rooms").select("*").eq("hotel_id", selectedHotelId!).order("room_number")).data || [],
  });

  const { data: activeBookings = [] } = useQuery({
    queryKey: ["active-bookings", selectedHotelId],
    enabled: isAdmin && !!selectedHotelId,
    queryFn: async () => (await supabase.from("bookings").select("assigned_room_ids, status, check_in_date, check_out_date, stay_type, check_in_time").in("status", ["confirmed", "checked_in"]).eq("hotel_id", selectedHotelId!)).data || [],
  });

  // Calculate actual checkout based on mode
  let checkout = isoDate(addDays(form.check_in_date, form.num_days));
  let checkoutTime = "12:00";
  const checkInMs = new Date(\`\${form.check_in_date}T\${form.check_in_time || "14:00"}:00\`).getTime();
  const checkOutMs = is12HoursMode
    ? checkInMs + 12 * 60 * 60 * 1000
    : new Date(\`\${isoDate(addDays(form.check_in_date, form.num_days))}T12:00:00\`).getTime();

  if (is12HoursMode) {
    const d = new Date(checkOutMs);
    checkout = d.toISOString().split("T")[0];
    checkoutTime = d.toTimeString().slice(0, 5);
  }

  // Determine current active room category and pricing
  let activeHotelId = isAdmin ? selectedHotelId : (initialRoom as any)?.hotel_id;
  let activeHotelName = isAdmin ? hotels.find(h => h.id === selectedHotelId)?.name : (initialRoom as any)?.hotels?.name;
  let activeCategory = isAdmin ? selectedCategory : (initialRoom as any)?.category;
  
  // For price, we need to know the price of the selected category.
  // In website mode, it's the initialRoom price. In admin mode, we grab one room of that category.
  let price = 0;
  if (!isAdmin && initialRoom) {
    price = is12HoursMode ? Number(initialRoom.price_12_hours || 0) : Number(initialRoom.price_per_night || 0);
  } else if (isAdmin && selectedCategory && allRooms.length > 0) {
    const sampleRoom = allRooms.find(r => r.category === selectedCategory);
    if (sampleRoom) {
      price = is12HoursMode ? Number(sampleRoom.price_12_hours || 0) : Number(sampleRoom.price_per_night || 0);
    }
  }

  const total = is12HoursMode ? price * form.num_rooms : price * form.num_rooms * form.num_days;
  const balanceReturn = Math.max(0, payment.amountReceived - total);

  // Admin Availability Map
  const occupancyMap = useMemo(() => {
    if (!isAdmin) return new Map();
    // Filter overlapping bookings
    const overlapping = activeBookings.filter((b: any) => {
      const bStart = new Date(\`\${b.check_in_date}T\${b.check_in_time || "14:00"}:00\`).getTime();
      const bEnd = b.stay_type === "12_hours"
        ? bStart + 12 * 60 * 60 * 1000
        : new Date(\`\${b.check_out_date}T12:00:00\`).getTime();
      return bStart < checkOutMs && bEnd > checkInMs;
    });
    return getOccupiedRoomStatusMap(overlapping);
  }, [isAdmin, activeBookings, checkInMs, checkOutMs]);

  const availableRoomsCount = useMemo(() => {
    if (!isAdmin || !selectedCategory) return 0;
    return allRooms.filter(r => r.category === selectedCategory && r.status !== "maintenance" && !occupancyMap.has(r.id)).length;
  }, [isAdmin, allRooms, selectedCategory, occupancyMap]);

  async function submitBooking() {
    const schema = isAdmin ? adminGuestSchema : websiteGuestSchema;
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    
    if (isAdmin) {
      if (form.num_rooms !== selectedRoomIds.length) {
        toast.error(\`Please select exactly \${form.num_rooms} room(s).\`); return;
      }
      if (!selectedHotelId || !selectedCategory) {
        toast.error("Hotel and Category must be selected"); return;
      }
    } else {
      if (!initialRoom) { toast.error("Room not found"); return; }
    }

    setSubmitting(true);
    try {
      // Step 1: Upsert customer
      const { data: customerId, error: cErr } = await supabase.rpc("upsert_customer_for_booking", {
        p_full_name: form.full_name,
        p_mobile: form.mobile,
        p_email: form.email,
      });
      if (cErr) throw cErr;

      // Step 2: Determine Assigned Rooms
      let assignedRoomIds = isAdmin ? selectedRoomIds : [];
      if (!isAdmin) {
        let srQuery = supabase.from("rooms").select("id").eq("hotel_id", (initialRoom as any).hotel_id).eq("category", (initialRoom as any).category).neq("status", "maintenance");
        if ((initialRoom as any).room_type) srQuery = srQuery.eq("room_type", (initialRoom as any).room_type);
        else srQuery = srQuery.is("room_type", null);
        
        const { data: siblingRooms, error: srErr } = await srQuery;
        if (srErr) throw srErr;

        const { data: allActive, error: ovErr } = await supabase.from("bookings")
          .select("assigned_room_ids, check_in_date, check_in_time, check_out_date, stay_type")
          .eq("hotel_id", (initialRoom as any).hotel_id)
          .eq("category", (initialRoom as any).category)
          .in("status", ["confirmed", "checked_in"]);
        if (ovErr) throw ovErr;

        const overlapping = (allActive ?? []).filter((b: any) => {
          const bStart = new Date(\`\${b.check_in_date}T\${b.check_in_time || "14:00"}:00\`).getTime();
          const bEnd = b.stay_type === "12_hours" ? bStart + 12 * 60 * 60 * 1000 : new Date(\`\${b.check_out_date}T12:00:00\`).getTime();
          return bStart < checkOutMs && bEnd > checkInMs;
        });

        const bookedIds = new Set<string>(overlapping.flatMap((b: any) => b.assigned_room_ids ?? []));
        const available = (siblingRooms ?? []).filter((r: any) => !bookedIds.has(r.id));

        if (available.length < form.num_rooms) {
          throw new Error(\`Only \${available.length} room\${available.length !== 1 ? "s" : ""} available. Please adjust.\`);
        }
        assignedRoomIds = available.slice(0, form.num_rooms).map((r: any) => r.id);
      }

      // Step 3: Insert Booking
      const insertData: any = {
        customer_id: customerId,
        hotel_id: activeHotelId,
        category: activeCategory,
        num_rooms: form.num_rooms,
        num_guests: form.num_guests,
        check_in_date: form.check_in_date,
        check_in_time: form.check_in_time,
        num_days: form.num_days,
        check_out_date: checkout,
        price_per_night: price,
        total_amount: total,
        assigned_room_ids: assignedRoomIds,
        stay_type: is12HoursMode ? "12_hours" : "standard",
      };

      if (isAdmin) {
        insertData.booking_source = "walk_in";
        insertData.adults = form.adults;
        insertData.children = form.children;
        insertData.address = form.address;
        insertData.id_proof_type = form.id_proof_type;
        insertData.id_proof_number = form.id_proof_number;
        insertData.special_request = form.special_request;
        insertData.status = "confirmed";
        insertData.payment_status = payment.status;
        insertData.payment_ref = payment.method;
        
        // created_by = current user
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          insertData.created_by = userData.user.id;
        }
      } else {
        insertData.booking_source = "online";
        insertData.status = "pending";
        insertData.payment_status = "pending";
      }

      const { data: booking, error: bErr } = await supabase.from("bookings").insert(insertData).select().single();
      if (bErr) throw bErr;

      // Step 4: Admin Notification for online bookings (fire and forget)
      if (!isAdmin) {
        sendAdminNotification({
          bookingCode: booking.booking_code,
          customerName: form.full_name,
          customerEmail: form.email,
          customerMobile: form.mobile,
          hotelName: activeHotelName ?? "Emirates Grand Inn",
          roomType: CATEGORY_LABELS[activeCategory as keyof typeof CATEGORY_LABELS] ?? activeCategory,
          checkIn: form.check_in_date,
          checkOut: checkout,
          numGuests: form.num_guests,
          numRooms: form.num_rooms,
          numDays: is12HoursMode ? 0 : form.num_days,
          totalAmount: formatINR(total),
          createdAt: new Date().toLocaleString("en-IN"),
        }).catch((err) => console.warn("[booking] Admin notification failed:", err));
      }

      // Done
      onSuccess({
        bookingId: booking.id,
        paymentMethod: payment.method,
        paymentStatus: payment.status,
        amountReceived: payment.amountReceived,
        balanceReturn,
      });

    } catch (e: any) {
      toast.error(e.message ?? "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  // Render logic
  const steps = isAdmin 
    ? ["Select Hotel & Dates", "Select Room", "Guest Details", "Summary & Payment"]
    : ["Review", "Guest Details", "Summary", "Payment"];

  // Helper for admin to toggle room selection
  const toggleRoom = (id: string) => {
    if (selectedRoomIds.includes(id)) {
      setSelectedRoomIds(prev => prev.filter(r => r !== id));
    } else {
      if (selectedRoomIds.length >= form.num_rooms) {
        toast.error(\`You can only select \${form.num_rooms} room(s).\`);
        return;
      }
      setSelectedRoomIds(prev => [...prev, id]);
    }
  };

  const ContentWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className={isAdmin ? "" : "container-luxe pt-28 pb-20 max-w-4xl"}>
      <div className="flex items-center justify-between mb-12">
        {steps.map((s, i) => (
          <div key={s} className="flex-1 flex items-center">
            <div className={\`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm \${step > i + 1 ? "bg-primary text-white" : step === i + 1 ? "bg-primary text-white" : "border border-border text-muted-foreground bg-card"}\`}>
              {step > i + 1 ? <Check className="h-5 w-5" /> : i + 1}
            </div>
            <div className="ml-3 hidden sm:block">
              <div className={\`text-xs font-bold uppercase tracking-wider \${step >= i + 1 ? "text-primary" : "text-muted-foreground"}\`}>{s}</div>
            </div>
            {i < steps.length - 1 && <div className={\`flex-1 h-1 mx-4 rounded-full \${step > i + 1 ? "bg-primary" : "bg-border"}\`} />}
          </div>
        ))}
      </div>
      <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card shadow-card rounded-lg border border-border p-8 lg:p-12">
        {children}
      </motion.div>
    </div>
  );

  return (
    <ContentWrapper>
      {/* Website Step 1: Review | Admin Step 1: Select Hotel & Dates */}
      {step === 1 && (
        <div>
          {isAdmin ? (
            <div>
              <h2 className="font-bold text-3xl mb-8 text-foreground tracking-tight">Select Hotel & Dates</h2>
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <label className="block sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Hotel *</span>
                  <select value={selectedHotelId || ""} onChange={e => setSelectedHotelId(e.target.value)} className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:border-gold focus:outline-none">
                    <option value="" disabled>Select a hotel...</option>
                    {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </label>
                <Field label="Check-In Date *" type="date" value={form.check_in_date} onChange={v => setForm({ ...form, check_in_date: v })} />
                <Field label="Check-In Time *" type="time" value={form.check_in_time} onChange={v => setForm({ ...form, check_in_time: v })} />
                {!is12HoursMode && <Field label="Duration (Days) *" type="number" value={form.num_days.toString()} onChange={v => setForm({ ...form, num_days: parseInt(v) || 1 })} />}
                <Field label="Number of Rooms *" type="number" value={form.num_rooms.toString()} onChange={v => setForm({ ...form, num_rooms: parseInt(v) || 1 })} />
                <Field label="Number of Guests *" type="number" value={form.num_guests.toString()} onChange={v => setForm({ ...form, num_guests: parseInt(v) || 1 })} />
              </div>
              <button onClick={() => {
                if (!selectedHotelId) { toast.error("Please select a hotel"); return; }
                setStep(2);
              }} className="ml-auto flex items-center justify-center gap-2 bg-gold text-white px-8 py-3.5 text-sm font-semibold rounded-md shadow-md hover:bg-gold-hover transition">Continue <ArrowRight className="h-4 w-4" /></button>
            </div>
          ) : (
            <div>
              <h2 className="font-bold text-3xl mb-8 text-foreground tracking-tight">Review your selection</h2>
              <div className="grid sm:grid-cols-2 gap-8 mb-10">
                <img src={(initialRoom as any)?.images?.[0] || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80"} alt="" className="aspect-[4/3] w-full object-cover rounded-md shadow-sm" />
                <div className="flex flex-col justify-center">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gold mb-1">{activeHotelName}</div>
                  <h3 className="font-bold text-2xl mb-4 text-foreground">{CATEGORY_LABELS[activeCategory as keyof typeof CATEGORY_LABELS]}</h3>
                  <div className="text-primary font-bold text-3xl mb-6">{formatINR(price)}<span className="text-sm text-muted-foreground font-semibold ml-2">/night</span></div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2.5 border border-border">
                    {is12HoursMode && (
                      <div className="bg-orange-500/10 text-orange-600 border border-orange-500/20 px-3 py-2 rounded-md flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">12 Hours Stay Mode</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Check-in</span><span className="text-sm font-semibold">{fmtDateTime(form.check_in_date, form.check_in_time)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Check-out</span><span className="text-sm font-semibold text-primary">{fmtDateTime(checkout, checkoutTime)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Stay</span><span className="text-sm font-semibold">{getDurationLabel(form.num_days, is12HoursMode ? "12_hours" : "standard")}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Guests</span><span className="text-sm font-semibold">{form.num_guests} {form.num_guests === 1 ? "Guest" : "Guests"}</span></div>
                    <div className="flex justify-between items-center pt-2 border-t border-border mt-1"><span className="font-bold">Total Amount</span><span className="font-bold text-primary">{formatINR(total)}</span></div>
                  </div>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="ml-auto flex items-center justify-center gap-2 bg-gold text-white px-8 py-3.5 text-sm font-semibold rounded-md shadow-md hover:bg-gold-hover transition">Continue <ArrowRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      )}

      {/* Admin Step 2: Select Room Category and Number */}
      {step === 2 && isAdmin && (
        <div>
          <h2 className="font-bold text-3xl mb-8 text-foreground tracking-tight">Select Room Category & Number</h2>
          <div className="mb-6">
            <label className="block mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Room Category *</span>
              <select value={selectedCategory || ""} onChange={e => { setSelectedCategory(e.target.value); setSelectedRoomIds([]); }} className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:border-gold focus:outline-none">
                <option value="" disabled>Select a category...</option>
                {Object.keys(CATEGORY_LABELS).map(cat => <option key={cat} value={cat}>{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}</option>)}
              </select>
            </label>
            {selectedCategory && (
               <p className="text-sm text-muted-foreground mb-4">Available Rooms for this category: <strong className="text-foreground">{availableRoomsCount}</strong></p>
            )}
            
            {selectedCategory && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                {allRooms.filter(r => r.category === selectedCategory).map(room => {
                  const status = occupancyMap.get(room.id) || room.status;
                  const isAvailable = status === "available" || !status;
                  const isSelected = selectedRoomIds.includes(room.id);
                  let bg = "bg-surface text-muted-foreground opacity-50 cursor-not-allowed";
                  if (isSelected) bg = "bg-primary text-white border-primary shadow-md";
                  else if (isAvailable) bg = "bg-card text-foreground hover:border-gold cursor-pointer";
                  else if (status === "cleaning") bg = "bg-blue-100 text-blue-800 opacity-50 cursor-not-allowed";
                  else if (status === "maintenance") bg = "bg-orange-100 text-orange-800 opacity-50 cursor-not-allowed";
                  return (
                    <div key={room.id} onClick={() => isAvailable ? toggleRoom(room.id) : null} className={\`border border-border rounded-md p-3 text-center transition-all \${bg}\`}>
                      <div className="font-bold text-lg">{room.room_number}</div>
                      <div className="text-[10px] uppercase tracking-wider">{isSelected ? "Selected" : status || "Available"}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
            <button onClick={() => setStep(1)} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center"><ArrowLeft className="h-4 w-4 mr-2" />Back</button>
            <button onClick={() => {
              if (!selectedCategory) { toast.error("Please select a room category"); return; }
              if (selectedRoomIds.length !== form.num_rooms) { toast.error(\`Please select exactly \${form.num_rooms} room(s)\`); return; }
              setStep(3);
            }} className="flex items-center justify-center gap-2 bg-gold text-white px-8 py-3.5 text-sm font-semibold rounded-md shadow-md hover:bg-gold-hover transition">Continue <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Step 2 (Website) / 3 (Admin): Guest Details */}
      {(step === (isAdmin ? 3 : 2)) && (
        <div>
          <h2 className="font-bold text-3xl mb-8 text-foreground tracking-tight">Guest details</h2>
          <div className="mb-8 bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 p-4 rounded-lg flex items-start gap-3">
            <div className="shrink-0 mt-0.5"><span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-current text-xs font-bold">i</span></div>
            <div className="space-y-1 text-sm font-medium">
              <p className="font-bold uppercase tracking-wider text-xs mb-2">Primary Guest Information</p>
              <p>Please provide a valid Government-issued Photo ID during hotel check-in for identity verification.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Full Name *" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} />
            <Field label="Mobile Number *" value={form.mobile} onChange={v => setForm({ ...form, mobile: v })} />
            <div className="sm:col-span-2">
              <Field label="Email Address *" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
            </div>

            {isAdmin && (
              <>
                <div className="sm:col-span-2">
                  <Field label="Address" value={form.address} onChange={v => setForm({ ...form, address: v })} />
                </div>
                <Field label="Adults *" type="number" value={form.adults.toString()} onChange={v => setForm({ ...form, adults: parseInt(v) || 1 })} />
                <Field label="Children" type="number" value={form.children.toString()} onChange={v => setForm({ ...form, children: parseInt(v) || 0 })} />
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">ID Proof Type</span>
                  <select value={form.id_proof_type} onChange={e => setForm({ ...form, id_proof_type: e.target.value })} className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:border-gold focus:outline-none">
                    <option value="Aadhaar">Aadhaar</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving Licence">Driving Licence</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <Field label="ID Proof Number" value={form.id_proof_number} onChange={v => setForm({ ...form, id_proof_number: v })} />
                <div className="sm:col-span-2">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Special Request</span>
                    <textarea value={form.special_request} onChange={e => setForm({ ...form, special_request: e.target.value })} className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:border-gold focus:outline-none min-h-[100px]"></textarea>
                  </label>
                </div>
              </>
            )}

            {!isAdmin && is12HoursMode && (
              <>
                <div className="sm:col-span-1"><Field label="Check-In Time *" type="time" value={form.check_in_time || "14:00"} onChange={(v) => setForm({ ...form, check_in_time: v })} /></div>
                <div className="sm:col-span-1"><Field label="Check-Out Time (Auto)" type="time" value={checkoutTime} onChange={() => {}} disabled /></div>
              </>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
            <button onClick={() => setStep(isAdmin ? 2 : 1)} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center"><ArrowLeft className="h-4 w-4 mr-2" />Back</button>
            <button onClick={() => setStep(isAdmin ? 4 : 3)} className="flex items-center justify-center gap-2 bg-gold text-white px-8 py-3.5 text-sm font-semibold rounded-md shadow-md hover:bg-gold-hover transition">Continue <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Step 3 (Website) / 4 (Admin): Summary & Payment */}
      {(step === (isAdmin ? 4 : 3)) && (
        <div>
          <h2 className="font-bold text-3xl mb-8 text-foreground tracking-tight">Booking Summary {isAdmin && "& Payment"}</h2>
          
          <div className={isAdmin ? "grid lg:grid-cols-2 gap-8" : ""}>
            <div className="space-y-6">
              <dl className="divide-y divide-border border border-border rounded-md overflow-hidden bg-background">
                {[
                  ["Hotel", activeHotelName],
                  ["Room Category", CATEGORY_LABELS[activeCategory as keyof typeof CATEGORY_LABELS]],
                  ["Number of Rooms", \`\${form.num_rooms} Room\${form.num_rooms !== 1 ? "s" : ""}\`],
                  isAdmin ? ["Room Numbers", allRooms.filter(r => selectedRoomIds.includes(r.id)).map(r => r.room_number).join(", ")] : null,
                  ["Check-in", fmtDateTime(form.check_in_date, form.check_in_time)],
                  ["Check-out", fmtDateTime(checkout, checkoutTime)],
                  ["Duration", getDurationLabel(form.num_days, is12HoursMode ? "12_hours" : "standard")],
                  ["Guests", \`\${form.num_guests} \${form.num_guests === 1 ? "Guest" : "Guests"}\`],
                  [getRateLabel(is12HoursMode ? "12_hours" : "standard"), formatINR(price)],
                ].filter(Boolean).map((row: any) => (
                  <div key={row[0]} className="flex justify-between py-4 px-4 sm:px-6">
                    <dt className="text-sm font-semibold text-muted-foreground">{row[0]}</dt>
                    <dd className="text-sm font-bold text-foreground text-right break-words max-w-[60%]">{row[1]}</dd>
                  </div>
                ))}
                <div className="flex justify-between py-5 bg-primary/5 px-6 items-center">
                  <dt className="font-bold text-lg text-primary">Total Amount</dt>
                  <dd className="font-bold text-2xl text-primary">{formatINR(total)}</dd>
                </div>
              </dl>
            </div>

            {isAdmin && (
              <div className="space-y-6 bg-surface p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Payment Method</span>
                    <select value={payment.method} onChange={e => setPayment({ ...payment, method: e.target.value })} className="w-full bg-background border border-border rounded-md px-4 py-2 text-sm focus:border-gold focus:outline-none">
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="pay_later">Pay Later</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Payment Status</span>
                    <select value={payment.status} onChange={e => setPayment({ ...payment, status: e.target.value })} className="w-full bg-background border border-border rounded-md px-4 py-2 text-sm focus:border-gold focus:outline-none">
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="pending">Pending</option>
                    </select>
                  </label>
                </div>
                
                {payment.method === "cash" && payment.status !== "pending" && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <Field label="Amount Received (₹)" type="number" value={payment.amountReceived.toString()} onChange={v => setPayment({ ...payment, amountReceived: parseFloat(v) || 0 })} />
                    <div className="flex justify-between items-center bg-blue-500/10 text-blue-700 p-4 rounded-md border border-blue-500/20">
                      <span className="font-semibold text-sm">Balance to Return</span>
                      <span className="font-bold text-xl">{formatINR(balanceReturn)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
            <button onClick={() => setStep(isAdmin ? 3 : 2)} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center"><ArrowLeft className="h-4 w-4 mr-2" />Back</button>
            <button disabled={submitting} onClick={submitBooking} className="flex items-center justify-center gap-2 bg-gold text-white px-8 py-3.5 text-sm font-semibold rounded-md shadow-md hover:bg-gold-hover transition disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isAdmin ? "Confirm Booking" : "Proceed to Payment"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </ContentWrapper>
  );
}

function Field({ label, value, onChange, type = "text", disabled }: { label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className={\`w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors \${disabled ? "opacity-60 cursor-not-allowed bg-muted" : ""}\`} />
    </label>
  );
}
\`;

fs.writeFileSync(path.join(srcDir, 'components', 'booking', 'BookingFlow.tsx'), bookingFlowCode);
console.log('BookingFlow.tsx written');
