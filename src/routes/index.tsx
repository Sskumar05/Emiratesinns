import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Wifi, Car, Droplet, Camera, Tv, ChefHat, Wine, Sparkles, MapPin, Star, ArrowRight, Building, Award, Navigation, BedDouble, ShieldCheck, Clock, ChevronDown } from "lucide-react";
import heroImg from "@/assets/hero-hotel.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Emirates Inn & Grand Inn — Luxury Hotels in Dubai" },
      { name: "description", content: "Boutique luxury at Emirates Inn and flagship grandeur at Emirates Grand Inn. Book your stay." },
    ],
  }),
  component: Home,
});

const AMENITIES = [
  { icon: Wifi, label: "Complimentary WiFi" },
  { icon: Car, label: "Car Parking" },
  { icon: Droplet, label: "Hot Water" },
  { icon: Camera, label: "24/7 CCTV" },
  { icon: Tv, label: "Smart TV" },
  { icon: ChefHat, label: "Kitchen Facility" },
  { icon: Wine, label: "Welcome Drink" },
  { icon: Sparkles, label: "Concierge Service" },
];

const TESTIMONIALS = [
  { name: "Aarav S.", text: "Impeccable service and the most elegant rooms I've stayed in. Truly five-star.", rating: 5 },
  { name: "Priya M.", text: "Emirates Grand Inn redefined luxury for us. Will be returning soon.", rating: 5 },
  { name: "Rohan K.", text: "Discreet, warm and refined. The welcome drink set the tone perfectly.", rating: 5 },
];

const WHY_CHOOSE_US = [
  {
    icon: Award,
    title: "Premium Hospitality",
    description: "Our dedicated staff delivers warm, attentive service that anticipates your every need from arrival to departure.",
  },
  {
    icon: Navigation,
    title: "Prime Location",
    description: "Centrally situated with easy access to business districts, attractions, and transport hubs across the city.",
  },
  {
    icon: BedDouble,
    title: "Luxurious Rooms",
    description: "Elegantly appointed suites and rooms designed for restful comfort, featuring premium bedding and modern interiors.",
  },
  {
    icon: Wifi,
    title: "Complimentary WiFi",
    description: "Stay seamlessly connected with high-speed, complimentary WiFi available throughout all our properties.",
  },
  {
    icon: Car,
    title: "Secure Parking",
    description: "Enjoy peace of mind with our dedicated, well-lit, and secure parking facility available for all guests.",
  },
  {
    icon: Clock,
    title: "24×7 Guest Support",
    description: "Our front desk and concierge team are available around the clock to assist you with any request.",
  },
];

const FAQS = [
  {
    q: "What are the Check-in and Check-out timings?",
    a: "• Check-in is available from the hotel's standard check-in time, subject to room availability.\n• Check-out must be completed before the hotel's standard check-out time to ensure timely room preparation.\n• Early check-in and late check-out requests may be accommodated based on availability and may be subject to additional charges.",
  },
  {
    q: "Is complimentary WiFi available?",
    a: "• Yes, complimentary high-speed WiFi is available throughout the hotel for all registered guests.\n• Guests can enjoy uninterrupted internet access in guest rooms, lobby areas, and common spaces.\n• WiFi is suitable for browsing, video streaming, online meetings, and business requirements.",
  },
  {
    q: "Is free parking available?",
    a: "• Yes, secure on-site parking is available for all hotel guests at no additional cost.\n\n• The parking area is monitored to provide a safe and convenient experience for your vehicle.\n• Parking spaces are subject to availability during peak occupancy periods.",
  },
  {
    q: "Can I cancel or modify my booking?",
    a: "• Yes, bookings can be modified or cancelled according to the cancellation policy of the selected room.\n• Cancellation eligibility and refund conditions may vary depending on the booking type and rate plan.\n• For assistance with modifications or cancellations, guests can contact our support team before the scheduled check-in date.",
  },
  {
    q: "Do you offer family rooms?",
    a: "• Yes, we offer spacious room options suitable for families, groups, and long-stay guests.\n• Family-friendly accommodations are available with comfortable bedding and essential amenities.\n• Room availability depends on the selected hotel, travel dates, and current occupancy.",
  },
  {
    q: "How can I contact the hotel?",
    a: "• You can reach our team through the Contact page, phone number, or official email provided on our website.\n• Our customer support team is available to assist with reservations, booking enquiries, and general information.\n• We are committed to providing prompt assistance to ensure a smooth and comfortable stay before, during, and after your visit.",
  },
];

function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="relative h-[100vh] min-h-[640px] -mt-20 flex items-center">
        <img src={heroImg} alt="Emirates Inn lobby" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1280} />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="container-luxe relative z-10 pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6 font-semibold">
              {/* <Building className="h-5 w-5" /> */}
              <span className="text-xs uppercase tracking-widest text-white rounded-md px-2 py-1 bg-blue-900/20">A Curated Collection</span>
            </div>
            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6 text-white tracking-tight">
              Where Every Stay<br /><span className="text-gold">Becomes a Memory.</span>
            </h1>
            <p className="text-xs md:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed font-light">
              Two Exceptional Destinations, One Promise of Luxury.
              <p>Experience the elegance of Emirates Inn & Emirates Grand Inn.</p>
            </p>
    
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/rooms" className="bg-gold text-white px-8 py-4 text-sm font-semibold rounded-3xl shadow-md inline-flex items-center justify-center gap-2 hover:bg-gold-hover transition">
                Reserve Your Stay <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 text-sm font-semibold rounded-3xl inline-flex items-center justify-center hover:bg-white/20 transition">
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hotel showcase */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="container-luxe">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider text-gold">The Collection</span>
            <h2 className="font-serif font-bold text-4xl md:text-5xl mt-4 text-foreground tracking-tight">Two Properties. One Standard.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { slug: "emirates-inn", name: "Emirates Inn", tag: "Boutique Refinement", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80" },
              { slug: "emirates-grand-inn", name: "Emirates Grand Inn", tag: "Flagship Luxury", img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80" },
            ].map((h, i) => (
              <motion.div key={h.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                onClick={() => navigate({ to: '/rooms', search: { hotel: h.slug } })}
                className="group relative overflow-hidden bg-card rounded-3xl shadow-card border border-border flex flex-col cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={h.img} alt={h.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gold mb-2 block">{h.tag}</span>
                    <h3 className="font-serif font-bold text-2xl mb-4 text-foreground">{h.name}</h3>
                  </div>
                  <Link to="/rooms" search={{ hotel: h.slug }} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-gold transition mt-4">
                    Explore Rooms <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 lg:py-32 bg-surface border-y border-border">
        <div className="container-luxe">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider text-gold">Our Promise</span>
            <h2 className="font-serif font-bold text-4xl md:text-5xl mt-4 text-foreground tracking-tight">Why Choose Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_CHOOSE_US.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="group p-8 rounded-4xl bg-card shadow-sm border border-border hover:shadow-md hover:border-gold/50 transition-all"
              >
                <div className="bg-primary/5 h-12 w-12 rounded-full flex items-center justify-center mb-5 group-hover:bg-gold/10 transition-colors">
                  <item.icon className="h-6 w-6 text-primary group-hover:text-gold transition-colors" />
                </div>
                <h3 className="font-serif font-bold text-lg text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

     

      {/* Gallery preview */}
      <section className="py-24 bg-background">
        <div className="container-luxe">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-gold">Moments</span>
              <h2 className="font-serif font-bold text-4xl md:text-5xl mt-3 text-foreground tracking-tight">Elegant Spaces</h2>
            </div>
            <Link to="/gallery" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-gold transition">
              View Gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-x-auto">
            {[
              "1582719478250-c89cae4dc85b","1611892440504-42a792e24d32", "1590490360182-c33d57733427","1551882547-ff40c63fe5fa", 
            ].map((id, i) => (
              <motion.div key={id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`overflow-hidden rounded-lg ${i === 0 || i === 5 ? " aspect-square" : "aspect-square"}`}>
                <img src={`https://images.unsplash.com/photo-${id}?w=600&q=80`} alt="" loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>


             {/* Amenities */}
      <section className="py-24 bg-surface border-y border-border">
        <div className="container-luxe">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider text-gold">Curated Comforts</span>
            <h2 className="font-serif font-bold text-4xl md:text-5xl mt-4 text-foreground tracking-tight">Amenities, perfected</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {AMENITIES.map((a, i) => (
              <motion.div key={a.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group p-6 rounded-2xl bg-card shadow-sm border border-border text-center hover:shadow-md hover:border-gold/50 transition-all">
                <div className="bg-primary/5 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/10 transition-colors">
                  <a.icon className="h-6 w-6 text-primary group-hover:text-gold transition-colors" />
                </div>
                <p className="text-sm font-medium text-foreground">{a.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container-luxe">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider text-gold">Voices</span>
            <h2 className="font-serif font-bold text-4xl md:text-5xl mt-4 tracking-tight">What our guests say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-8 bg-card rounded-2xl shadow-card text-foreground">
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 text-gold fill-gold" />)}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed font-light">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">Verified Guest</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 lg:py-32  border-y border-border">
        <div className="container-luxe">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider text-gold">Got Questions?</span>
            <h2 className="font-serif font-bold text-4xl md:text-5xl mt-4 text-foreground tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto divide-y divide-border">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 py-6 text-left focus:outline-none group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="font-semibold text-foreground group-hover:text-gold transition-colors text-base">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180 text-gold" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <ul className="pb-6 space-y-2 list-disc list-inside text-sm text-muted-foreground leading-relaxed font-light">
                        {faq.a.split("\n").filter(Boolean).map((point, j) => (
                          <li key={j}>{point.replace(/^•\s*/, "")}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-surface">
        <div className="container-luxe text-center">
          {/* <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-border">
            <MapPin className="h-8 w-8 text-primary" />
          </div> */}
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-6xl mb-6 text-foreground tracking-tight">Book Your Stay</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-10 text-lg font-light">Reserve your perfect room and enjoy exceptional comfort, premium hospitality, and a memorable stay with us.</p>
          <Link to="/rooms" className="bg-gold text-white px-10 py-4 text-sm font-semibold rounded-2xl shadow-md inline-flex items-center gap-2 hover:bg-gold-hover transition">
            Begin Reservation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </WebsiteLayout>
  );
}
