import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Code2,
  Users2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../auth/authContext.jsx";
import { api } from "../../services/api.js";
const interestOptions = [
  "Data Structures & Algorithms",
  "Web & Full-Stack Development",
  "Artificial Intelligence & ML",
  "Cloud & DevOps",
  "Cybersecurity & Ethical Hacking",
  "Event Organization & Management",
  "Graphic Design & Media Production",
  "Public Relations & Outreach"
];
export const JoinPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [department, setDepartment] = useState("Computer Engineering");
  const [academicYear, setAcademicYear] = useState("SE");
  const [prnOrRoll, setPrnOrRoll] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [reasonForJoining, setReasonForJoining] = useState("");
  const [existingApp, setExistingApp] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  useEffect(() => {
    if (isAuthenticated) {
      api.applications.getMyApplication().then((res) => {
        if (res.success && res.application) {
          setExistingApp(res.application);
        }
      }).catch(() => {
      });
    }
  }, [isAuthenticated]);
  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedInterests.length === 0) {
      setErrorMsg("Please select at least one area of interest.");
      return;
    }
    try {
      setSubmitting(true);
      setErrorMsg(null);
      const res = await api.applications.submit({
        fullName,
        email,
        phone,
        department,
        academicYear,
        prnOrRoll,
        areasOfInterest: selectedInterests,
        reasonForJoining
      });
      if (res.success) {
        setSuccessMsg(res.message || "Application submitted successfully! Your submission is now under review by the Superadmin.");
        if (res.application) {
          setExistingApp(res.application);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {
    /* Header */
  }
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric-blue/15 border border-electric-blue/30 text-xs text-electric-cyan font-semibold">
            <Sparkles size={13} />
            <span>MEMBERSHIP INTAKE 2026 - 27</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Join <span className="text-gradient">ACES KBTCOE</span>
          </h1>
          <p className="text-base text-slate-300 leading-relaxed font-normal">
            Become a part of the Computer Engineering Students' Association. Grow your technical skills, collaborate with driven peers, and lead departmental initiatives.
          </p>
        </div>

        {
    /* Existing Application Tracker Status Card */
  }
        {existingApp && <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-6 sm:p-8 rounded-3xl border mb-12 ${existingApp.status === "APPROVED" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : existingApp.status === "REJECTED" ? "bg-rose-500/10 border-rose-500/30 text-rose-300" : "bg-amber-500/10 border-amber-500/30 text-amber-300"}`}
  >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  Application Status
                </span>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {existingApp.status === "APPROVED" ? <>
                      <CheckCircle2 size={20} />
                      <span>Approved Club Member!</span>
                    </> : existingApp.status === "REJECTED" ? <>
                      <AlertCircle size={20} />
                      <span>Application Reviewed (Not Approved)</span>
                    </> : <>
                      <Clock size={20} />
                      <span>Application Pending Administrative Review</span>
                    </>}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  {existingApp.status === "APPROVED" ? "Congratulations! Your membership has been officially approved. You now have full access to member-only workshops and resources." : existingApp.status === "REJECTED" ? `Admin Note: ${existingApp.adminNotes || "We encourage you to participate in open events and re-apply in the next intake."}` : "Our committee is reviewing your application against current club domain capacities. Updates will be visible right here."}
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-black/30 border border-white/10">
                {existingApp.status}
              </span>
            </div>
          </motion.div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {
    /* Left Column: Benefits & Expectations */
  }
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">
                Why Join ACES?
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-electric-cyan/15 text-electric-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">Priority Technical Workshops</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Reserved seating and hands-on guidance in DSA, Full-Stack, AI, and Git sessions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-electric-blue/15 text-electric-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Code2 size={16} />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">Hackathon Teaming & Mentorship</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Connect with experienced seniors to form high-performing teams for national competitions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users2 size={16} />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">Leadership Roles & Recognition</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Lead domains, coordinate flagship events, and earn official departmental certificates.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-navy-850 border border-white/10 space-y-2 text-xs text-slate-400">
              <h4 className="text-white font-bold text-sm mb-1">Eligibility Criteria</h4>
              <p>• Open to students of Department of Computer Engineering, KBTCOE.</p>
              <p>• FE, SE, TE, and BE students passionate about engineering and teamwork.</p>
              <p>• Commitment to actively participate in club initiatives throughout 2026-27.</p>
            </div>
          </div>

          {
    /* Right Column: Application Form */
  }
          <div className="lg:col-span-7">
            <div className="glass-card p-8 rounded-3xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-2">Membership Application Form</h3>
              <p className="text-xs text-slate-400 mb-6">
                Please complete the form below. Information provided will be reviewed by the ACES Faculty Coordinator and President.
              </p>

              {successMsg && <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs mb-6 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>}

              {errorMsg && <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs mb-6 flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>}

              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="student@kbtcoe.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Academic Year *
                    </label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
                    >
                      <option value="FE">First Year (FE)</option>
                      <option value="SE">Second Year (SE)</option>
                      <option value="TE">Third Year (TE)</option>
                      <option value="BE">Final Year (BE)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      PRN / Roll No. (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 7234..."
                      value={prnOrRoll}
                      onChange={(e) => setPrnOrRoll(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
                    />
                  </div>
                </div>

                {
    /* Areas of Interest Checkboxes */
  }
                <div>
                  <label className="block text-slate-300 font-medium mb-2">
                    Areas of Interest (Select all that apply) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {interestOptions.map((opt) => {
    const isChecked = selectedInterests.includes(opt);
    return <button
      key={opt}
      type="button"
      onClick={() => toggleInterest(opt)}
      className={`p-2.5 rounded-xl text-left transition-all border flex items-center justify-between ${isChecked ? "bg-electric-blue/20 border-electric-cyan/50 text-white" : "bg-navy-950/70 border-white/5 text-slate-400 hover:text-white"}`}
    >
                          <span className="truncate">{opt}</span>
                          {isChecked && <CheckCircle2 size={14} className="text-electric-cyan flex-shrink-0" />}
                        </button>;
  })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Why do you want to join ACES? (Min 15 characters) *
                  </label>
                  <textarea
    rows={3}
    required
    placeholder="Tell us what you hope to learn or contribute to the Computer Engineering club..."
    value={reasonForJoining}
    onChange={(e) => setReasonForJoining(e.target.value)}
    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
  />
                </div>

                <div className="pt-2">
                  <button
    type="submit"
    disabled={submitting}
    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-bold text-xs shadow-lg shadow-electric-blue/25 hover:shadow-electric-blue/40 transition-all"
  >
                    {submitting ? "Submitting Application..." : "Submit Membership Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>;
};

export default JoinPage;
