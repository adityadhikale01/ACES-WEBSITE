import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Code2,
  Users2,
  AlertCircle,
  KeyRound,
  Mail,
  ShieldCheck,
  RefreshCw,
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

  // OTP Verification States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpNotice, setOtpNotice] = useState(null);

  // Countdown timer effect
  useEffect(() => {
    let timer = null;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [otpCountdown]);

  useEffect(() => {
    if (isAuthenticated) {
      api.applications
        .getMyApplication()
        .then((res) => {
          if (res.success && res.application) {
            setExistingApp(res.application);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Send OTP handler
  const handleSendOtp = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setOtpNotice({ type: "error", message: "Please enter a valid email address first." });
      return;
    }
    try {
      setSendingOtp(true);
      setOtpNotice(null);
      const res = await api.applications.sendOtp({ email: email.trim() });
      if (res.success) {
        setOtpSent(true);
        setOtpCountdown(60);
        setOtpNotice({
          type: "success",
          message: `Verification code sent to ${email.trim()}! Please check your inbox / spam.`,
        });
      }
    } catch (err) {
      setOtpNotice({
        type: "error",
        message: err.message || "Failed to dispatch verification code. Please check your email.",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpNotice({ type: "error", message: "Please enter the 6-digit code received on your email." });
      return;
    }
    try {
      setVerifyingOtp(true);
      setOtpNotice(null);
      const res = await api.applications.verifyOtp({
        email: email.trim(),
        otp: otpCode.trim(),
      });
      if (res.success) {
        setIsEmailVerified(true);
        setOtpNotice({
          type: "success",
          message: "✓ Email verified successfully! You can now submit your application.",
        });
      }
    } catch (err) {
      setOtpNotice({
        type: "error",
        message: err.message || "Invalid or expired verification code. Please try again.",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Reset OTP state when applicant changes email
  const handleEmailChange = (newEmail) => {
    setEmail(newEmail);
    if (isEmailVerified || otpSent) {
      setIsEmailVerified(false);
      setOtpSent(false);
      setOtpCode("");
      setOtpNotice(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) {
      setErrorMsg("Please verify your email address using the 6-digit OTP code before submitting.");
      return;
    }

    if (selectedInterests.length === 0) {
      setErrorMsg("Please select at least one area of interest.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      const res = await api.applications.submit({
        fullName,
        email: email.trim(),
        phone,
        department,
        academicYear,
        prnOrRoll,
        areasOfInterest: selectedInterests,
        reasonForJoining,
      });
      if (res.success) {
        setSuccessMsg(
          res.message ||
            "Application submitted successfully! Your submission is now under review by the Superadmin."
        );
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-300 font-medium">
                        Email Address *
                      </label>
                      {isEmailVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12} />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="email"
                          required
                          placeholder="student@kbtcoe.org"
                          value={email}
                          disabled={isEmailVerified}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border text-white placeholder-slate-600 focus:outline-none ${
                            isEmailVerified
                              ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-200 cursor-not-allowed"
                              : "border-white/10 focus:border-electric-cyan"
                          }`}
                        />
                        {isEmailVerified && (
                          <ShieldCheck
                            size={16}
                            className="absolute right-3 top-3 text-emerald-400"
                          />
                        )}
                      </div>

                      {!isEmailVerified ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={sendingOtp || otpCountdown > 0 || !email}
                          className="px-3.5 py-2.5 rounded-xl bg-electric-blue/20 hover:bg-electric-blue/30 border border-electric-cyan/40 text-electric-cyan font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 whitespace-nowrap"
                        >
                          {sendingOtp ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : otpCountdown > 0 ? (
                            <span>Resend ({otpCountdown}s)</span>
                          ) : otpSent ? (
                            <span>Resend Code</span>
                          ) : (
                            <>
                              <KeyRound size={13} />
                              <span>Verify Email</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEmailVerified(false)}
                          className="px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 text-xs transition-all whitespace-nowrap"
                        >
                          Change
                        </button>
                      )}
                    </div>

                    {/* OTP Entry Drawer */}
                    <AnimatePresence>
                      {!isEmailVerified && otpSent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-3 p-3.5 rounded-2xl bg-navy-900 border border-electric-cyan/30 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 font-semibold text-[11px] flex items-center gap-1.5">
                              <KeyRound size={13} className="text-electric-cyan" />
                              Enter 6-Digit Code sent to your email:
                            </span>
                            {otpCountdown > 0 ? (
                              <span className="text-[10px] text-slate-400">
                                Expires in 10 mins • Resend in {otpCountdown}s
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={sendingOtp}
                                className="text-[10px] text-electric-cyan underline hover:text-white"
                              >
                                Resend Code Now
                              </button>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="123456"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                              className="flex-1 px-3 py-2 text-center text-sm font-mono tracking-widest rounded-xl bg-navy-950 border border-white/15 text-white focus:outline-none focus:border-electric-cyan"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={verifyingOtp || otpCode.length !== 6}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/25 disabled:opacity-50"
                            >
                              {verifyingOtp ? (
                                <RefreshCw size={13} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={13} />
                              )}
                              <span>Verify Code</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Status/Error notice */}
                    {otpNotice && (
                      <p
                        className={`text-[11px] mt-2 flex items-center gap-1.5 ${
                          otpNotice.type === "success"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {otpNotice.type === "success" ? (
                          <CheckCircle2 size={13} className="flex-shrink-0" />
                        ) : (
                          <AlertCircle size={13} className="flex-shrink-0" />
                        )}
                        <span>{otpNotice.message}</span>
                      </p>
                    )}
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

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={submitting || !isEmailVerified}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                      !isEmailVerified
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                        : "bg-gradient-to-r from-electric-blue to-electric-indigo text-white shadow-electric-blue/25 hover:shadow-electric-blue/40"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Submit Membership Application</span>
                      </>
                    )}
                  </button>
                  {!isEmailVerified && (
                    <p className="text-[11px] text-amber-400/90 text-center flex items-center justify-center gap-1.5 pt-1">
                      <KeyRound size={12} className="text-amber-400" />
                      <span>Please verify your email address via the OTP code above to submit.</span>
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>;
};

export default JoinPage;
