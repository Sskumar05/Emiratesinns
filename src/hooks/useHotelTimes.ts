import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHotelTimes() {
  return useQuery({
    queryKey: ["system_settings", "default_check_times"],
    queryFn: async () => {
      try {
        const [ciRes, coRes] = await Promise.all([
          supabase.from("system_settings").select("value").eq("key", "default_check_in_time").maybeSingle(),
          supabase.from("system_settings").select("value").eq("key", "default_check_out_time").maybeSingle(),
        ]);
        const ci = ciRes.data?.value ?? "14:00";
        const co = coRes.data?.value ?? "22:00";
        return {
          checkIn:  typeof ci === "string" ? ci.replace(/^"|"$/g, "") : "14:00",
          checkOut: typeof co === "string" ? co.replace(/^"|"$/g, "") : "22:00",
        };
      } catch {
        return { checkIn: "14:00", checkOut: "22:00" };
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
