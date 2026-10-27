import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Share2,
  Sparkles,
  ShieldAlert,
  X,
  CreditCard,
  QrCode,
  Info,
} from 'lucide-react';
import { EventItem } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [yearInput, setYearInput] = useState('SE');
  const [notesInput, setNotesInput] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await api.events.getBySlug(slug);
        if (res.success && res.event) {
          setEvent(res.event);
          if (res.userRegistrationStatus?.isRegistered) {
            setIsRegistered(true);
            setRegistrationData(res.userRegistrationStatus.registration);
          }
        } else {
          setError('Event not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setRegistering(true);
      setRegisterError(null);
      const res = await api.registrations.register({
        eventId: event._id,
        phone: phoneInput || user?.phone,
        academicYear: yearInput || user?.academicYear || 'SE',
        notes: notesInput,
      });

      if (res.success) {
        setRegisterSuccess(true);
        setIsRegistered(true);
        setRegistrationData(res.registration);
        if (event.capacity) {
          setEvent({ ...event, registeredCount: (event.registeredCount || 0) + 1 });
        }
      }
    } catch (err: any) {
      setRegisterError(err.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen max-w-4xl mx-auto px-4">
        <div className="glass-card rounded-3xl h-96 animate-pulse bg-white/5" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="pt-32 pb-20 min-h-screen max-w-xl mx-auto px-4 text-center">
        <div className="p-8 rounded-3xl bg-navy-900 border border-white/10 space-y-4">
          <AlertCircle size={40} className="mx-auto text-rose-400" />
          <h2 className="text-xl font-bold text-white">Event Not Found</h2>
          <p className="text-xs text-slate-400">
            The event you are searching for might have been moved or unpublished.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold"
          >
            <ArrowLeft size={14} />
            <span>Return to Events</span>
          </Link>
        </div>
      </div>
    );
  }

  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
  const isFull = event.capacity ? (event.registeredCount || 0) >= event.capacity : false;
  const canRegister = !isDeadlinePassed && !isFull && !isRegistered;

  const eventDate = new Date(event.startDate);
  const deadlineDate = new Date(event.registrationDeadline);
  const feeDisplay = event.isPaid ? `₹${(event.fee / 100).toFixed(2)}` : 'FREE';

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="py-4">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to All Events</span>
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-navy-900 aspect-[21/9] sm:aspect-[21/8] mb-8">
          <img
            src={event.posterUrl || '/assets/aces-team.jpg'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-electric-blue text-white">
                  {event.category}
                </span>
                <span
                  className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    event.isPaid
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {feeDisplay}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {event.title}
              </h1>
              {event.subtitle && (
                <p className="text-xs sm:text-sm text-slate-300 font-medium">{event.subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Description & Information */}
          <div className="lg:col-span-8 space-y-8">
            {/* Description Card */}
            <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">
                About This Event
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Event Logistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-navy-900 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-electric-cyan uppercase">
                  <Calendar size={14} />
                  <span>Date & Schedule</span>
                </div>
                <div className="text-sm font-semibold text-white">
                  {eventDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>{event.timeString || '10:00 AM onwards'}</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-navy-900 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-electric-cyan uppercase">
                  <MapPin size={14} />
                  <span>Venue & Location</span>
                </div>
                <div className="text-sm font-semibold text-white">{event.venue}</div>
                <div className="text-xs text-slate-400">
                  {event.isOnline
                    ? 'Online via Google Meet / Zoom'
                    : 'Department of Computer Engineering, KBTCOE'}
                </div>
              </div>
            </div>

            {/* Paid Event Payment Details Banner */}
            {event.isPaid && (
              <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <CreditCard size={18} />
                  <span>Registration Fee: {feeDisplay}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      UPI Payment ID (VPA)
                    </span>
                    <span className="font-mono text-cyan-300 font-bold text-sm">
                      {event.paymentUpiId || 'aceskbtcoe@okaxis'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Refund Policy
                    </span>
                    <span className="text-slate-300">
                      {event.refundPolicy || 'Non-refundable once seat is verified.'}
                    </span>
                  </div>
                </div>
                {event.paymentInstructions && (
                  <div className="p-3 rounded-xl bg-navy-950/60 border border-amber-500/20 text-xs text-slate-300 flex items-start gap-2">
                    <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 block mb-0.5">Instructions:</strong>
                      {event.paymentInstructions}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Organizer Info */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Organized By
                </span>
                <h4 className="text-sm font-bold text-white">{event.organizerInfo || 'ACES KBTCOE'}</h4>
                <p className="text-xs text-slate-400">Computer Engineering Students' Association</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 font-medium">
                Verified Club Activity
              </span>
            </div>
          </div>

          {/* Right Column: Registration Status Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6 sticky top-28">
              <h3 className="text-base font-bold text-white border-b border-white/5 pb-3">
                Registration Status
              </h3>

              {/* Status Banner */}
              {isRegistered ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 size={16} />
                    <span>
                      {event.isPaid && registrationData?.paymentStatus !== 'VERIFIED'
                        ? 'Waitlisted — Awaiting Payment Proof'
                        : 'Seat Confirmed!'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    {event.isPaid && registrationData?.paymentStatus !== 'VERIFIED'
                      ? 'Please submit your payment receipt (UTR & screenshot) in your Member Dashboard to verify your ticket.'
                      : 'You are registered for this event. Access your event pass in your Member Dashboard.'}
                  </p>
                  <Link
                    to="/dashboard"
                    className="inline-block mt-2 text-xs font-bold text-white underline underline-offset-2"
                  >
                    Go to My Dashboard →
                  </Link>
                </div>
              ) : isDeadlinePassed ? (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <ShieldAlert size={16} />
                  <span>Registration deadline has passed.</span>
                </div>
              ) : isFull ? (
                <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <Users size={16} />
                  <span>Event has reached maximum seat capacity.</span>
                </div>
              ) : null}

              {/* Details */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Entry Fee</span>
                  <span className="font-bold text-white text-sm">{feeDisplay}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>Available Seats</span>
                  <span className="font-semibold text-white">
                    {event.capacity ? `${event.registeredCount || 0} / ${event.capacity}` : 'Unlimited'}
                  </span>
                </div>

                {event.capacity && (
                  <div className="w-full bg-navy-950 h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="bg-electric-cyan h-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          ((event.registeredCount || 0) / event.capacity) * 100
                        )}%`,
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-white/5">
                  <span>Deadline</span>
                  <span className="font-semibold text-white">
                    {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300 pt-1">
                  <span>Eligibility</span>
                  <span className="font-semibold text-electric-cyan">
                    {event.eligibility.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isRegistered ? (
                  <Link
                    to="/dashboard"
                    className="w-full block py-3.5 rounded-xl bg-electric-blue text-center text-white font-bold text-xs shadow-lg"
                  >
                    {event.isPaid ? 'View Pass & Submit Proof' : 'View Pass in Dashboard'}
                  </Link>
                ) : (
                  <button
                    disabled={!canRegister}
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login');
                      } else {
                        setIsModalOpen(true);
                      }
                    }}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
                      canRegister
                        ? 'bg-gradient-to-r from-electric-blue to-electric-indigo text-white hover:shadow-electric-blue/40 hover:-translate-y-0.5'
                        : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {!isAuthenticated
                      ? 'Sign In to Register'
                      : canRegister
                      ? event.isPaid
                        ? `Register for Event (${feeDisplay})`
                        : 'Register for Free'
                      : 'Registration Unavailable'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-navy-900 border border-slate-700/80 shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setRegisterSuccess(false);
                  setRegisterError(null);
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>

              {registerSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle2 size={30} />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {event.isPaid ? 'Registration Waitlisted!' : 'Registration Confirmed!'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {event.isPaid
                      ? 'Your entry is recorded. Please submit your UPI transaction reference (UTR) and screenshot in your Member Dashboard to finalize verification.'
                      : `You have successfully registered for ${event.title}.`}
                  </p>
                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold"
                    >
                      Close
                    </button>
                    <Link
                      to="/dashboard"
                      className="flex-1 py-2.5 rounded-xl bg-electric-blue text-white text-xs font-semibold text-center"
                    >
                      {event.isPaid ? 'Submit UTR Proof Now' : 'View Dashboard'}
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Confirm Event Registration</h3>
                    <p className="text-xs text-slate-400 truncate">{event.title}</p>
                  </div>

                  {event.isPaid && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
                      <strong className="block font-bold mb-1">Paid Event: {feeDisplay}</strong>
                      After submitting, you will upload your UPI payment screenshot and UTR in the Member Dashboard to confirm your seat.
                    </div>
                  )}

                  {registerError && (
                    <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                      {registerError}
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1">Your Name</label>
                      <input
                        type="text"
                        disabled
                        value={user?.fullName || ''}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Contact Phone (Optional)</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Academic Year</label>
                      <select
                        value={yearInput}
                        onChange={(e) => setYearInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
                      >
                        <option value="FE">First Year (FE)</option>
                        <option value="SE">Second Year (SE)</option>
                        <option value="TE">Third Year (TE)</option>
                        <option value="BE">Final Year (BE)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Notes / Questions (Optional)</label>
                      <textarea
                        rows={2}
                        placeholder="Any expectations or questions for the organizers..."
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={registering}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white text-xs font-bold shadow-lg shadow-electric-blue/30 hover:shadow-electric-blue/50"
                    >
                      {registering ? 'Confirming...' : 'Register'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
