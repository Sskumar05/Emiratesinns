import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { Search, Filter, Eye, Trash2, X, MessageSquare, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/contact-messages")({
  component: ContactMessagesAdmin,
});

type Message = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = ["New", "In Progress", "Replied", "Closed"];
const STATUS_COLORS: Record<string, string> = {
  "New": "text-blue-500 bg-blue-500/10 border-blue-500/20",
  "In Progress": "text-amber-500 bg-amber-500/10 border-amber-500/20",
  "Replied": "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  "Closed": "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
};

function ContactMessagesAdmin() {
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const { data: messages = [], refetch, isLoading } = useQuery({
    queryKey: ["contact_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Message[];
    },
  });

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const matchesSearch =
        m.full_name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase());
      
      return matchesSearch;
    });
  }, [messages, search]);

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) return;
    
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);
      
    if (error) {
      toast.error("Failed to delete message");
      return;
    }
    toast.success("Message deleted successfully");
    if (selectedMessage?.id === id) setSelectedMessage(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Contact Messages</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage enquiries from the Contact Us form</p>
        </div>
      </div>

      <div className="bg-card border border-border p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-sm pl-9 pr-4 py-2 text-sm focus:border-gold focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
        </div>
      </div>

      <div className="bg-card border border-border overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading messages...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
            <MessageSquare className="w-10 h-10 opacity-20" />
            <p>No contact messages found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-surface text-xs uppercase tracking-widest text-muted-foreground">
                <th className="font-medium p-4 font-display">Date</th>
                <th className="font-medium p-4 font-display">Customer</th>
                <th className="font-medium p-4 font-display text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()}<br/>
                    <span className="text-xs opacity-70">{new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium">{m.full_name}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedMessage(m)}
                        className="p-2 text-muted-foreground hover:text-gold hover:bg-gold/10 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMessage(m.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete Message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMessage(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-card border border-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
                <h3 className="font-display text-xl text-gold">Message Details</h3>
                <button onClick={() => setSelectedMessage(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">From</div>
                    <div className="font-medium">{selectedMessage.full_name}</div>
                    <div className="text-sm text-muted-foreground">{selectedMessage.email}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Contact</div>
                    <div className="font-medium">{selectedMessage.phone}</div>
                    <div className="text-sm text-muted-foreground">{new Date(selectedMessage.created_at).toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Subject</div>
                  <div className="text-lg font-medium">{selectedMessage.subject}</div>
                </div>
                
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Message</div>
                  <div className="p-4 bg-background border border-border rounded text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-surface flex items-center justify-end">

                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-6 py-2 bg-gold text-white text-sm uppercase tracking-widest font-semibold hover:bg-gold/90 transition-colors rounded-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
