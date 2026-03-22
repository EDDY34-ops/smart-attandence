import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"admin" | "teacher">("admin");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setBusy(true);
    setError("");
    const ok = await login(email, password);
    setBusy(false);
    if (ok) {
      navigate("/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields"); return;
    }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setBusy(true);
    setError("");
    const ok = await signup(name, email, password, role);
    setBusy(false);
    if (ok) {
      navigate("/dashboard");
    } else {
      setError("Signup failed. Email may already be registered.");
    }
  };

  const switchMode = (newMode: "login" | "signup") => {
    setMode(newMode);
    setError("");
    setName("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="dashboard-card text-center">
          <img src={logo} alt="SMART Attendance System" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-1">SMART Attendance</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "login" ? "Sign in to your account" : "Create a new account"}
          </p>

          {/* Toggle between modes */}
          <div className="flex rounded-lg border border-border mb-6 overflow-hidden">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "login"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${mode === "signup"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
            >
              <UserPlus size={14} />
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-lg mb-4">{error}</div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {busy ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Account Type</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "teacher")}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow mb-4"
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {busy
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <UserPlus size={16} />}
                Create Account
              </button>
            </form>
          )}

          <p className="mt-4 text-sm text-muted-foreground">
            {mode === "login" ? (
              <button onClick={() => switchMode("signup")} className="text-primary hover:underline">
                Don't have an account? Sign up
              </button>
            ) : (
              <button onClick={() => switchMode("login")} className="text-primary hover:underline">
                Already have an account? Sign in
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
