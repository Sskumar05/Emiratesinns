import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, BedDouble, CalendarRange, XCircle, Calendar, Users, FileText,
  ScrollText, UserCog, Settings, LogOut, Crown, Menu, X, ChevronDown, Monitor, Store, Plus
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; search?: any };
const NAV_TOP: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/rooms", label: "Rooms", icon: BedDouble },
];
const NAV_BOTTOM: NavItem[] = [
  { to: "/admin/cancelled", label: "Cancelled", icon: XCircle },
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
        className={`flex items-center gap-3 py-3 text-sm transition-colors border-l-2 ${isSub ? 'px-10' : 'px-6'} ${active ? "border-gold text-gold bg-gold/5" : "border-transparent text-muted-foreground hover:text-gold hover:bg-gold/5"}`}>
        <Icon className={`${isSub ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
        <span>{n.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-surface border-r border-border flex flex-col transition-transform ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="h-20 flex items-center gap-2 px-6 border-b border-border">
          <Crown className="h-6 w-6 text-gold" />
          <div>
            <div className="font-display text-lg leading-none">Emirates</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Admin Panel</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_TOP.map(n => renderLink(n))}
          
          <div className="my-1">
            <button 
              onClick={() => setBookingsOpen(!bookingsOpen)}
              className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-colors border-l-2 border-transparent text-muted-foreground hover:text-gold hover:bg-gold/5`}
            >
              <div className="flex items-center gap-3">
                <CalendarRange className="h-4 w-4" />
                <span>Bookings</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${bookingsOpen ? "rotate-180" : ""}`} />
            </button>
            
            {bookingsOpen && (
              <div className="bg-background/50 py-1">
                {renderLink({ to: "/admin/bookings", search: { source: 'online' }, label: "Online Bookings", icon: Monitor, exact: true }, true)}
                {renderLink({ to: "/admin/bookings", search: { source: 'walk_in' }, label: "Walk-in Bookings", icon: Store, exact: true }, true)}
                {renderLink({ to: "/admin/new-booking", label: "New Walk-in Booking", icon: Plus, exact: true }, true)}
              </div>
            )}
          </div>

          {NAV_BOTTOM.map(n => renderLink(n))}
        </nav>
        <button onClick={logout} className="m-4 flex items-center justify-center gap-2 border border-border px-4 py-2.5 text-sm rounded-sm hover:border-gold hover:text-gold transition">
          <LogOut className="h-4 w-4" />Sign Out
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-20 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur z-30">
          <button className="md:hidden text-gold" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
          <div className="font-display text-xl">
            {path.includes("booking") ? "Bookings" : (NAV_TOP.concat(NAV_BOTTOM).find((n) => n.exact ? path === n.to : path.startsWith(n.to))?.label ?? "Admin")}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs uppercase tracking-[0.2em] text-muted-foreground">Live</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-10"><Outlet /></main>
      </div>
    </div>
  );
}
