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
            onClick={() => (open ? closeMenu() : setOpen(true))}
            aria-label={open ? "Close Menu" : "Open Menu"}
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {/* ── Mobile: full-width top overlay (outside header flow so it doesn't push content) ── */}
        <AnimatePresence>
          {open && (
            <>
              {/* Blurred backdrop — sits behind the panel, closes menu on click */}
              <motion.div
                key="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="md:hidden fixed inset-0 z-[55]"
                style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
                onClick={closeMenu}
                aria-hidden="true"
              />

              {/* Top-sliding menu panel */}
              <motion.div
                key="mobile-nav-panel"
                id="mobile-nav-panel"
                initial={{ opacity: 0, y: "-100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "-100%" }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="md:hidden fixed top-0 left-0 w-full z-[60]"
                style={{
                  backgroundColor: "#0A1A2F",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0 0 20px 20px",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)",
                  willChange: "transform, opacity",
                }}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Navigation Menu"
              >
                {/* Panel header — logo + close button */}
                <div
                  className="flex items-center justify-between h-20 px-6"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <Link to="/" className="flex items-center gap-3 group" onClick={closeMenu}>
                    <img src={emirates} className="h-15 w-15" alt="Emirates Logo" />
                    <div className="font-bold text-xl tracking-tight text-white leading-tight">Emirates</div>
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

      <footer className="bg-primary text-primary-foreground mt-24">
        {/* Desktop: 3-col balanced grid | Tablet: 2-col | Mobile: 1-col */}
        <div className="footer-grid container-luxe py-16 grid grid-cols-1 sm:grid-cols-2 gap-10">

          {/* ── Brand Column ── */}
          <div className="sm:col-span-2 lg:col-span-1" style={{ maxWidth: "340px" }}>
            <div className="flex items-center gap-3 mb-5">
              <div>
                {/* <Building className="h-5 w-5 text-white" /> */}
                <img src={emirates} className="h-15 w-15" />
              </div>
              <span className="font-bold text-lg tracking-tight">Emirates Inn</span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              A curated collection of boutique and grand hotels delivering reliable comfort and corporate hospitality.
            </p>
          </div>

          {/* ── Explore Column ── */}
          <div>
            <h4 className="text-sm font-semibold mb-6">Explore</h4>
            <ul className="text-sm text-primary-foreground/70" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {NAV.slice(1).map((n) => (
                <li key={n.to}>
                  <Link to={n.to as "."} className="hover:text-white transition-colors">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact Column ── */}
          <div>
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

        {/* Scoped responsive override: switch to balanced 3-col on large screens */}
        <style>{`
          @media (min-width: 1024px) {
            .footer-grid {
              grid-template-columns: 1.3fr 0.8fr 1fr !important;
              column-gap: 3rem !important;
            }
          }
        `}</style>
        <div className="border-t border-primary-foreground/10">
          <div className="container-luxe py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-primary-foreground/50">
            <span>© {new Date().getFullYear()} Emirates Inn & Emirates Grand Inn. All rights reserved.</span>
            <div className="flex gap-4">
              <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
