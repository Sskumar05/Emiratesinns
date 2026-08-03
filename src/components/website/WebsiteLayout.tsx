import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Menu, X, Phone, Mail, MapPin, Building } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emirates from "../../assets/emirates_logo.png"

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/rooms", label: "Rooms" },
  { to: "/amenities", label: "Amenities" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function WebsiteLayout({ children }: { children?: ReactNode } = {}) {
  const [open, setOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    if (open) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => { 
      document.body.style.overflow = ""; 
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    // Restore focus to hamburger button after drawer closes
    setTimeout(() => hamburgerRef.current?.focus(), 50);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 text-white transition-all duration-300" style={{ backgroundColor: "#0A1A2F", borderBottom: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 30px rgba(0,0,0,0.25)" }}>
        <div className="container-luxe flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div>
              {/* <Building className="h-6 w-6 text-primary-foreground transition-transform group-hover:scale-105" /> */}
              <img src={emirates} className="h-15 w-15" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-xl tracking-tight text-white">Emirates</div>
              {/* <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">& Grand Collection</div> */}
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to as "."}
                className={`text-sm font-medium transition-colors ${path === n.to ? "text-white font-semibold" : "text-primary-foreground/80 hover:text-white"}`}>
                {n.label}
              </Link>
            ))}
            {/* <Link to="/rooms" className="bg-gold text-white px-5 py-2.5 text-sm font-medium rounded-md hover:bg-gold-hover transition shadow-sm">
              Request Booking
            </Link> */}
          </nav>
          <button
            ref={hamburgerRef}
            className="md:hidden text-primary-foreground hover:text-white transition-colors p-1"
            onClick={() => setOpen(true)}
            aria-label="Open Menu"
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        {/* ── Mobile: full-width top overlay (outside header flow so it doesn't push content) ── */}
        <AnimatePresence>
          {open && (
            <>
              {/* Blurred backdrop — sits behind the panel */}
              <motion.div
                key="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden fixed inset-0 z-[55]"
                style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
                aria-hidden="true"
              />

              {/* Left-side slide drawer */}
              <motion.div
                key="mobile-nav-panel"
                id="mobile-nav-panel"
                initial={{ x: "-90%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="md:hidden fixed top-0 left-0 h-full z-[80]"
                style={{
                  width: "75%",
                  maxWidth: "320px",
                  backgroundColor: "#0c101fff",
                  borderRight: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "4px 0 40px rgba(0,0,0,0.5)",
                  willChange: "transform",
                  display: "flex",
                  flexDirection: "column",
                }}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Navigation Menu"
              >
                {/* Panel header — logo + close button */}
                <div
                  className="flex items-center justify-between h-20 px-6"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}
                >
                  <Link to="/" className="flex items-center gap-3 group" onClick={closeMenu}>
                    <img src={emirates} className="h-12 w-12" alt="Emirates Logo" />
                    <div className="font-bold text-xl ml-[-10] tracking-tight text-white leading-tight">Emirates</div>
                  </Link>
                  <button
                    className="text-primary-foreground hover:text-white transition-colors p-2 -mr-1"
                    onClick={closeMenu}
                    aria-label="Close Menu"
                    autoFocus
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Nav links */}
                <nav className="px-6 py-5 flex flex-col" style={{ gap: "18px" }}>
                  {NAV.map((n) => {
                    const isActive = path === n.to;
                    return (
                      <Link
                        key={n.to}
                        to={n.to as "."}
                        onClick={closeMenu}
                        className={`text-base font-medium flex items-center gap-3 transition-colors ${
                          isActive ? "text-white font-semibold" : "text-primary-foreground/75 hover:text-white"
                        }`}
                      >
                        {/* Active indicator dot */}
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0 transition-opacity"
                          style={{ backgroundColor: "#C9A84C", opacity: isActive ? 1 : 0 }}
                        />
                        {n.label}
                      </Link>
                    );
                  })}

                  {/* Request Booking CTA */}
                  {/* <div style={{ paddingTop: "24px", paddingBottom: "8px" }}>
                    <Link
                      to="/rooms"
                      onClick={closeMenu}
                      className="block w-half bg-gold text-white px-4 py-3 text-sm font-medium text-center rounded-md shadow-sm hover:bg-gold-hover transition-colors"
                    >
                      Request Booking
                    </Link>
                  </div> */}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children ?? <Outlet />}</main>

      <footer className="bg-primary text-primary-foreground mt-">
        {/*
          Layout:
            Mobile/tablet  → single column, stacked vertically
            Desktop (lg+)  → two flex children:
              • Brand: ~42% wide, left-aligned
              • Nav group: ~58% wide, flex justify-end so columns hug the right edge
        */}
        <div
          className="container-luxe py-16 flex flex-col lg:flex-row lg:items-start gap-12"
        >

          {/* ── Brand Column ── */}
          <div className="w-full lg:w-[42%] max-w-[416px]">
            <div className="flex items-center gap-3 mb-5">
              <img src={emirates} className="h-15 w-15" />
              <span className="font-bold text-lg tracking-tight">Emirates Inn</span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
                Experience exceptional comfort, elegant accommodations, and warm hospitality tailored to every traveler. Whether you're visiting for business or leisure, we ensure a memorable stay from check-in to check-out.            </p>
          </div>

          {/* ── Right nav group: Explore + Contact pushed to the right ── */}
          <div className="flex flex-col sm:flex-row lg:justify-end gap-10 sm:gap-12 flex-1">
            {/* Explore */}
            <div style={{ minWidth: "120px" }}>
              <h4 className="text-sm font-semibold mb-6">Explore</h4>
              <ul className="text-sm text-primary-foreground/70" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {NAV.slice(1).map((n) => (
                  <li key={n.to}>
                    <Link to={n.to as "."} className="hover:text-white transition-colors">{n.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div style={{ minWidth: "200px" }}>
              <h4 className="text-sm font-semibold mb-6">Contact</h4>
              <ul className="text-sm text-primary-foreground/70" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <li className="flex gap-3 items-center">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>+91 73392 26598</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>reservations@emiratesinn.com</span>
                </li>
                <li className="flex gap-3 items-start">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>East Coast Rd, Velankanni,<br />Tamil Nadu 611111 - India</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
        <div className="border-y border-primary-foreground/10">
          <div className="container-luxe py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-[12px] md:text-sm text-primary-foreground/50">
            <span>© {new Date().getFullYear()} Emirates Inn & Emirates Grand Inn.All rights reserved.</span>
            <div className="flex gap-4">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>    
          </div>
        </div>
        

        <div className="border-t border-primary-foreground/10"> 
          <div className="container-x pb-6 pt-3 text-center text-[11px] text-white/40 ">
        Developed by{" "}
        <a
          href="https://infynuxsolutions.in/"
          className="font-semibold text-yellow-600 hover:text-yellow-400 transition-colors duration-300">
          INFYNUX SOLUTIONS
        </a>
      </div>
          </div>

      </footer>
    </div>
  );
}
