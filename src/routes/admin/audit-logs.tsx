import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { Search, Eye, X } from "lucide-react";

export const Route = createFileRoute("/admin/audit-logs")({ component: AuditLogs });

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatDateTime = (iso?: string) => {
  if (!iso) return { date: "—", time: "" };
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return { date, time };
};

/** Map entity_type → Module label */
const getModule = (entityType: string): string => {
  const map: Record<string, string> = {
    booking: "Booking",
    room: "Room",
    customer: "Customer",
    payment: "Payment",
    email: "Email",
    invoice: "Invoice",
    system: "System",
  };
  return map[entityType?.toLowerCase()] ?? entityType ?? "System";
};

/** Map raw action string → human-readable Action label */
const getActionLabel = (action: string): string => {
  const map: Record<string, string> = {
    booking_created: "New Booking",
    booking_confirmed: "Confirm Booking",
    booking_cancelled: "Cancel Booking",
    booking_checked_in: "Check-In",
    booking_checked_out: "Check-Out",
    booking_no_show: "No Show",
    booking_rooms_reduced: "Reduce Rooms",
    room_assigned: "Assign Room",
    room_status_changed: "Room Status Changed",
    payment_received: "Payment Received",
    payment_refunded: "Payment Refunded",
    email_sent: "Email Sent",
    invoice_generated: "Invoice Generated",
    login: "Admin Login",
    logout: "Admin Logout",
  };
  return map[action?.toLowerCase()] ?? (action ?? "Unknown Action").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

/** Derive a short human-readable description from a log entry */
const getDescription = (log: any): string => {
  const action = (log.action ?? "").toLowerCase();
  const nv = log.new_value ?? {};
  const pv = log.previous_value ?? {};

  if (action.includes("cancel")) return `Booking ${nv.booking_code ?? log.entity_id ?? ""} cancelled.`;
  if (action.includes("check_in")) return `Guest checked into booking ${nv.booking_code ?? log.entity_id ?? ""}.`;
  if (action.includes("check_out")) return `Guest checked out of booking ${nv.booking_code ?? log.entity_id ?? ""}.`;
  if (action.includes("no_show")) return `No-show recorded for booking ${log.entity_id ?? ""}.`;
  if (action.includes("confirmed")) return `Booking ${nv.booking_code ?? log.entity_id ?? ""} confirmed.`;
  if (action.includes("booking_created")) return `New booking ${nv.booking_code ?? log.entity_id ?? ""} created.`;
  if (action.includes("room") && action.includes("assigned")) return `Room ${nv.room_number ?? log.entity_id ?? ""} assigned.`;
  if (action.includes("payment_received")) return `Payment ₹${nv.amount ?? ""} received.`;
  if (action.includes("payment_refunded")) return `Refund ₹${pv.amount ?? ""} processed.`;
  if (action.includes("email")) return `${nv.type ?? "Email"} sent to ${nv.to ?? log.actor_email ?? "customer"}.`;
  if (action.includes("invoice")) return `Invoice ${nv.invoice_number ?? log.entity_id ?? ""} generated.`;
  if (action.includes("rooms_reduced")) return `Rooms reduced for booking ${log.entity_id ?? ""}.`;
  if (action.includes("login")) return `Admin ${log.actor_email ?? ""} logged in.`;
  if (log.notes) return log.notes;
  return `${getActionLabel(log.action)} on entity ${log.entity_id ?? "—"}.`;
};

/** Derive a status from the log. Fallback to "success" as most logged events are successful outcomes */
const getStatus = (log: any): "success" | "failed" | "warning" | "info" => {
  const action = (log.action ?? "").toLowerCase();
  if (action.includes("failed") || action.includes("error")) return "failed";
  if (action.includes("cancel") || action.includes("no_show") || action.includes("refund")) return "warning";
  if (action.includes("email") || action.includes("login") || action.includes("logout") || action.includes("invoice")) return "info";
  return "success";
};

const STATUS_BADGE: Record<string, string> = {
  success: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  failed: "bg-red-500/10 text-red-600 border border-red-500/20",
  warning: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
  info: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
};

const STATUS_LABEL: Record<string, string> = {
  success: "Success",
  failed: "Failed",
  warning: "Warning",
  info: "Info",
};

const MODULE_OPTIONS = ["Booking", "Room", "Customer", "Payment", "Email", "Invoice", "System"];
const STATUS_OPTIONS = ["success", "failed", "warning", "info"];

// ─── Component ─────────────────────────────────────────────────────────────────

function AuditLogs() {
  const [q, setQ] = useState("");
  const [moduleF, setModuleF] = useState("all");
  const [userF, setUserF] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewLog, setViewLog] = useState<any | null>(null);

  const { data: logs = [] } = useQuery({
    queryKey: ["audit"],
    queryFn: async () =>
      (await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500)).data ?? [],
  });

  // unique actors for filter dropdown
  const actors = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l: any) => set.add(l.actor_email ?? "System"));
    return Array.from(set).slice(0, 20);
  }, [logs]);

  const enriched = useMemo(
    () =>
      logs.map((l: any) => ({
        ...l,
        _module: getModule(l.entity_type),
        _action: getActionLabel(l.action),
        _description: getDescription(l),
        _status: getStatus(l),
        _actor: l.actor_email ?? "System",
      })),
    [logs]
  );

  const filtered = useMemo(() => {
    return enriched.filter((l: any) => {
      const queryMatch =
        !q ||
        l._action.toLowerCase().includes(q.toLowerCase()) ||
        l._description.toLowerCase().includes(q.toLowerCase()) ||
        (l.entity_id ?? "").toLowerCase().includes(q.toLowerCase()) ||
        l._actor.toLowerCase().includes(q.toLowerCase());
      const modMatch = moduleF === "all" || l._module === moduleF;
      const userMatch = userF === "all" || l._actor === userF;
      const statusMatch = statusF === "all" || l._status === statusF;
      let dateMatch = true;
      if (dateFrom || dateTo) {
        const d = l.created_at ? l.created_at.slice(0, 10) : "";
        if (dateFrom && d < dateFrom) dateMatch = false;
        if (dateTo && d > dateTo) dateMatch = false;
      }
      return queryMatch && modMatch && userMatch && statusMatch && dateMatch;
    });
  }, [enriched, q, moduleF, userF, statusF, dateFrom, dateTo]);

  return (
    <div className="flex flex-col space-y-6 h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)]">
      {/* ── Filters ── */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between shrink-0">
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <select
            value={moduleF}
            onChange={(e) => setModuleF(e.target.value)}
            className="bg-card border border-border px-4 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="all">All Modules</option>
            {MODULE_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={userF}
            onChange={(e) => setUserF(e.target.value)}
            className="bg-card border border-border px-4 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="all">All Users</option>
            {actors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            className="bg-card border border-border px-4 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="all">Any Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          {/* <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-card border border-border px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-card border border-border px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div> */}
        </div>

        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search action, description, user..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-card border border-border pl-9 pr-4 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-card border border-border overflow-auto rounded-lg shadow-sm flex-1 min-h-0 custom-scrollbar">
        <table className="w-full text-sm relative">
          <thead className="sticky top-0 z-20 bg-surface text-xs uppercase tracking-wider text-muted-foreground font-semibold shadow-[0_1px_0_0_var(--border)]">
            <tr>
              {["Time", "User", "Module", "Action", "Description", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left py-4 px-4 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  No audit entries found matching your criteria.
                </td>
              </tr>
            )}
            {filtered.map((l: any) => {
              const { date, time } = formatDateTime(l.created_at);
              return (
                <tr key={l.id} className="hover:bg-surface/30 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="text-sm">{date}</div>
                    <div className="text-xs text-muted-foreground">{time}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm">{l._actor}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-xs font-semibold uppercase tracking-wider bg-surface px-2 py-0.5 rounded border border-border text-muted-foreground">
                      {l._module}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-gold">{l._action}</td>
                  <td className="py-3 px-4 text-muted-foreground max-w-xs truncate" title={l._description}>
                    {l._description}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full ${STATUS_BADGE[l._status]}`}>
                      {STATUS_LABEL[l._status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => setViewLog(l)}
                      className="flex items-center gap-1.5 bg-surface/50 text-foreground border border-border px-3 py-1.5 rounded hover:border-gold hover:text-gold transition-colors whitespace-nowrap"
                    >
                      <Eye className="h-3 w-3" />
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── View Details Modal ── */}
      {viewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border bg-surface/30">
              <div>
                <h2 className="text-lg font-bold text-foreground">Audit Log Details</h2>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{viewLog.id}</p>
              </div>
              <button
                onClick={() => setViewLog(null)}
                className="p-2 hover:bg-surface rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {/* Core Info */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Date & Time", value: `${formatDateTime(viewLog.created_at).date} at ${formatDateTime(viewLog.created_at).time}` },
                  { label: "User", value: viewLog._actor },
                  { label: "Module", value: viewLog._module },
                  { label: "Action", value: viewLog._action },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface rounded-lg p-4 border border-border">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
                    <div className="font-medium text-foreground">{value}</div>
                  </div>
                ))}

                <div className="bg-surface rounded-lg p-4 border border-border">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Status</div>
                  <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full ${STATUS_BADGE[viewLog._status]}`}>
                    {STATUS_LABEL[viewLog._status]}
                  </span>
                </div>

                <div className="bg-surface rounded-lg p-4 border border-border">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Entity ID</div>
                  <div className="font-mono text-sm text-foreground">{viewLog.entity_id ?? "—"}</div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-surface rounded-lg p-4 border border-border">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Description</div>
                <p className="text-sm text-foreground">{viewLog._description}</p>
                {viewLog.notes && viewLog.notes !== viewLog._description && (
                  <p className="text-xs text-muted-foreground mt-1">{viewLog.notes}</p>
                )}
              </div>

              {/* Previous Data */}
              {viewLog.previous_value && Object.keys(viewLog.previous_value).length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Previous Data</div>
                  <pre className="bg-surface border border-border rounded-lg p-4 text-xs text-muted-foreground font-mono overflow-x-auto custom-scrollbar">
                    {JSON.stringify(viewLog.previous_value, null, 2)}
                  </pre>
                </div>
              )}

              {/* New Data */}
              {viewLog.new_value && Object.keys(viewLog.new_value).length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">New Data</div>
                  <pre className="bg-surface border border-border rounded-lg p-4 text-xs text-emerald-600 font-mono overflow-x-auto custom-scrollbar">
                    {JSON.stringify(viewLog.new_value, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex justify-end">
              <button
                onClick={() => setViewLog(null)}
                className="px-6 py-2 bg-surface hover:bg-surface/80 text-foreground rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
