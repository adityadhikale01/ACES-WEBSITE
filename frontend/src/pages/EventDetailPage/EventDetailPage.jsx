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
  X,
  CreditCard,
  QrCode,
  Info,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  UploadCloud,
  FileCheck,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { api } from '../../services/api.js';
import { useAuth } from '../../auth/authContext.jsx';

export const EventDetailPage = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3-Step Registration Wizard state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [regStep, setRegStep] = useState(1); // 1: Info, 2: Payment, 3: Confirmation/WhatsApp

  // Step 1: Info fields (Pre-filled if logged in, editable for guests)
  const { user, isAuthenticated } = useAuth();
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [collegeInput, setCollegeInput] = useState("MVPS's K.B.T. College of Engineering, Nashik");
  const [deptInput, setDeptInput] = useState('Computer Engineering');
  const [yearInput, setYearInput] = useState('SE');
  const [prnInput, setPrnInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  // Group Event fields
  const [isGroupReg, setIsGroupReg] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);

  // Step 2: Payment fields
  const [utrInput, setUtrInput] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Step 3: Confirmation & Ticket
  const [assignedTicketId, setAssignedTicketId] = useState('');
  const [assignedWhatsappUrl, setAssignedWhatsappUrl] = useState('');
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Submission statuses
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setNameInput(user.fullName || user.name || '');
      setEmailInput(user.email || '');
      if (user.phone) setPhoneInput(user.phone);
      if (user.department) setDeptInput(user.department);
      if (user.academicYear) setYearInput(user.academicYear);
      if (user.prn) setPrnInput(user.prn);
    }
  }, [user]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await api.events.getBySlug(slug);
        if (res.success && res.event) {
          setEvent(res.event);
          if (res.event.isGroupEvent) {
            setIsGroupReg(true);
          }
          if (res.userRegistrationStatus?.isRegistered) {
            setIsRegistered(true);
            setRegistrationData(res.userRegistrationStatus.registration);
          }
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  const handleAddGroupMember = () => {
    const max = event?.maxGroupSize || 4;
    if (groupMembers.length + 1 >= max) {
      alert(`Maximum group size for this event is ${max} members.`);
      return;
    }
    setGroupMembers([...groupMembers, { name: '', email: '', phone: '', prn: '' }]);
  };

  const handleRemoveGroupMember = (index) => {
    setGroupMembers(groupMembers.filter((_, i) => i !== index));
  };

  const handleGroupMemberChange = (index, field, value) => {
    const updated = [...groupMembers];
    updated[index][field] = value;
    setGroupMembers(updated);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const url = URL.createObjectURL(file);
      setScreenshotPreview(url);
    }
  };

  // Step 1 validation -> proceed to Step 2
  const handleProceedToStep2 = (e) => {
    e.preventDefault();
    setStepError(null);
    if (!nameInput.trim()) {
      setStepError('Participant name is required.');
      return;
    }
    if (!emailInput.trim()) {
      setStepError('Email address is required.');
      return;
    }
    if (!phoneInput.trim()) {
      setStepError('WhatsApp contact phone number is required.');
      return;
    }
    if (isGroupReg && !groupNameInput.trim()) {
      setStepError('Group / Team name is required for group events.');
      return;
    }
    setRegStep(2);
  };

  // Step 2 submission -> proceed to Step 3
  const handleConfirmRegistration = async (e) => {
    e.preventDefault();
    if (!event) return;
    setStepError(null);

    if (event.isPaid && !utrInput.trim() && !screenshotFile) {
      setStepError('Please enter your UPI UTR reference number or attach your payment screenshot.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('eventId', event._id);
      formData.append('fullName', nameInput.trim());
      formData.append('name', nameInput.trim());
      formData.append('email', emailInput.trim());
      formData.append('phone', phoneInput.trim());
      formData.append('college', collegeInput.trim());
      formData.append('department', deptInput);
      formData.append('academicYear', yearInput);
      formData.append('prn', prnInput.trim());
      formData.append('notes', notesInput.trim());

      if (isGroupReg) {
        formData.append('isGroupRegistration', 'true');
        formData.append('groupName', groupNameInput.trim());
        formData.append('groupMembers', JSON.stringify(groupMembers));
      }

      if (event.isPaid) {
        if (utrInput.trim()) formData.append('utrReference', utrInput.trim());
        if (utrInput.trim()) formData.append('utrNumber', utrInput.trim());
        if (screenshotFile) formData.append('screenshot', screenshotFile);
      }

      const res = await api.registrations.register(formData);

      if (res.success) {
        const generatedTicket = res.ticketId || res.registration?.ticketId || `ACES-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const whatsapp = res.whatsappGroupUrl || event.whatsappGroupUrl || event.whatsappLink || 'https://chat.whatsapp.com/ACES-KBTCOE-Events';

        setAssignedTicketId(generatedTicket);
        setAssignedWhatsappUrl(whatsapp);
        setIsRegistered(true);
        setRegistrationData(res.registration);
        setRegStep(3); // Advance to confirmation & WhatsApp Step
      }
    } catch (err) {
      setStepError(err.message || 'Failed to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else if (type === 'ticket') {
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading event briefing...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="pt-32 pb-20 min-h-screen max-w-xl mx-auto px-4 text-center space-y-4">
        <AlertCircle size={40} className="text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'This event does not exist.'}</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Browse All Events</span>
        </Link>
      </div>
    );
  }

  const startDateObj = new Date(event.startDate || event.eventDate);
  const formattedDate = isNaN(startDateObj.getTime())
    ? 'TBA'
    : startDateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  const feePaise = event.fee || event.feeAmountInPaise || 0;
  const feeDisplay = event.isPaid ? `₹${(feePaise / 100).toFixed(2)}` : 'FREE';
  const canRegister = event.status === 'PUBLISHED';
  const upiId = event.paymentUpiId || event.upiId || 'aces.kbtcoe@upi';

  return (
    <div className="pt-28 pb-20 min-h-screen">
      {/* Back Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Departmental Events</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Event Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Poster Card */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[16/9] bg-navy-900 group">
              <img
                src={event.posterUrl || '/assets/aces-team.jpg'}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-lg bg-electric-blue/90 text-white font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md">
                  {event.category}
                </span>
                {event.isPaid ? (
                  <span className="px-3 py-1 rounded-lg bg-amber-500/90 text-navy-950 font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md">
                    PAID • {feeDisplay}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/90 text-navy-950 font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md">
                    FREE EVENT
                  </span>
                )}
                {event.isGroupEvent && (
                  <span className="px-3 py-1 rounded-lg bg-indigo-500/90 text-white font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md">
                    GROUP EVENT (MAX {event.maxGroupSize || 4})
                  </span>
                )}
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {event.title}
              </h1>
              {event.subtitle && <p className="text-lg text-electric-cyan font-medium">{event.subtitle}</p>}
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                {event.description}
              </p>
            </div>

            {/* WhatsApp Community Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-navy-900 to-navy-850 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <FaWhatsapp size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Official Event WhatsApp Group</h4>
                  <p className="text-xs text-slate-400">
                    Join for real-time announcements, schedule releases, problem statements, and Q&A.
                  </p>
                </div>
              </div>
              <a
                href={event.whatsappGroupUrl || event.whatsappLink || 'https://chat.whatsapp.com/ACES-KBTCOE-Events'}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors flex-shrink-0 shadow-lg shadow-emerald-500/20"
              >
                <span>Join Group</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Registration Fee</span>
                <span className="text-2xl font-black text-white">{feeDisplay}</span>
              </div>

              {/* Event Schedule Info */}
              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-electric-cyan flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white">Date</strong>
                    <span>{formattedDate}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-electric-cyan flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white">Timing</strong>
                    <span>{event.timeString || '10:00 AM - 4:00 PM'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-electric-cyan flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white">Venue</strong>
                    <span>{event.venue}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users size={16} className="text-electric-cyan flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white">Confirmed Participants</strong>
                    <span>{event.registeredCount || event.registrationCount || 0} registered</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Opens 3-Step Wizard with or without login */}
              <div>
                {isRegistered ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold uppercase">
                      <CheckCircle2 size={15} />
                      <span>Registered For Event</span>
                    </div>
                    {registrationData?.ticketId && (
                      <div className="text-xs font-mono font-bold text-white bg-black/40 px-2 py-1 rounded-lg">
                        Pass ID: {registrationData.ticketId}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setRegStep(3);
                        setIsModalOpen(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                    >
                      View Ticket & WhatsApp Group
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={!canRegister}
                    onClick={() => {
                      setRegStep(1);
                      setIsModalOpen(true);
                    }}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
                      canRegister
                        ? 'bg-gradient-to-r from-electric-blue to-electric-indigo text-white hover:shadow-electric-blue/40 hover:-translate-y-0.5'
                        : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {canRegister
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

      {/* ========================================================================= */}
      {/* 3-STEP EVENT REGISTRATION MODAL                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 my-8 shadow-2xl text-slate-200"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Event Registration</h3>
                  <p className="text-xs text-electric-cyan font-medium truncate max-w-xs">{event.title}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Step Progress Indicators */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs border-b border-white/10 pb-4">
                <div
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all ${
                    regStep === 1
                      ? 'bg-electric-blue text-white font-bold'
                      : regStep > 1
                      ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                      : 'text-slate-500 bg-white/5'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-black/20 text-[10px]">
                    {regStep > 1 ? '✓' : '1'}
                  </span>
                  <span className="hidden sm:inline">Information</span>
                </div>

                <div
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all ${
                    regStep === 2
                      ? 'bg-electric-blue text-white font-bold'
                      : regStep > 2
                      ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                      : 'text-slate-500 bg-white/5'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-black/20 text-[10px]">
                    {regStep > 2 ? '✓' : '2'}
                  </span>
                  <span className="hidden sm:inline">{event.isPaid ? 'Payment' : 'Confirmation'}</span>
                </div>

                <div
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all ${
                    regStep === 3
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'text-slate-500 bg-white/5'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-black/20 text-[10px]">
                    3
                  </span>
                  <span className="hidden sm:inline">Pass & Group</span>
                </div>
              </div>

              {/* Error Alert */}
              {stepError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{stepError}</span>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 1: INFORMATION COLLECTION                                            */}
              {/* ========================================================================= */}
              {regStep === 1 && (
                <form onSubmit={handleProceedToStep2} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="rahul@kbtcoe.org"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">
                        WhatsApp Contact Phone <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">College Name</label>
                      <input
                        type="text"
                        value={collegeInput}
                        onChange={(e) => setCollegeInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Department</label>
                      <select
                        value={deptInput}
                        onChange={(e) => setDeptInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
                      >
                        <option value="Computer Engineering">Computer Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="AI & Data Science">AI & Data Science</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="E&TC Engineering">E&TC Engineering</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Academic Year</label>
                      <select
                        value={yearInput}
                        onChange={(e) => setYearInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
                      >
                        <option value="FE">First Year (FE)</option>
                        <option value="SE">Second Year (SE)</option>
                        <option value="TE">Third Year (TE)</option>
                        <option value="BE">Final Year (BE)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">PRN / Roll No.</label>
                      <input
                        type="text"
                        placeholder="722XXXXX"
                        value={prnInput}
                        onChange={(e) => setPrnInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
                      />
                    </div>
                  </div>

                  {/* Group Event Configuration */}
                  {event.isGroupEvent && (
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-300 font-bold">
                          <Users size={16} />
                          <span>Group Event Registration (Team)</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Max {event.maxGroupSize || 4} members</span>
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">
                          Team / Group Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Byte Busters"
                          value={groupNameInput}
                          onChange={(e) => setGroupNameInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white focus:outline-none focus:border-indigo-400"
                        />
                      </div>

                      {/* Dynamic Group Members */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-300">Co-Participants / Members</span>
                          <button
                            type="button"
                            onClick={handleAddGroupMember}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-electric-cyan hover:text-white transition-colors"
                          >
                            <Plus size={13} />
                            <span>Add Team Member</span>
                          </button>
                        </div>

                        {groupMembers.map((member, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-navy-950/70 border border-white/10 space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                              <span>Member #{idx + 2}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveGroupMember(idx)}
                                className="text-rose-400 hover:text-rose-300"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Member Full Name"
                                value={member.name}
                                onChange={(e) => handleGroupMemberChange(idx, 'name', e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-white text-xs"
                              />
                              <input
                                type="email"
                                placeholder="Member Email"
                                value={member.email}
                                onChange={(e) => handleGroupMemberChange(idx, 'email', e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-white text-xs"
                              />
                              <input
                                type="tel"
                                placeholder="Member Phone"
                                value={member.phone}
                                onChange={(e) => handleGroupMemberChange(idx, 'phone', e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-white text-xs"
                              />
                              <input
                                type="text"
                                placeholder="PRN / Roll No"
                                value={member.prn}
                                onChange={(e) => handleGroupMemberChange(idx, 'prn', e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-white text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-semibold hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-bold shadow-lg shadow-electric-blue/30 hover:shadow-electric-blue/50"
                    >
                      <span>Proceed to Step 2 ➔</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ========================================================================= */}
              {/* STEP 2: PAYMENT SCREENSHOT UPLOAD (IF PAID) OR FREE CONFIRMATION          */}
              {/* ========================================================================= */}
              {regStep === 2 && (
                <form onSubmit={handleConfirmRegistration} className="space-y-5 text-xs">
                  {event.isPaid ? (
                    <div className="space-y-5">
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                        <div>
                          <strong className="block text-white text-sm font-bold">Event Registration Fee</strong>
                          <span>Scan QR Code or transfer via UPI to confirm seat</span>
                        </div>
                        <span className="text-2xl font-black text-amber-400">{feeDisplay}</span>
                      </div>

                      {/* UPI QR & Payment Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-4 rounded-2xl bg-navy-950 border border-white/10">
                        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl text-center">
                          <img
                            src={event.paymentQrUrl || event.upiQrCodeUrl || '/assets/aces-logo.jpeg'}
                            alt="UPI QR Code"
                            className="w-36 h-36 object-contain"
                          />
                          <span className="text-[10px] text-slate-700 font-bold mt-1">Scan & Pay {feeDisplay}</span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Official ACES UPI ID</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-sm font-bold text-white bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 select-all">
                                {upiId}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(upiId, 'upi')}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-electric-cyan transition-colors"
                                title="Copy UPI ID"
                              >
                                {copiedUpi ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-400 space-y-1">
                            <p>• Accepted apps: Google Pay, PhonePe, Paytm, BHIM</p>
                            <p>• Save payment screenshot & note 12-digit UTR reference</p>
                          </div>
                        </div>
                      </div>

                      {/* Transaction UTR Reference */}
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">
                          UPI Transaction Reference (UTR No.) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 12-digit UPI Reference Number"
                          value={utrInput}
                          onChange={(e) => setUtrInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Screenshot Upload */}
                      <div>
                        <label className="block text-slate-300 mb-1 font-semibold">
                          Upload Payment Screenshot Receipt
                        </label>
                        <div className="p-4 rounded-2xl bg-navy-950 border-2 border-dashed border-white/15 hover:border-amber-400/50 transition-colors text-center">
                          {screenshotPreview ? (
                            <div className="space-y-2">
                              <img
                                src={screenshotPreview}
                                alt="Payment Preview"
                                className="max-h-36 mx-auto rounded-xl object-contain border border-white/10"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setScreenshotFile(null);
                                  setScreenshotPreview(null);
                                }}
                                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                              >
                                Remove Screenshot
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer space-y-2 block">
                              <UploadCloud size={24} className="text-slate-400 mx-auto" />
                              <div className="text-xs text-slate-300 font-medium">Click to upload payment screenshot</div>
                              <span className="text-[10px] text-slate-500 block">PNG, JPG, WEBP up to 25MB</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleScreenshotChange}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Free Event Step 2 */
                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                        <CheckCircle2 size={24} />
                      </div>
                      <h4 className="text-base font-bold text-white">Free Departmental Workshop</h4>
                      <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                        This session is fully supported by the Department of Computer Engineering. No fee or payment receipt is required.
                      </p>
                    </div>
                  )}

                  <div className="pt-3 flex justify-between gap-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-semibold hover:bg-white/10"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-bold shadow-lg shadow-electric-blue/30 hover:shadow-electric-blue/50 flex items-center gap-2"
                    >
                      <span>{submitting ? 'Confirming...' : 'Confirm & Complete Registration ➔'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ========================================================================= */}
              {/* STEP 3: TICKET ID ASSIGNMENT & JOIN WHATSAPP GROUP                        */}
              {/* ========================================================================= */}
              {regStep === 3 && (
                <div className="space-y-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={32} />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white">Registration Confirmed!</h3>
                    <p className="text-xs text-slate-300">
                      You are officially registered for <strong className="text-white">{event.title}</strong>.
                    </p>
                  </div>

                  {/* Assigned Event Ticket ID Badge */}
                  <div className="p-5 rounded-2xl bg-navy-950 border border-electric-cyan/40 text-left space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-electric-cyan/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-electric-cyan">
                        ASSIGNED EVENT PASS ID
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                        SEAT RESERVED
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider">
                        {assignedTicketId || registrationData?.ticketId || 'ACES-CONFIRMED'}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(assignedTicketId || registrationData?.ticketId, 'ticket')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white transition-colors"
                      >
                        {copiedTicket ? (
                          <>
                            <Check size={13} className="text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy ID</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5 flex flex-wrap justify-between gap-2">
                      <span>Participant: <strong className="text-white">{nameInput || registrationData?.fullName}</strong></span>
                      <span>Venue: <strong className="text-white">{event.venue}</strong></span>
                    </div>
                  </div>

                  {/* WhatsApp Community Join Section */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-navy-950 border border-emerald-500/40 text-left space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                        <FaWhatsapp size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Join Event WhatsApp Group</h4>
                        <p className="text-[11px] text-slate-300">
                          Receive live announcements, schedule notices, setup links, and Q&A.
                        </p>
                      </div>
                    </div>

                    <a
                      href={assignedWhatsappUrl || event.whatsappGroupUrl || event.whatsappLink || 'https://chat.whatsapp.com/ACES-KBTCOE-Events'}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01]"
                    >
                      <FaWhatsapp size={16} />
                      <span>Join WhatsApp Group Now</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  {/* Done / Close Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
                    >
                      Done & Return to Event
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetailPage;
