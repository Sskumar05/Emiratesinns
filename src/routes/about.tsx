import { createFileRoute, Link } from "@tanstack/react-router";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import logo from "@/assets/line_logo.png";
import { 
  Building2, Star, ShieldCheck, MapPin, 
  CheckCircle2, Clock, CalendarDays, BedDouble, 
  ArrowRight, Heart, Target, Award, Sparkles, Gem
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Emirates Inn Velankanni" },
      { name: "description", content: "Discover the story behind Emirates Inn & Emirates Grand Inn in Velankanni, Tamil Nadu. Learn about our standards, accommodations, and hospitality." },
      { property: "og:title", content: "About Emirates Inn Velankanni" },
      { property: "og:description", content: "Discover the story behind Emirates Inn & Emirates Grand Inn in Velankanni, Tamil Nadu." },
      { property: "og:url", content: "https://emiratesinns.com/about" },
    ],
    links: [
      { rel: "canonical", href: "https://emiratesinns.com/about" }
    ]
  }),
  component: About,
});

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

function AnimatedCounter({ end, prefix = "", suffix = "" }: { end: number, prefix?: string, suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, isInView]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

function About() {
  return (
    <WebsiteLayout>
      {/* 1. Hero Section */}
      {/* <section className="relative h-[60vh] min-h-[680px] flex items-center justify-center bg-gradient-to-b from-[#FAF9F6] to-[#F4F1EC]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-10"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-gold mb-8 inline-block">About Emirates</span>
          <h1 className="font-serif font-bold text-4xl md:text-6xl text-foreground tracking-tight leading-tight mb-8">
            Designed Around<br />
            <span className="italic font-light">Inspired by Genuine Hospitality.</span>
            <span className="italic font-light">Comfort.</span>
          </h1>
          <div className="w-16 h-[1px] bg-gold/50 mx-auto mb-8" />
          <div className="mb-[-10%] " ><img src={logo} alt="line" className="w-auto h-auto mt-[-16%] " /></div>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-[650px] mx-auto font-light">
            Discover the story behind Emirates Inn & Emirates Grand Inn, where exceptional hospitality, refined accommodations, and personalized service come together to deliver an unforgettable guest experience.</p>
        </motion.div>
      </section> */}


        <section
        className="relative flex items-center justify-center text-center"
        style={{
          background: "linear-gradient(160deg, #FAF9F6 0%, #F4F1EC 100%)",
          paddingTop: "clamp(7rem, 14vw, 10rem)",
          paddingBottom: "clamp(4rem, 8vw, 6rem)",
        }}
      >
        {/* Subtle decorative line */}
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
          {/* Small label */}
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.15em" }}
            animate={{ opacity: 1, letterSpacing: "0.35em" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-xs font-semibold uppercase text-gold mb-7 inline-block"
            style={{ letterSpacing: "0.35em" }}
          >
            About Emirates
          </motion.span>

          {/* Main heading */}
          <h1
            className="font-serif font-bold text-foreground tracking-tight leading-tight mb-7"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)" }}
          >
            Designed Around {" "}
            <span className="italic font-light">Comfort.</span>
          </h1>

          {/* Gold rule */}
          <div className="mb-[-10%]"><img src={logo} alt="line" className="w-auto h-auto mt-[-16%] " /></div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light">
            Discover the story behind  <strong className="font-medium text-foreground">Emirates Inn</strong> & <strong className="font-medium text-foreground">Emirates Grand Inn</strong>, where exceptional hospitality, refined accommodations, and personalized service come together to deliver an unforgettable guest experience.
          </p>
        </motion.div>
      </section>




      {/* 2. Who We Are */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[450px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl"
          >
            <img 
              src="https://res.cloudinary.com/dhjupdyus/image/upload/v1785691302/59bfe296-d4f8-4ad1-91a6-31721076c66d_oq6i5n.png" 
              alt="Emirates Inn Velankanni hotel interior" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>
          
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeUp}
            className="space-y-6"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-gold">Who We Are</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Hospitality Beyond Expectations</h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed font-light mt-8">
              <p>
                Emirates Inn was founded with a simple vision to provide guests with a stay that is warm, comfortable, and truly memorable. We believe exceptional hospitality is defined by thoughtful service, elegant accommodations, and attention to every detail that makes each visit special.</p>
              <p>
                Today, our family has grown to include Emirates Inn and Emirates Grand Inn. While each property offers its own unique experience, both are united by the same commitment to quality, comfort, and personalized hospitality. Whether you're traveling for business or leisure, we are dedicated to making every stay seamless, relaxing, and unforgettable.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Why Choose Emirates */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Why Choose Emirates</h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {[
              { icon: BedDouble, title: "Elegant Rooms", desc: "Designed for ultimate relaxation." },
              { icon: Building2, title: "Modern Amenities", desc: "Everything you need, beautifully appointed." },
              { icon: Heart, title: "Personalized Hospitality", desc: "Service tailored specifically to you." },
              { icon: MapPin, title: "Prime Location", desc: "Perfectly situated for business or leisure." },
              { icon: ShieldCheck, title: "Safe & Secure Stay", desc: "Your peace of mind is our priority." },
              { icon: CalendarDays, title: "Seamless Booking", desc: "Effortless reservations online." },
              { icon: Star, title: "Exceptional Experience", desc: "Creating moments you'll remember." },
              { icon: Clock, title: "24/7 Guest Support", desc: "We're here for you, anytime." },
            ].map((feature, i) => (
              <motion.div 
                variants={fadeUp} 
                key={i}
                className="group bg-card p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border/50 text-center hover:shadow-[0_8px_30px_-4px_rgba(212,175,55,0.15)] hover:-translate-y-1 hover:border-gold/30 transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-gold" strokeWidth={1.5} />
                </div>
                <h4 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Our Properties (Alternating Layout) */}
      <section className="py-32 max-w-7xl mx-auto px-6 space-y-32">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-gold mb-3 inline-block">Our Portfolio</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Discover Our Properties</h2>
        </div>

        {/* Section One */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl group"
          >
            <img 
              src="https://res.cloudinary.com/dhjupdyus/image/upload/v1785690673/e35bc825-463f-4aca-9daa-7b062c3d5121_znb74h.png" 
              alt="Emirates Inn Velankanni exterior" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Emirates Inn</h3>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              A refined hospitality destination where contemporary comfort meets exceptional service. Designed to exceed the expectations of both business and leisure travelers, Emirates Inn offers thoughtfully appointed accommodations, modern conveniences, and an atmosphere of understated elegance, ensuring every stay is both comfortable and memorable.</p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-center gap-4 text-foreground"><CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" /> Contemporary Elegant Accommodations</li>
              <li className="flex items-center gap-4 text-foreground"><CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" /> Business & Leisure Excellence</li>
              <li className="flex items-center gap-4 text-foreground"><CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" />Personalized Guest Experience</li>
            </ul>
          </motion.div>
        </div>

        {/* Section Two */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6 order-2 md:order-1"
          >
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Emirates Grand Inn</h3>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              The pinnacle of luxury hospitality, Emirates Grand Inn delivers an extraordinary experience defined by sophisticated design, impeccable craftsmanship, and exceptional service. From elegantly appointed suites to personalized guest experiences, every detail reflects our unwavering commitment to excellence and timeless luxury.</p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-center gap-4 text-foreground"><CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" /> Premium Luxury Accommodations</li>
              <li className="flex items-center gap-4 text-foreground"><CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" />Timeless Elegant Interiors</li>
              <li className="flex items-center gap-4 text-foreground"><CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" /> Exceptional Personalized Hospitality</li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl group order-1 md:order-2"
          >
            <img 
              src="https://res.cloudinary.com/dhjupdyus/image/upload/v1785690469/grandinn_o4eiy3.png" 
              alt="Emirates Grand Inn Velankanni exterior" 
              className="w-full h-full object-full group-hover:scale-105 transition-transform duration-1000"
            />
          </motion.div>
        </div>
      </section>


            {/* 7. Statistics */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-12"
          >
            {[
              { n: 2, p: "0", s: "", l: "Luxury Properties" }, 
              { n: 120, p: "", s: "+", l: "Elegant Rooms" }, 
              { n: 1350, p: "",s: "+", l: "Guest Experience" },
              { n: 24, p: "", s: "/7", l: "Guest Support" }
            ].map((s, i) => (
              <motion.div variants={fadeUp} key={i} className="text-center">
                <div className="font-serif font-bold text-5xl md:text-6xl text-primary mb-4 flex items-center justify-center">
                  <AnimatedCounter end={s.n} prefix={s.p} suffix={s.s} />
                </div>
                <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{s.l}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* 5. Our Hospitality Promise */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold">Our Hospitality Promise</h2>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: Target, title: "Our Mission", desc: "To provide exceptional hospitality through comfortable accommodations, personalized service, and memorable guest experiences." },
              { icon: Award, title: "Our Vision", desc: "To be a trusted hospitality brand recognized for excellence, comfort, and exceptional guest experiences." },
              { icon: ShieldCheck, title: "Our Commitment", desc: "To uphold the highest standards of quality, ensuring every guest feels welcomed, valued, and genuinely cared for throughout their stay." }
            ].map((item, i) => (
              <motion.div 
                variants={fadeUp}
                key={i}
                className="bg-primary-foreground/5 p-10 rounded-2xl backdrop-blur-sm border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors"
              >
                <item.icon className="w-10 h-10 text-gold mb-6" strokeWidth={1.5} />
                <h3 className="text-2xl font-serif font-bold mb-4">{item.title}</h3>
                <p className="text-primary-foreground/80 leading-relaxed font-light">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. Our Core Values */}
      {/* <section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-gold mb-3 inline-block">The Foundation</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Our Core Values</h2>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-5 gap-6"
        >
          {[
            { icon: Award, title: "Excellence" },
            { icon: Heart, title: "Hospitality" },
            { icon: BedDouble, title: "Comfort" },
            { icon: ShieldCheck, title: "Integrity" },
            { icon: Sparkles, title: "Innovation" },
          ].map((val, i) => (
            <motion.div 
              variants={fadeUp} 
              key={i}
              className="bg-card py-10 px-6 rounded-xl shadow-sm border border-border/50 text-center hover:shadow-[0_8px_30px_-4px_rgba(212,175,55,0.15)] hover:border-gold/30 transition-all duration-300"
            >
              <val.icon className="w-8 h-8 text-gold mx-auto mb-4" strokeWidth={1.5} />
              <h4 className="font-serif font-bold text-xl text-foreground">{val.title}</h4>
            </motion.div>
          ))}
        </motion.div>
      </section> */}

      

      {/* 8. Luxury Image Banner */}
      {/* <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=2000&q=80" 
            alt="Luxury Lifestyle" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center px-6 max-w-4xl"
        >
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-white tracking-tight leading-tight">
            Creating Memorable Stays Through <br className="hidden sm:block" />
            <span className="italic font-light">Exceptional Hospitality.</span>
          </h2>
        </motion.div>
      </section> */}

      {/* 9. Final Section (CTA) */}
      <section className="py-32 bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto px-6 text-center"
        >
          {/* <Gem className="w-12 h-12 text-gold mx-auto mb-8" strokeWidth={1} /> */}
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Book Your Stay</h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed font-light">
            Experience comfort, elegance, and personalized hospitality at Emirates Inn & Emirates Grand Inn.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/rooms" 
              className="w-full sm:w-auto px-10 py-4 rounded-2xl border border-foreground text-foreground font-medium hover:bg-foreground hover:text-background transition-colors duration-300 uppercase tracking-widest text-sm"
            >
              Explore Rooms
            </Link>
            <Link 
              to="/contact" 
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gold text-white font-medium hover:bg-gold/90 transition-colors duration-300 uppercase tracking-widest text-sm shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] flex items-center justify-center gap-3"
            >
              contact us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </WebsiteLayout>
  );
}
