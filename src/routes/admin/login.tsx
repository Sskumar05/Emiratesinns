import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Loader2, Mail, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/emirates_logo.png";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

/* ─── page-scoped styles (no global CSS touched) ─── */
const S = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f8f6f0 0%, #f0ece4 50%, #e8e2d8 100%)",
    padding: "1rem",
    fontFamily: "'Inter', 'Roboto', system-ui, sans-serif",
  } as React.CSSProperties,

  card: {
    width: "200%",
    maxWidth: "600px",
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow:
      "0 20px 60px rgba(13, 27, 62, 0.12), 0 8px 24px rgba(13, 27, 62, 0.08), 0 2px 8px rgba(0,0,0,0.04)",
    padding: "clamp(2rem, 5vw, 2.75rem) clamp(1.5rem, 5vw, 2.5rem)",
    border: "1px solid rgba(13, 27, 62, 0.06)",
  } as React.CSSProperties,

  logoWrap: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    marginBottom: "1rem",
  },

  logo: {
    width: "100px",
    height: "100px",
    objectFit: "contain" as const,
    marginBottom: "0.5rem",
  },

  heading: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: "clamp(1.6rem, 4vw, 2rem)",
    fontWeight: 700,
    color: "#0d1b3e",
    letterSpacing: "-0.01em",
    margin: 0,
    lineHeight: 1.2,
  },

  subtitle: {
    fontSize: "0.8rem",
    color: "#6b7280",
    marginTop: "0.35rem",
    letterSpacing: "0.01em",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.6rem",
    margin: "1rem 0 1.5rem",
  },

  dividerLine: {
    flex: 1,
    height: "1px",
    background: "linear-gradient(to right, transparent, #c9a84c, transparent)",
  },

  dividerDiamond: {
    width: "7px",
    height: "7px",
    background: "#c9a84c",
    transform: "rotate(45deg)",
    flexShrink: 0,
  },

  fieldWrap: {
    marginBottom: "1.1rem",
  },

  label: {
    display: "block",
    fontSize: "0.68rem",
    fontWeight: 600,
    letterSpacing: "0.13em",
    textTransform: "uppercase" as const,
    color: "#374151",
    marginBottom: "0.45rem",
  },

  inputWrap: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  },

  inputIcon: {
    position: "absolute" as const,
    left: "0.9rem",
    color: "#02235aff",
    pointerEvents: "none" as const,
    display: "flex",
    alignItems: "center",
  },

  input: {
    width: "100%",
    padding: "0.72rem 0.9rem 0.72rem 2.6rem",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "0.9rem",
    color: "#111827",
    background: "#fafafa",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,

  inputWithIcon: {
    paddingRight: "2.8rem",
  },

  eyeBtn: {
    position: "absolute" as const,
    right: "0.85rem",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    lineHeight: 1,
  },

  rowBetween: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.25rem",
    marginTop: "0.25rem",
  },

  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    fontSize: "0.82rem",
    color: "#374151",
    cursor: "pointer",
    userSelect: "none" as const,
  },

  checkbox: {
    accentColor: "#c9a84c",
    width: "15px",
    height: "15px",
    cursor: "pointer",
  },

  forgotBtn: {
    background: "none",
    border: "none",
    padding: 0,
    fontSize: "0.82rem",
    color: "#1e3a8a",
    cursor: "pointer",
    fontWeight: 500,
    textDecoration: "none",
  },

  signInBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #0d1b3e 0%, #1e3a8a 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "0.82rem 1rem",
    fontSize: "0.8rem",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.55rem",
    transition: "opacity 0.2s, transform 0.15s",
    boxShadow: "0 4px 14px rgba(13, 27, 62, 0.35)",
  } as React.CSSProperties,

  orRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    margin: "1.25rem 0 1rem",
  },

  orLine: {
    flex: 1,
    height: "1px",
    background: "#e5e7eb",
  },

  orText: {
    fontSize: "0.75rem",
    color: "#9ca3af",
    letterSpacing: "0.08em",
    fontWeight: 500,
  },

  footerP: {
    textAlign: "center" as const,
    fontSize: "0.83rem",
    color: "#6b7280",
    margin: 0,
  },

  createBtn: {
    background: "none",
    border: "none",
    padding: 0,
    fontSize: "0.83rem",
    color: "#1e3a8a",
    cursor: "pointer",
    fontWeight: 600,
    textDecoration: "none",
  },

  noteText: {
    textAlign: "center" as const,
    fontSize: "0.7rem",
    color: "#9ca3af",
    marginTop: "0.6rem",
  },
};

function AdminLogin() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  /* focus highlight state */
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/admin`;
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        // First user becomes admin automatically (bootstrap)
        if (data.user) {
          const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
          if ((count ?? 0) === 0) {
            const { error: roleErr } = await supabase.from("user_roles").insert({ user_id: data.user.id, role: "admin" });
            if (roleErr) {
              console.error("[AdminLogin] Could not insert admin role (RLS may be blocking):", roleErr.message);
              toast.warning(
                "Account created, but the admin role could not be assigned automatically. " +
                "Please run the grant-admin SQL in the Supabase Dashboard."
              );
            }
          }
        }
        toast.success("Account created. You can now sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        nav({ to: "/admin" });
      }
    } catch (e: any) {
      toast.error(e.message ?? "Authentication failed");
    } finally { setLoading(false); }
  }

  async function forgot() {
    if (!email) { toast.error("Enter your email first"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin/login` });
    if (error) toast.error(error.message); else toast.success("Reset email sent");
  }

  const focusStyle = {
    borderColor: "#c9a84c",
    boxShadow: "0 0 0 3px rgba(201, 168, 76, 0.12)",
    background: "#fff",
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* ── Logo & Heading ── */}
        <div style={S.logoWrap}>
          <img src={logo} alt="Emirates Inn Logo" style={S.logo} />
          <h1 style={S.heading}>Admin Portal</h1>
          <p style={S.subtitle}>Emirates Inn &amp; Grand Inn — Management</p>
        </div>

        {/* ── Gold Divider ── */}
        <div style={S.divider}>
          <div style={S.dividerLine} />
          <div style={S.dividerDiamond} />
          <div style={S.dividerLine} />
        </div>

        {/* ── Form ── */}
        <form onSubmit={submit}>
          {/* Email */}
          <div style={S.fieldWrap}>
            <label style={S.label}>Email</label>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}>
                <Mail size={16} />
              </span>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                placeholder="Enter your email"
                style={{ ...S.input, ...(emailFocus ? focusStyle : {}) }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={S.fieldWrap}>
            <label style={S.label}>Password</label>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}>
                <Lock size={16} />
              </span>
              <input
                id="admin-password"
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPwFocus(true)}
                onBlur={() => setPwFocus(false)}
                placeholder="Enter your password"
                style={{ ...S.input, ...S.inputWithIcon, ...(pwFocus ? focusStyle : {}) }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={S.eyeBtn}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div style={S.rowBetween}>
            <label style={S.checkLabel}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={S.checkbox}
              />
              Remember me
            </label>
            <button type="button" onClick={forgot} style={S.forgotBtn}>
              Forgot password?
            </button>
          </div>

          {/* Sign In button */}
          <button
            id="admin-signin-btn"
            type="submit"
            disabled={loading}
            style={{ ...S.signInBtn, ...(loading ? { opacity: 0.65 } : {}) }}
          >
            {loading
              ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              : <LogIn size={16} />
            }
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>

          {/* OR divider */}
          <div style={S.orRow}>
            <div style={S.orLine} />
            <span style={S.orText}>OR</span>
            <div style={S.orLine} />
          </div>

          {/* Create admin account */}
          <p style={S.footerP}>
            {mode === "signin" ? "First time setup? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              style={S.createBtn}
            >
              {mode === "signin" ? "Create admin account" : "Sign in"}
            </button>
          </p>

          {mode === "signup" && (
            <p style={S.noteText}>
              The first account created becomes the admin automatically.
            </p>
          )}
        </form>
      </div>

      {/* Spinner keyframe — scoped inline style tag */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        #admin-email:focus,
        #admin-password:focus {
          outline: none;
        }
        #admin-signin-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        #admin-signin-btn:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
