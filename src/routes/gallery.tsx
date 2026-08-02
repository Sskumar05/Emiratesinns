import { createFileRoute } from "@tanstack/react-router";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { motion } from "framer-motion";
import logo from "@/assets/line_logo.png";


export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Emirates Inn" },
      {
        name: "description",
        content:
          "Explore the elegant spaces, comfortable rooms, and welcoming atmosphere of Emirates Inn & Emirates Grand Inn through our curated gallery.",
      },
    ],
  }),
  component: Gallery,
});

/* ─── Animation Variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
};

const imgVariant = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.75, ease: "easeOut" },
  },
};

/* ─── Gallery Images ─────────────────────────────────────── */
export const PHOTOS: string[] = [
  "https://res.cloudinary.com/dhjupdyus/image/upload/v1785692537/IMG_20260620_180811.jpg_igyitw.jpg",
  "https://res.cloudinary.com/dhjupdyus/image/upload/v1785692566/IMG_20260620_180855.jpg_1_hsnghz.jpg",
  "https://res.cloudinary.com/dhjupdyus/image/upload/v1785692578/IMG_20260620_181127.jpg_1_gz3ev0.jpg",
  "https://res.cloudinary.com/dhjupdyus/image/upload/v1785692578/IMG_20260620_181225.jpg_1_o8unp0.jpg",
  "https://res.cloudinary.com/dhjupdyus/image/upload/v1785692515/IMG_20260620_180932.jpg_1_xvrwyr.jpg",
  "https://res.cloudinary.com/dhjupdyus/image/upload/v1785692560/IMG_20260620_181119.jpg_1_j2xonk.jpg",
  "https://res.cloudinary.com/dhjupdyus/image/upload/v1785692625/IMG_20260620_182632.jpg_okqijl.jpg",
  "https://res.cloudinary.com/dhjupdyus/image/upload/v1785692668/IMG_20260620_181442.jpg_nfwf48.jpg",
  "https://res.cloudinary.com/dhjupdyus/image/upload/v1785692668/IMG_20260620_182537.jpg_wjkuha.jpg",
  "https://res.cloudinary.com/dhjupdyus/image/upload/v1785692678/IMG_20260620_183156.jpg_kffxxn.jpg",
  "https://res.cloudinary.com/dhjupdyus/image/upload/v1785692682/IMG_20260620_182907_1.jpg_q7q6tt.jpg",
  "https://res.cloudinary.com/dhjupdyus/image/upload/v1785692662/IMG_20260620_181904.jpg_cckcdu.jpg",
];

/* ─── Component ──────────────────────────────────────────── */
function Gallery() {
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
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(0,0,0,0.06), transparent)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="px-6 max-w-4xl mx-auto"
        >
          {/* Small label */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.1 }}
            className="text-xs font-semibold uppercase text-gold mb-7 inline-block"
            style={{ letterSpacing: "0.35em" }}
          >
            Our Gallery
          </motion.span>

          {/* Main heading */}
          <h1
            className="font-serif font-bold text-foreground tracking-tight leading-tight mb-7"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)" }}
          >
            Discover the Beauty of{" "}
            <span className="italic font-light">Every Stay.</span>
          </h1>

          {/* Gold rule */}
          <div className="mb-[-10%]"><img src={logo} alt="line" className="w-auto h-auto mt-[-16%] " /></div>

          {/* Subtitle */}
          <p
            className="text-muted-foreground leading-relaxed font-light max-w-2xl mx-auto"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)" }}
          >
            Explore the elegant spaces, comfortable rooms, modern amenities, and welcoming
            atmosphere of{" "}
            <strong className="font-medium text-foreground">Emirates Inn</strong> &{" "}
            <strong className="font-medium text-foreground">Emirates Grand Inn</strong> through
            our gallery.
          </p>
        </motion.div>
      </section>

      {/* ── 2. GALLERY ───────────────────────────────────── */}
      <section
        className="py-24"
        style={{ background: "#FAF9F6" }}
      >
        <div className="container-luxe">
          {/* Uniform 3-col grid: 1-col mobile → 2-col tablet → 3-col desktop */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: "28px" }}
          >
            {PHOTOS.map((url) => (
              <motion.div
                key={url}
                variants={imgVariant}
              >
                <div
                  className="group relative overflow-hidden"
                  style={{
                    borderRadius: "22px",
                    boxShadow:
                      "0 4px 20px -4px rgba(13,35,58,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                    transition: "box-shadow 400ms ease, transform 400ms ease",
                    aspectRatio: "4 / 3",
                  }}
                >
                  {/* Image */}
                  <img
                    src={url}
                    alt="Emirates Inn — gallery"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05] cursor-pointer"
                    style={{ display: "block" }}
                  />

                  {/* Hover dark overlay — fades in on group hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(10,20,35,0.0) 40%, rgba(10,20,35,0.30) 100%)",
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </WebsiteLayout>
  );
}
