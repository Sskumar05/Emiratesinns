import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABELS, formatINR, AMENITY_LABELS, isoDate } from "@/lib/hotel";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, Wifi, Tv, Car, Droplet, ChefHat, Camera, Wine, Users, BedDouble, ArrowRight, Home } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/rooms_/$id")({
  component: RoomDetail,
});

const FALLBACK = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80";
const AMENITY_ICON: Record<string, any> = { WiFi: Wifi, TV: Tv, Parking: Car, "Hot Water": Droplet, Kitchen: ChefHat, CCTV: Camera, "Welcome Drink": Wine };

function RoomDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  
  const [activeImg, setActiveImg] = useState(0);
  const [checkInDate, setCheckInDate] = useState(isoDate(new Date()));
  const [numDays, setNumDays] = useState(1);
  const [numGuests, setNumGuests] = useState(1);

  const { data: room, isLoading } = useQuery({
    queryKey: ["room", id],
    queryFn: async () => (await supabase.from("rooms").select("*, hotels(id, name, slug, address)").eq("id", id).maybeSingle()).data,
  });

  useEffect(() => {
    if (room?.max_guests && numGuests > room.max_guests) {
      setNumGuests(room.max_guests);
    }
  }, [room, numGuests]);

  if (isLoading) return <WebsiteLayout><div className="container-luxe py-32 text-center text-muted-foreground font-medium">Loading…</div></WebsiteLayout>;
  if (!room) return <WebsiteLayout><div className="container-luxe py-32 text-center font-medium">Room not found.</div></WebsiteLayout>;

  const images = room.images?.length > 0 ? room.images : [FALLBACK, "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80"];
  const price = Number(room.price_per_night) || 0;
  const totalAmount = price * numDays;

  const handleBookNow = () => {
    nav({
      to: "/booking",
      search: {
        roomId: room.id,
        hotelId: (room as any).hotels?.id,
        checkInDate,
        numDays,
        numGuests,
      } as any,
    });
  };

  return (
    <WebsiteLayout>
      <div className="container-luxe pt-28 pb-20">
        <Link to="/rooms" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Rooms
        </Link>
        
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Section: Image Gallery & Details */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Gallery */}
            <div className="space-y-4">
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

            {/* Room Info */}
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-gold/10 text-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{(room as any).hotels?.name}</span>
                {room.status === "available" ? (
                  <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Available</span>
                ) : (
                  <span className="bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Limited</span>
                )}
              </div>
              
              <h1 className="font-bold text-3xl sm:text-4xl text-foreground mb-6">{CATEGORY_LABELS[room.category] || room.category}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">{room.description}</p>
              
              {/* Features Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-8 border-y border-border mb-8">
                <div className="flex flex-col gap-2 text-center items-center">
                  <div className="bg-primary/5 p-3 rounded-full text-primary"><Users className="h-5 w-5" /></div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capacity</div>
                    <div className="font-medium">Up to {room.max_guests}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-center items-center">
                  <div className="bg-primary/5 p-3 rounded-full text-primary"><BedDouble className="h-5 w-5" /></div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bed Type</div>
                    <div className="font-medium">{room.bed_type || "Standard"}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-center items-center">
                  <div className="bg-primary/5 p-3 rounded-full text-primary"><Home className="h-5 w-5" /></div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Floor</div>
                    <div className="font-medium">{room.floor || "N/A"}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-center items-center">
                  <div className="bg-primary/5 p-3 rounded-full text-primary"><Check className="h-5 w-5" /></div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Room No.</div>
                    <div className="font-medium">{room.room_number}</div>
                  </div>
                </div>
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

          {/* Right Section: Sticky Booking Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-card p-6 sm:p-8 rounded-xl shadow-card border border-border relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
              
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Starting from</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-bold text-3xl text-primary">{formatINR(price)}</span>
                  <span className="text-sm font-semibold text-muted-foreground">/ night</span>
                </div>
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Check-in Date</label>
                  <input 
                    type="date" 
                    min={isoDate(new Date())}
                    value={checkInDate} 
                    onChange={(e) => setCheckInDate(e.target.value)} 
                    className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Days</label>
                    <select 
                      value={numDays} 
                      onChange={(e) => setNumDays(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                    >
                      {[1,2,3,4,5,6,7,10,14,21,30].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Night' : 'Nights'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Guests</label>
                    <select 
                      value={numGuests} 
                      onChange={(e) => setNumGuests(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                    >
                      {Array.from({length: room.max_guests || 4}, (_, i) => i + 1).map(n => 
                        <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg mb-8 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">{formatINR(price)} × {numDays} nights</span>
                  <span className="text-sm font-medium text-foreground">{formatINR(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border mt-3">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-xl text-primary">{formatINR(totalAmount)}</span>
                </div>
              </div>

              <button 
                onClick={handleBookNow}
                disabled={room.status === "maintenance"}
                className="w-full bg-gold text-white py-4 text-sm font-bold uppercase tracking-wider rounded-md shadow-md hover:bg-gold-hover transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {room.status === "maintenance" ? "Under Maintenance" : "Book Now"} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </WebsiteLayout>
  );
}
