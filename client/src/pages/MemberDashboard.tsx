import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Calendar,
  CheckCircle2,
  Clock,
  LogOut,
  MapPin,
  Sparkles,
  Shield,
  AlertCircle,
  XCircle,
  FileText,
  Edit2,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { EventRegistration, MembershipApplication } from '../types/index.js';

export const MemberDashboard: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [application, setApplication] = useState<MembershipApplication | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit modal
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editYear, setEditYear] = useState(user?.academicYear || 'SE');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [regRes, appRes] = await Promise.all([
          api.registrations.getMyRegistrations(),
          api.applications.getMyApplication(),
        ]);

        if (regRes.success && regRes.registrations) {
          setRegistrations(regRes.registrations);
        }
        if (appRes.success && appRes.application) {
          setApplication(appRes.application);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, navigate]);

  const handleCancelRegistration = async (regId: string) => {
    if (!window.confirm('Are you sure you want to cancel your registration for this event?')) return;
    try {
      const res = await api.registrations.cancel(regId);
      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r._id === regId ? { ...r, status: 'CANCELLED' } : r))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel registration');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileMsg(null);
      const res = await api.auth.updateProfile({
        fullName: editName,
        phone: editPhone,
        academicYear: editYear,
      });
      if (res.success) {
        await refreshUser();
        setIsEditing(false);
        setProfileMsg('Profile updated successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!user) return null;

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Member Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800/80 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-electric-blue to-electric-indigo text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-electric-blue/20">
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{user.fullName}</h1>
                {user.isApprovedMember ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    APPROVED MEMBER
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-400 border border-white/10">
                    STUDENT ACCOUNT
                  </span>
                )}
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
                {user.email} • {user.department || 'Computer Engineering'} ({user.academicYear || 'SE'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditName(user.fullName);
                setEditPhone(user.phone || '');
                setEditYear(user.academicYear || 'SE');
                setIsEditing(!isEditing);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              <Edit2 size={13} />
              <span>Edit Profile</span>
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
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs mb-8">
            {profileMsg}
          </div>
        )}

        {/* Profile Edit Drawer / Card */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-6 rounded-3xl bg-navy-850 border border-slate-700/80 mb-8 max-w-xl"
          >
            <h3 className="text-sm font-bold text-white mb-4">Update Profile Details</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Academic Year</label>
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
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 rounded-xl bg-electric-blue text-white font-bold text-xs"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: My Event Registrations */}
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

            {loading ? (
              <div className="p-8 rounded-2xl glass-card text-center text-xs text-slate-400">
                Loading registrations...
              </div>
            ) : registrations.length === 0 ? (
              <div className="p-10 rounded-3xl glass-card border border-white/10 text-center space-y-3">
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
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg) => {
                  const ev = typeof reg.eventId === 'object' ? reg.eventId : null;
                  const isCancelled = reg.status === 'CANCELLED';

                  return (
                    <div
                      key={reg._id}
                      className={`p-6 rounded-2xl border transition-all ${
                        isCancelled
                          ? 'bg-navy-950/40 border-white/5 opacity-60'
                          : 'glass-card border-white/10'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                reg.status === 'ATTENDED'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : reg.status === 'REGISTERED'
                                  ? 'bg-electric-blue/20 text-electric-cyan'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {reg.status}
                            </span>
                            {ev?.category && (
                              <span className="text-[10px] text-slate-400 uppercase font-medium">
                                • {ev.category}
                              </span>
                            )}
                          </div>

                          <h4 className="text-lg font-bold text-white">
                            {ev?.title || 'Departmental Event'}
                          </h4>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                            {ev?.startDate && (
                              <div className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-slate-500" />
                                <span>
                                  {new Date(ev.startDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            )}
                            {ev?.venue && (
                              <div className="flex items-center gap-1.5">
                                <MapPin size={13} className="text-slate-500" />
                                <span>{ev.venue}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {ev?.slug && (
                            <Link
                              to={`/events/${ev.slug}`}
                              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10"
                            >
                              Event Page
                            </Link>
                          )}
                          {!isCancelled && (
                            <button
                              onClick={() => handleCancelRegistration(reg._id)}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold hover:bg-rose-500/20"
                            >
                              Cancel Seat
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Membership Card & Guidance */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-5">
              <h3 className="text-base font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
                <Shield size={16} className="text-electric-cyan" />
                <span>Club Membership</span>
              </h3>

              {user.isApprovedMember ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 size={16} />
                    <span>Official ACES Member</span>
                  </div>
                  <p className="text-emerald-200/90 leading-relaxed">
                    You have active membership privileges for the 2026-27 academic term.
                  </p>
                </div>
              ) : application ? (
                <div className="space-y-3 text-xs">
                  <div
                    className={`p-4 rounded-2xl border ${
                      application.status === 'APPROVED'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : application.status === 'REJECTED'
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">
                      Submitted Application Status
                    </span>
                    <strong className="block text-sm font-bold">{application.status}</strong>
                    <p className="mt-1 leading-relaxed text-slate-300">
                      {application.status === 'PENDING'
                        ? 'Your submission is queued for committee review.'
                        : application.adminNotes || 'Review complete.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs text-slate-300">
                  <p className="leading-relaxed">
                    You haven't applied for official club membership yet. Becoming an approved member grants priority event registration, leadership roles, and hackathon project support.
                  </p>
                  <Link
                    to="/join"
                    className="block text-center py-3 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-bold shadow-lg"
                  >
                    Apply for Membership Now →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
