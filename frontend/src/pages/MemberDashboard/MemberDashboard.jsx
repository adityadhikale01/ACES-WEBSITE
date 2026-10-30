import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  LogOut,
  MapPin,
  Shield,
  Edit2,
  X
} from "lucide-react";
import { useAuth } from "../../auth/authContext.jsx";
import { api } from "../../services/api.js";
export const MemberDashboard = () => {
  const { user, isAuthenticated, isAdmin, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [application, setApplication] = useState(null);
  const [myPayments, setMyPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editName, setEditName] = useState(user?.fullName || user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [editYear, setEditYear] = useState(user?.academicYear || "SE");
  const [editBio, setEditBio] = useState(user?.bio || "");
  const [editLinkedin, setEditLinkedin] = useState(user?.linkedinUrl || "");
  const [editGithub, setEditGithub] = useState(user?.githubUrl || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [paymentModalReg, setPaymentModalReg] = useState(null);
  const [utrInput, setUtrInput] = useState("");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofError, setProofError] = useState(null);
  const [proofSuccess, setProofSuccess] = useState(false);
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [regRes, appRes, payRes] = await Promise.all([
        api.registrations.getMyRegistrations(),
        api.applications.getMyApplication(),
        api.payments.getMyPayments()
      ]);
      if (regRes.success && regRes.registrations) {
        setRegistrations(regRes.registrations);
      }
      if (appRes.success && appRes.application) {
        setApplication(appRes.application);
      }
      if (payRes.success && payRes.submissions) {
        setMyPayments(payRes.submissions);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, navigate]);
  const handleCancelRegistration = async (regId) => {
    if (!window.confirm("Are you sure you want to cancel your registration for this event?")) return;
    try {
      const res = await api.registrations.cancel(regId);
      if (res.success) {
        setRegistrations(
          (prev) => prev.map((r) => r._id === regId ? { ...r, status: "CANCELLED" } : r)
        );
      }
    } catch (err) {
      alert(err.message || "Failed to cancel registration");
    }
  };
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      setProfileMsg(null);
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.auth.uploadProfilePhoto(formData);
      if (res.success) {
        await refreshUser();
        setProfileMsg("Profile photo updated successfully!");
      }
    } catch (err) {
      alert(err.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileMsg(null);
      const res = await api.auth.updateProfile({
        fullName: editName,
        phone: editPhone,
        academicYear: editYear,
        bio: editBio,
        linkedinUrl: editLinkedin,
        githubUrl: editGithub,
      });
      if (res.success) {
        await refreshUser();
        setIsEditing(false);
        setProfileMsg("Profile details saved successfully! Updates are live on the Team page.");
      }
    } catch (err) {
      alert(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill in both current and new password.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    try {
      setChangingPassword(true);
      setPasswordMsg(null);
      const res = await api.auth.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setIsChangingPassword(false), 2000);
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setChangingPassword(false);
    }
  };
  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!paymentModalReg) return;
    if (!utrInput.trim() || utrInput.trim().length < 4) {
      setProofError("Please enter a valid Transaction ID / UTR reference (min 4 characters).");
      return;
    }
    if (!screenshotFile) {
      setProofError("Please select a payment screenshot / receipt image.");
      return;
    }
    try {
      setSubmittingProof(true);
      setProofError(null);
      const formData = new FormData();
      formData.append("registrationId", paymentModalReg._id);
      formData.append("utrReference", utrInput.trim());
      formData.append("screenshot", screenshotFile);
      const res = await api.payments.submitProof(formData);
      if (res.success) {
        setProofSuccess(true);
        loadDashboardData();
      }
    } catch (err) {
      setProofError(err.message || "Failed to submit payment proof");
    } finally {
      setSubmittingProof(false);
    }
  };
  if (!user) return null;
  return <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Member Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800/80 mb-8">
          <div className="flex items-center gap-5">
            {/* Profile Photo Avatar with Instant Upload */}
            <div className="relative group shrink-0">
              <img
                src={user.photoUrl || '/assets/aces-team.jpg'}
                alt={user.fullName || user.name}
                className="w-20 h-20 rounded-2xl object-cover object-top border-2 border-electric-cyan/60 shadow-lg shadow-electric-cyan/20"
                onError={(e) => {
                  e.target.src = '/assets/aces-team.jpg';
                }}
              />
              <label
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-white font-bold cursor-pointer transition-opacity backdrop-blur-xs"
                title="Change Profile Photo"
              >
                <span>{uploadingPhoto ? "..." : "Change"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{user.fullName || user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-electric-blue/20 text-electric-cyan border border-electric-blue/30">
                  {user.assignedPost || (user.isApprovedMember ? "APPROVED MEMBER" : "STUDENT ACCOUNT")}
                </span>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                  >
                    ADMIN PORTAL →
                  </Link>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {user.email} • {user.department || "Computer Engineering"} ({user.academicYear || "SE"})
                {user.phone ? ` • 📞 ${user.phone}` : ""}
              </p>
              <div className="flex items-center gap-3 pt-0.5 text-xs text-slate-400">
                {user.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    LinkedIn
                  </a>
                )}
                {user.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-300 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    GitHub
                  </a>
                )}
                <span className="text-[10px] text-emerald-400 font-semibold">
                  ✓ Profile shown to public on Team Page
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setEditName(user.fullName || user.name || "");
                setEditPhone(user.phone || "");
                setEditYear(user.academicYear || "SE");
                setEditBio(user.bio || "");
                setEditLinkedin(user.linkedinUrl || "");
                setEditGithub(user.githubUrl || "");
                setIsEditing(!isEditing);
                setIsChangingPassword(false);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              <Edit2 size={13} />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => {
                setIsChangingPassword(!isChangingPassword);
                setIsEditing(false);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              <Shield size={13} />
              <span>Password</span>
            </button>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold hover:bg-rose-500/20 transition-colors"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {profileMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs mb-8 flex items-center justify-between">
            <span>{profileMsg}</span>
            <button onClick={() => setProfileMsg(null)} className="text-emerald-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Profile Edit Drawer */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-6 sm:p-8 rounded-3xl bg-navy-900 border border-slate-700/80 mb-8 max-w-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">Update Official Member Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Academic Year</label>
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                  >
                    <option value="FE">First Year (FE)</option>
                    <option value="SE">Second Year (SE)</option>
                    <option value="TE">Third Year (TE)</option>
                    <option value="BE">Final Year (BE)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Change Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:bg-white/10 file:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">GitHub Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={editGithub}
                    onChange={(e) => setEditGithub(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Bio / Statement of Purpose (Shown on Public Team Page)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a short summary about your technical interests, leadership experience, and contributions..."
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-xl bg-electric-blue hover:bg-blue-600 text-white font-bold text-xs transition-colors"
                >
                  {savingProfile ? "Saving Profile..." : "Save Profile Details"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Password Change Drawer */}
        {isChangingPassword && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-6 rounded-3xl bg-navy-900 border border-slate-700/80 mb-8 max-w-md"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Shield size={14} className="text-electric-cyan" />
                <span>Change Account Password</span>
              </h3>
              <button onClick={() => setIsChangingPassword(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl text-xs mb-3 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">New Password (min 6 chars)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-5 py-2 rounded-xl bg-electric-blue hover:bg-blue-600 text-white font-bold text-xs transition-colors"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {
    /* Left Column: My Event Registrations */
  }
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-electric-cyan" />
                <span>My Registered Events</span>
              </h2>
              <Link
    to="/events"
    className="text-xs font-semibold text-electric-cyan hover:underline"
  >
                + Browse More Events
              </Link>
            </div>

            {loading ? <div className="p-8 rounded-2xl glass-card text-center text-xs text-slate-400">
                Loading registrations...
              </div> : registrations.length === 0 ? <div className="p-10 rounded-3xl glass-card border border-white/10 text-center space-y-3">
                <Calendar size={32} className="mx-auto text-slate-600" />
                <h4 className="text-base font-bold text-white">No Event Registrations Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You haven't registered for any departmental workshops or events yet. Explore the calendar and reserve your seat!
                </p>
                <div className="pt-2">
                  <Link
    to="/events"
    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold"
  >
                    <span>Discover Events</span>
                  </Link>
                </div>
              </div> : <div className="space-y-4">
                {registrations.map((reg) => {
    const ev = typeof reg.eventId === "object" ? reg.eventId : null;
    const isCancelled = reg.status === "CANCELLED";
    const isPaidEvent = reg.isPaidEvent || ev && ev.isPaid;
    const paymentSubmission = myPayments.find((p) => {
      const regId = typeof p.registrationId === "object" ? p.registrationId._id : p.registrationId;
      return regId === reg._id;
    });
    return <div
      key={reg._id}
      className={`p-6 rounded-2xl border transition-all ${isCancelled ? "bg-navy-950/40 border-white/5 opacity-60" : "glass-card border-white/10"}`}
    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${reg.status === "ATTENDED" ? "bg-emerald-500/20 text-emerald-300" : reg.status === "REGISTERED" ? "bg-electric-blue/20 text-electric-cyan" : "bg-amber-500/20 text-amber-300"}`}
    >
                              {reg.status}
                            </span>

                            {isPaidEvent ? <span
      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${reg.paymentStatus === "VERIFIED" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : reg.paymentStatus === "PROOF_SUBMITTED" || reg.paymentStatus === "UNDER_REVIEW" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : reg.paymentStatus === "REJECTED" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}
    >
                                {reg.paymentStatus === "VERIFIED" ? "Payment Verified \u2713" : reg.paymentStatus === "PROOF_SUBMITTED" ? "Proof Under Review \u23F3" : reg.paymentStatus === "REJECTED" ? "Proof Rejected \u2715" : "Payment Proof Required"}
                              </span> : <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-white/5 text-slate-400">
                                Free Entry
                              </span>}

                            {ev?.category && <span className="text-[10px] text-slate-400 uppercase font-medium">
                                • {ev.category}
                              </span>}
                          </div>

                          <h4 className="text-lg font-bold text-white">
                            {ev?.title || "Departmental Event"}
                          </h4>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                            {ev?.startDate && <div className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-slate-500" />
                                <span>
                                  {new Date(ev.startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })}
                                </span>
                              </div>}
                            {ev?.venue && <div className="flex items-center gap-1.5">
                                <MapPin size={13} className="text-slate-500" />
                                <span>{ev.venue}</span>
                              </div>}
                          </div>

                          {
      /* Rejection / Resubmission notice banner */
    }
                          {paymentSubmission?.status === "REJECTED" && paymentSubmission.rejectionReason && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mt-2">
                              <strong>Rejection Feedback from Admin:</strong>
                              <p className="mt-0.5 text-slate-300">{paymentSubmission.rejectionReason}</p>
                            </div>}

                          {paymentSubmission?.status === "PROOF_SUBMITTED" && <div className="text-[11px] text-slate-400 mt-1">
                              Submitted UTR: <span className="font-mono text-cyan-300">{paymentSubmission.utrReference}</span>
                            </div>}
                        </div>

                        {
      /* Action Buttons */
    }
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                          {isPaidEvent && reg.paymentStatus !== "VERIFIED" && reg.paymentStatus !== "PROOF_SUBMITTED" && <button
      onClick={() => {
        setPaymentModalReg(reg);
        setUtrInput("");
        setScreenshotFile(null);
        setProofError(null);
        setProofSuccess(false);
      }}
      className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
    >
                                {reg.paymentStatus === "REJECTED" ? "Resubmit Proof" : "Upload Payment Proof"}
                              </button>}

                          {ev?.slug && <Link
      to={`/events/${ev.slug}`}
      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10"
    >
                              Details
                            </Link>}
                          {!isCancelled && <button
      onClick={() => handleCancelRegistration(reg._id)}
      className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold hover:bg-rose-500/20"
    >
                              Cancel
                            </button>}
                        </div>
                      </div>
                    </div>;
  })}
              </div>}
          </div>

          {
    /* Right Column: Club Membership Application Status */
  }
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-5">
              <h3 className="text-base font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
                <Shield size={16} className="text-electric-cyan" />
                <span>Club Membership</span>
              </h3>

              {user.isApprovedMember ? <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
                    <CheckCircle2 size={16} />
                    <span>Official Member</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    You have active departmental club privileges. You are eligible for exclusive member-only workshops and mentorship circles.
                  </p>
                </div> : application ? <div className="space-y-4">
                  <div
    className={`p-4 rounded-2xl border ${application.status === "APPROVED" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : application.status === "REJECTED" ? "bg-rose-500/15 border-rose-500/30 text-rose-300" : "bg-amber-500/15 border-amber-500/30 text-amber-300"}`}
  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Application Status
                      </span>
                      <span className="text-xs font-bold">{application.status}</span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">
                      {application.status === "PENDING" ? "Your application is under review by the ACES Faculty Coordinator and President." : application.status === "APPROVED" ? "Your application has been accepted! Welcome to ACES." : "Your application could not be approved at this time."}
                    </p>
                    {application.adminNotes && <div className="mt-2 text-[11px] pt-2 border-t border-white/10">
                        <strong>Review Note:</strong> {application.adminNotes}
                      </div>}
                  </div>
                </div> : <div className="space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Join the ACES KBTCOE departmental committee network to organize events, lead technical workshops, and collaborate with peers.
                  </p>
                  <Link
    to="/join"
    className="block w-full py-2.5 rounded-xl bg-electric-blue text-center text-white text-xs font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-electric-blue/20"
  >
                    Apply for Club Membership →
                  </Link>
                </div>}
            </div>
          </div>
        </div>
      </div>

      {
    /* Payment Proof Submission Modal */
  }
      <AnimatePresence>
        {paymentModalReg && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
            <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-navy-900 border border-slate-700/80 shadow-2xl relative"
  >
              <button
    onClick={() => setPaymentModalReg(null)}
    className="absolute top-5 right-5 text-slate-400 hover:text-white"
  >
                <X size={18} />
              </button>

              {proofSuccess ? <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle2 size={30} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Payment Proof Submitted!</h3>
                  <p className="text-xs text-slate-300">
                    Your UTR reference and receipt have been transmitted securely to the ACES administration team. Your registration status will update to <strong>REGISTERED</strong> once verified.
                  </p>
                  <button
    onClick={() => {
      setPaymentModalReg(null);
      setProofSuccess(false);
    }}
    className="px-6 py-2.5 rounded-xl bg-electric-blue text-white text-xs font-semibold"
  >
                    Done
                  </button>
                </div> : <form onSubmit={handleSubmitProof} className="space-y-4 text-xs">
                  <div>
                    <h3 className="text-base font-bold text-white">Submit Payment Proof</h3>
                    <p className="text-slate-400 text-xs">
                      {typeof paymentModalReg.eventId === "object" ? paymentModalReg.eventId.title : "Departmental Paid Event"}
                    </p>
                  </div>

                  {proofError && <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                      {proofError}
                    </div>}

                  {
    /* Payment Info Card */
  }
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold">Expected Fee:</span>
                      <span className="font-bold text-amber-300 text-sm">
                        ₹{(paymentModalReg.amountDue / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold">Pay via UPI to:</span>
                      <span className="font-mono text-cyan-300 font-bold">aceskbtcoe@okaxis</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1">
                      Pay using GPay, PhonePe, Paytm, or BHIM, then enter the 12-digit UTR reference below and upload a screenshot of your successful transaction.
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">
                      Transaction UTR / Reference ID *
                    </label>
                    <input
    type="text"
    required
    placeholder="e.g., 402812345678"
    value={utrInput}
    onChange={(e) => setUtrInput(e.target.value)}
    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400"
  />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">
                      Upload Screenshot / Receipt *
                    </label>
                    <input
    type="file"
    required
    accept="image/*,application/pdf"
    onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-electric-blue file:text-white"
  />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Receipts are stored in private secure storage and accessible solely to authorized administrators.
                    </span>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                    <button
    type="button"
    onClick={() => setPaymentModalReg(null)}
    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold"
  >
                      Cancel
                    </button>
                    <button
    type="submit"
    disabled={submittingProof}
    className="px-5 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-electric-blue/20"
  >
                      {submittingProof ? "Transmitting..." : "Submit Verification Proof"}
                    </button>
                  </div>
                </form>}
            </motion.div>
          </div>}
      </AnimatePresence>
    </div>;
};

export default MemberDashboard;
