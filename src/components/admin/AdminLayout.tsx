import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, BedDouble, CalendarRange, XCircle, Calendar, Users, FileText,
  ScrollText, UserCog, Settings, LogOut, Crown, Menu, X, ChevronDown, Monitor, Store, Plus, Mail
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImg from "@/assets/emirates_logo.png";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; search?: any };
const NAV_TOP: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/rooms", label: "Rooms", icon: BedDouble },
];
const NAV_BOTTOM: NavItem[] = [
  { to: "/admin/cancelled", label: "Cancelled", icon: XCircle },
  { to: "/admin/contact-messages", label: "Contact Messages", icon: Mail },
  { to: "/admin/calendar", label: "Calendar", icon: Calendar },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/invoices", label: "Invoices", icon: FileText },
  { to: "/admin/profile", label: "Profile", icon: UserCog },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search });
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [bookingsOpen, setBookingsOpen] = useState(true);

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    nav({ to: "/admin/login" });
  }

  const renderLink = (n: NavItem, isSub = false) => {
    // For exact search match checking if needed, but path check is usually enough
    const active = n.exact 
      ? path === n.to && (!n.search || (search as any).source === n.search.source)
      : path.startsWith(n.to) && (!n.search || (search as any).source === n.search.source);
    const Icon = n.icon;
    return (
      <Link key={n.to + (n.search?.source || "")} to={n.to as "."} search={n.search} onClick={() => setOpen(false)}
        className={`flex items-center gap-3 py-3 text-sm transition-colors border-l-2 ${isSub ? 'px-10' : 'px-6'} ${active ? "border-transparent bg-[#123B8A] text-[#FFFFFF]" : "border-transparent text-[rgba(255,255,255,0.75)] hover:bg-[#0D2A6A] hover:text-[#FFFFFF]"}`}>
        <Icon className={`${isSub ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${active ? 'text-[#FFFFFF]' : ''}`} />
        <span>{n.label}</span>
      </Link>
    );
  };

  return (
    <div className="admin-theme min-h-screen bg-[#FFFFFF] text-gray-900 flex">
      <style>{`
        .admin-theme {
          background-color: #FFFFFF !important;
        }
        .admin-theme .admin-main-content,
        .admin-theme .admin-header {
          background-color: #FFFFFF !important;
        }
        .admin-theme .bg-card,
        .admin-theme .bg-surface,
        .admin-theme .bg-background,
        .admin-theme table,
        .admin-theme form,
        .admin-theme [role="dialog"] {
          background-color: #FFFFFF !important;
        }
        /* Cards */
        .admin-theme .border,
        .admin-theme .border-border,
        .admin-theme table,
        .admin-theme th,
        .admin-theme td,
        .admin-theme .admin-header {
          border-color: #E5E7EB !important;
        }
        .admin-theme .bg-card {
          box-shadow: 0 4px 18px rgba(8,28,75,0.06) !important;
        }
        /* Buttons */
        .admin-theme button.bg-gold,
        .admin-theme button.bg-primary,
        .admin-theme a.bg-gold,
        .admin-theme a.bg-primary {
          background-color: #0B5CAD !important;
          color: #FFFFFF !important;
          border: none !important;
        }
        .admin-theme button.bg-gold:hover,
        .admin-theme button.bg-primary:hover,
        .admin-theme a.bg-gold:hover,
        .admin-theme a.bg-primary:hover {
          background-color: #084C93 !important;
        }
        .admin-theme button.border-gold,
        .admin-theme a.border-gold,
        .admin-theme button.border-border {
          background-color: #FFFFFF !important;
          border: 1px solid #081C4B !important;
          color: #081C4B !important;
        }
        /* Overriding text colors */
        .admin-theme .text-gold {
          color: #0B5CAD !important;
        }
        .admin-theme .text-muted-foreground {
          color: #6B7280 !important;
        }
      `}</style>
      
      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-[#081C4B] flex flex-col transition-transform ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"} border-r-0`} style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="h-20 flex items-center gap-2 px-6 border-b border-transparent" style={{ borderBottomColor: 'rgba(255,255,255,0.08)' }}>
          <img src={heroImg} className="w-10 h-10" />
          <div>
            <div className="font-display text-lg leading-none text-[#FFFFFF]">Emirates</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.75)] mt-1">Admin Panel</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_TOP.map(n => renderLink(n))}
          
          <div className="my-1">
            <button 
              onClick={() => setBookingsOpen(!bookingsOpen)}
              className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-colors border-l-2 border-transparent text-[rgba(255,255,255,0.75)] hover:bg-[#0D2A6A] hover:text-[#FFFFFF]`}
            >
              <div className="flex items-center gap-3">
                <CalendarRange className="h-4 w-4 text-[rgba(255,255,255,0.75)]" />
                <span>Bookings</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform text-[rgba(255,255,255,0.75)] ${bookingsOpen ? "rotate-180" : ""}`} />
            </button>
            
            {bookingsOpen && (
              <div className="bg-[#081C4B] py-1">
                {renderLink({ to: "/admin/bookings", search: { source: 'online' }, label: "Online Bookings", icon: Monitor, exact: true }, true)}
                {renderLink({ to: "/admin/bookings", search: { source: 'walk_in' }, label: "Walk-in Bookings", icon: Store, exact: true }, true)}
                {renderLink({ to: "/admin/new-booking", label: "New Walk-in Booking", icon: Plus, exact: true }, true)}
              </div>
            )}
          </div>

          {NAV_BOTTOM.map(n => renderLink(n))}
        </nav>
        <button onClick={logout} className="m-4 flex items-center justify-center gap-2  px-4 py-2.5 text-sm rounded-sm text-[rgba(255,255,255,0.75)] hover:bg-[#0D2A6A] hover:text-[#FFFFFF] transition" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <LogOut className="h-4 w-4" />Sign Out
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col admin-main-content">
        <header className="h-20 flex items-center justify-between px-6 sticky top-0 z-30 admin-header" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <button className="md:hidden text-[#081C4B]" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
          <div className="font-display text-xl text-gray-900">
            {path.includes("booking") ? "Bookings" : (NAV_TOP.concat(NAV_BOTTOM).find((n) => n.exact ? path === n.to : path.startsWith(n.to))?.label ?? "Admin")}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs uppercase tracking-[0.2em] text-gray-500">Live</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-10"><Outlet /></main>
      </div>
    </div>
  );
}
