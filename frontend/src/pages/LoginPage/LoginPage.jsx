import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../../auth/authContext.jsx";
export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };
  const fillAdminCredentials = () => {
    setEmail("aces.kbtcoe@gmail.com");
    setPassword("AcesAdmin@2026");
  };
  return <div className="pt-28 pb-20 min-h-screen flex items-center justify-center px-4 sm:px-6">
      <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full max-w-md"
  >
        <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl relative">
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-electric-blue/15 border border-electric-blue/30 text-electric-cyan flex items-center justify-center mx-auto mb-3">
              <LogIn size={22} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to ACES</h1>
            <p className="text-xs text-slate-400">
              Access your member dashboard, registrations, and application status.
            </p>
          </div>

          {error && <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-6 flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
    type="email"
    required
    placeholder="student@kbtcoe.org"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
  />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
    type="password"
    required
    placeholder="••••••••"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
  />
              </div>
            </div>

            <div className="pt-2">
              <button
    type="submit"
    disabled={loading}
    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-bold text-xs shadow-lg shadow-electric-blue/30 hover:shadow-electric-blue/50 transition-all flex items-center justify-center gap-2"
  >
                <span>{loading ? "Signing In..." : "Sign In"}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>

          {
    /* Quick Demo Credentials Pill */
  }
          <div className="mt-6 p-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <ShieldCheck size={12} className="text-amber-400" />
                <span>Admin Bootstrap Credentials</span>
              </span>
              <button
    type="button"
    onClick={fillAdminCredentials}
    className="text-electric-cyan font-bold hover:underline"
  >
                Auto-fill
              </button>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              aces.kbtcoe@gmail.com / AcesAdmin@2026
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-slate-400">
            Don't have an account yet?{" "}
            <Link to="/register" className="font-semibold text-electric-cyan hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>;
};

export default LoginPage;
