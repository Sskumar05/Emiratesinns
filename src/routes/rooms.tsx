import { createFileRoute, Link } from "@tanstack/react-router";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABELS, formatINR } from "@/lib/hotel";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Wifi, Tv, Car, Droplet, ChefHat, Camera, Wine, ArrowRight, Ban } from "lucide-react";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms & Suites — Emirates Inn" },
      { name: "description", content: "Browse our curated collection of thoughtfully designed rooms and suites at Emirates Inn & Emirates Grand Inn." },
    ],
  }),
  component: RoomsPage,
});

/* ─── Static maps ─────────────────────────────────────────── */
const AMENITY_ICON: Record<string, typeof Wifi> = {
  WiFi: Wifi, TV: Tv, Parking: Car, "Hot Water": Droplet,
  Kitchen: ChefHat, CCTV: Camera, "Welcome Drink": Wine,
};
const ROOM_IMG = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80";

/* ─── Animation Variants ─────────────────────────────────── */
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

/* ─── Hotel section config ───────────────────────────────── */
const HOTEL_SECTIONS = [
  {
    slug: "emirates-inn",
    title: "Emirates Inn",
    // category + optional room_type combos that belong to this hotel
    allowedTypes: [
      { category: "ac_double", room_type: "NON AC" },  // Deluxe (NON AC)
      { category: "ac_double", room_type: "AC" },      // Deluxe (AC)
      { category: "ac_four",   room_type: null },       // Four Bed
    ],
  },
  {
    slug: "emirates-grand-inn",
    title: "Emirates Grand Inn",
    allowedTypes: [
      { category: "ac_double", room_type: "AC" },      // Deluxe (AC)
      { category: "ac_triple", room_type: "AC" },      // Triple (AC)
    ],
  },
];

/* ─── RoomCard ───────────────────────────────────────────── */
function RoomCard({ r, is12HoursMode }: { r: any; is12HoursMode: boolean }) {
  const isSoldOut = r._availableCount === 0;

  return (
    <motion.div
      key={`${r.hotel_id ?? ""}_${r.category}_${r.room_type || "none"}`}
      variants={cardVariant}
      className="group flex flex-col w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)]"
      style={{
        background: "#FFFFFF",
        border: isSoldOut
          ? "1px solid rgba(0,0,0,0.08)"
          : "1px solid rgba(180,155,90,0.18)",
        borderRadius: "22px",
        boxShadow: "0 4px 20px -6px rgba(13,35,58,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        overflow: "hidden",
        opacity: isSoldOut ? 0.72 : 1,
        transition: "box-shadow 350ms ease, transform 350ms ease, border-color 350ms ease",
      }}
      whileHover={isSoldOut ? {} : {
        y: -6,
        boxShadow: "0 16px 40px -8px rgba(13,35,58,0.14), 0 0 0 1px rgba(180,155,90,0.32)",
      }}
    >
      {/* ── Thumbnail ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
        <img
          src={r.images?.[0] || ROOM_IMG}
          alt={CATEGORY_LABELS[r.category] ?? r.category}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-600 ${
            isSoldOut ? "grayscale" : "group-hover:scale-[1.06]"
          }`}
          style={{ display: "block" }}
        />

        {/* Hotel name badge — top left */}
        <div
          className="absolute top-4 left-4"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(6px)",
            borderRadius: "8px",
            padding: "4px 10px",
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
            border: "1px solid rgba(180,155,90,0.25)",
          }}
        >
          {r.hotels?.name}
        </div>

        {/* Sold-out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span
              className="text-white font-bold text-xs uppercase tracking-widest"
              style={{
                background: "rgba(180,30,30,0.92)",
                borderRadius: "999px",
                padding: "6px 18px",
                backdropFilter: "blur(4px)",
              }}
            >
              Sold Out
            </span>
          </div>
        )}

        {/* Bottom gradient for depth */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.18), transparent)" }}
        />
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-6">

        {/* Title + Price row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-3">
            <h3
              className="font-serif font-bold text-foreground leading-tight"
              style={{ fontSize: "1.2rem" }}
            >
              {CATEGORY_LABELS[r.category] ?? r.category} {r.room_type ? `(${r.room_type})` : ""}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-light">
              {r._totalCount} room{r._totalCount !== 1 ? "s" : ""} available
            </p>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <div
              className="font-bold text-foreground"
              style={{ fontSize: "1.18rem", letterSpacing: "-0.02em" }}
            >
              {formatINR(is12HoursMode ? (r.price_12_hours || r.price_per_night) : r.price_per_night)}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-0.5">
              {is12HoursMode ? "12 Hours" : "per night"}
            </div>
          </div>
        </div>

        {/* Gold separator */}
        <div
          className="w-8 h-px mb-5"
          style={{ background: "rgba(180,155,90,0.4)" }}
        />

        {/* Amenity icons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(r.amenities ?? []).slice(0, 5).map((a: string) => {
            const I = AMENITY_ICON[a];
            return I ? (
              <div
                key={a}
                title={a}
                className="flex items-center justify-center"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "rgba(180,155,90,0.08)",
                  border: "1px solid rgba(180,155,90,0.2)",
                }}
              >
                <I className="text-gold" style={{ width: 15, height: 15 }} strokeWidth={1.5} />
              </div>
            ) : null;
          })}
        </div>

        {/* CTA — always pushed to bottom */}
        <div className="mt-auto">
          {isSoldOut ? (
            <div
              className="w-full flex items-center justify-center gap-2 font-semibold text-sm cursor-not-allowed select-none"
              style={{
                background: "rgba(0,0,0,0.04)",
                color: "var(--color-muted-foreground)",
                borderRadius: "12px",
                padding: "13px 0",
                border: "1px solid rgba(0,0,0,0.07)",
              }}
            >
              <Ban className="h-4 w-4" /> Sold Out
            </div>
          ) : (
            <Link
              to="/rooms/$id"
              params={{ id: r.id }}
              className="w-full block text-center font-semibold text-sm text-white hover:opacity-90 transition-opacity"
              style={{
                background: "var(--color-gold)",
                borderRadius: "12px",
                padding: "13px 0",
                boxShadow: "0 4px 14px -4px rgba(180,155,90,0.5)",
              }}
            >
              View Details &amp; Book{" "}
              <ArrowRight className="inline h-4 w-4 ml-1" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── HotelSection ───────────────────────────────────────── */
function HotelSection({
  title,
  cards,
  is12HoursMode,
}: {
  title: string;
  cards: any[];
  is12HoursMode: boolean;
}) {
  return (
    <div className="mb-16">
      {/* Section heading */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-8 h-px" style={{ background: "rgba(180,155,90,0.5)" }} />
        <h2
          className="font-serif font-bold text-foreground"
          style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
        >
          {title}
        </h2>
        <div className="flex-1 h-px" style={{ background: "rgba(180,155,90,0.15)" }} />
      </div>

      {cards.length === 0 ? (
        <div
          className="text-center py-14 rounded-2xl"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(180,155,90,0.12)",
            color: "var(--color-muted-foreground)",
          }}
        >
          <p className="font-light text-base">No rooms available for {title} at the moment.</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="flex flex-wrap justify-center gap-8"
        >
          {cards.map((r: any) => (
            <RoomCard
              key={`${r.hotel_id ?? ""}_${r.category}_${r.room_type || "none"}`}
              r={r}
              is12HoursMode={is12HoursMode}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────── */
function RoomsPage() {
  /* ── Data fetching (single query) ── */
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data } = await supabase
        .from("rooms")
        .select("*, hotels(name, slug, id)")
        .order("price_per_night");
      return data ?? [];
    },
  });

  /* ── Load Global Stay Mode ── */
  const { data: stayModeData } = useQuery({
    queryKey: ["system_settings", "global_stay_mode"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("value")
          .eq("key", "global_stay_mode")
          .maybeSingle();
        if (error) return "standard";
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

  /* ── Group rooms by hotel slug, de-duplicate by category+room_type ── */
  const groupedByHotel = useMemo(() => {
    // First, de-duplicate: one card per (hotel_id, category, room_type) combo
    const cardMap: Record<string, any> = {};
    for (const r of rooms) {
      const hotelSlug = (r as any).hotels?.slug ?? "";
      const key = `${hotelSlug}__${(r as any).category}__${(r as any).room_type || "none"}`;
      if (!cardMap[key]) {
        cardMap[key] = { ...r, _availableCount: 0, _maintenanceCount: 0, _totalCount: 0 };
      }
      cardMap[key]._totalCount++;
      if ((r as any).status === "available") cardMap[key]._availableCount++;
      if ((r as any).status === "maintenance") cardMap[key]._maintenanceCount++;
    }
    const deduped = Object.values(cardMap);

    // Then group by hotel slug
    const bySlug: Record<string, any[]> = {};
    for (const card of deduped) {
      const slug = (card as any).hotels?.slug ?? "";
      if (!bySlug[slug]) bySlug[slug] = [];
      bySlug[slug].push(card);
    }
    return bySlug;
  }, [rooms]);

  /* ── For each hotel section, filter to only the allowed room types ── */
  const sectionCards = useMemo(() => {
    return HOTEL_SECTIONS.map((section) => {
      const hotelCards = groupedByHotel[section.slug] ?? [];
      const filtered = hotelCards.filter((card: any) =>
        section.allowedTypes.some((allowed) => {
          const categoryMatch = card.category === allowed.category;
          const typeMatch =
            allowed.room_type === null
              ? true
              : card.room_type === allowed.room_type;
          return categoryMatch && typeMatch;
        })
      );
      return { ...section, cards: filtered };
    });
  }, [groupedByHotel]);

  return (
    <WebsiteLayout>

      {/* ── 1. HERO ───────────────────────────────────────── */}
      <section
        className="relative flex items-center justify-center text-center"
        style={{
          background: "linear-gradient(160deg, #FAF9F6 0%, #F4F1EC 100%)",
          paddingTop: "clamp(7rem, 14vw, 10rem)",
          paddingBottom: "clamp(4rem, 8vw, 6rem)",
        }}
      >
        {/* Bottom hairline */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(0,0,0,0.06), transparent)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="px-6 max-w-4xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.1 }}
            className="text-xs font-semibold uppercase text-gold mb-7 inline-block"
            style={{ letterSpacing: "0.35em" }}
          >
            Accommodations
          </motion.span>

          <h1
            className="font-serif font-bold text-foreground tracking-tight leading-tight mb-7"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)" }}
          >
            Rooms &amp;{" "}
            <span className="italic font-light">Suites.</span>
          </h1>

          <div className="w-14 h-px bg-gold/50 mx-auto mb-8" />

          <p
            className="text-muted-foreground leading-relaxed font-light max-w-2xl mx-auto"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)" }}
          >
            Choose from our thoughtfully designed rooms and suites, crafted for
            comfort, elegance, and a memorable stay at{" "}
            <strong className="font-medium text-foreground">Emirates Inn</strong> &{" "}
            <strong className="font-medium text-foreground">Emirates Grand Inn</strong>.
          </p>
        </motion.div>
      </section>

      {/* ── 2. HOTEL SECTIONS ─────────────────────────────── */}
      <section
        className="pt-14 pb-28"
        style={{ background: "#FAF9F6" }}
      >
        <div className="container-luxe">
          {isLoading ? (
            <div className="text-center py-28 text-muted-foreground font-light text-lg">
              Loading rooms…
            </div>
          ) : (
            sectionCards.map((section) => (
              <HotelSection
                key={section.slug}
                title={section.title}
                cards={section.cards}
                is12HoursMode={is12HoursMode}
              />
            ))
          )}
        </div>
      </section>

    </WebsiteLayout>
  );
}
