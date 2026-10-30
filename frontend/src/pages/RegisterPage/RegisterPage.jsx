import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, User, Mail, Lock, Phone, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../../auth/authContext.jsx";
export const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("Computer Engineering");
  const [academicYear, setAcademicYear] = useState("SE");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await register({
        name: fullName,
        fullName,
        email,
        password,
        phone,
        department,
        academicYear
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  return <div className="pt-28 pb-20 min-h-screen flex items-center justify-center px-4 sm:px-6">
      <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full max-w-lg"
  >
        <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl relative">
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-electric-blue/15 border border-electric-blue/30 text-electric-cyan flex items-center justify-center mx-auto mb-3">
              <UserPlus size={22} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Student Account</h1>
            <p className="text-xs text-slate-400">
              Join ACES KBTCOE to register for events, view memberships, and join workshops.
            </p>
          </div>

          {error && <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-6 flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Full Name *</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
    type="text"
    required
    placeholder="e.g. Atharva Patil"
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
  />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Email Address *</label>
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
                <label className="block text-slate-300 font-medium mb-1.5">Password (Min 6 chars) *</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
    type="password"
    required
    minLength={6}
    placeholder="••••••••"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Phone (Optional)</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
    type="tel"
    placeholder="+91 98765 43210"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Academic Year *</label>
                <select
    value={academicYear}
    onChange={(e) => setAcademicYear(e.target.value)}
    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
  >
                  <option value="FE">First Year (FE)</option>
                  <option value="SE">Second Year (SE)</option>
                  <option value="TE">Third Year (TE)</option>
                  <option value="BE">Final Year (BE)</option>
                  <option value="ALUMNI">Alumni</option>
                  <option value="FACULTY">Faculty</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
    type="submit"
    disabled={loading}
    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-bold text-xs shadow-lg shadow-electric-blue/30 hover:shadow-electric-blue/50 transition-all flex items-center justify-center gap-2"
  >
                <span>{loading ? "Creating Account..." : "Complete Account Registration"}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-electric-cyan hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>;
};

export default RegisterPage;
