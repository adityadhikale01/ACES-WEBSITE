import React, { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, CheckCircle, AlertCircle, ArrowLeft, Upload } from 'lucide-react';
import { useAuth } from '../../auth/useAuth.js';
import { api } from '../../services/api.js';

export function EventDetailPage() {
  const { event } = useLoaderData();
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [payerUpiId, setPayerUpiId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/events/${event.slug}`);
      return;
    }

    setRegistering(true);
    setError('');

    try {
      const res = await api.registrations.register({
        eventId: event._id,
        name: currentUser.name,
        email: currentUser.email,
        department: currentUser.department || 'Computer Engineering',
        academicYear: currentUser.academicYear || '',
        prn: currentUser.prn || '',
        phone: currentUser.phone || '',
      });

      setRegistered(true);
      setRegistrationId(res.registration?._id);

      if (event.isPaid) {
        setShowPaymentModal(true);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!utrNumber) {
      setError('Please provide the transaction UTR number.');
      return;
    }

    setSubmittingProof(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('registrationId', registrationId);
      formData.append('utrNumber', utrNumber);
      if (payerUpiId) formData.append('payerUpiId', payerUpiId);
      if (receiptFile) formData.append('receipt', receiptFile);

      await api.payments.submitProof(formData);
      setPaymentSuccess(true);
      setShowPaymentModal(false);
    } catch (err) {
      setError(err.message || 'Payment proof submission failed.');
    } finally {
      setSubmittingProof(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        {/* Hero Card */}
        <div className="rounded-3xl overflow-hidden bg-navy-850 border border-slate-800">
          <div className="relative aspect-video sm:aspect-[21/9] bg-navy-900 overflow-hidden">
            <img
              src={event.posterUrl || '/assets/aces-team.jpg'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-navy-950/80 backdrop-blur-md text-xs font-bold text-electric-cyan border border-white/10 uppercase">
              {event.category}
            </div>
            {event.isPaid && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-amber-500 text-navy-950 text-xs font-black uppercase">
                ₹{(event.feeAmountInPaise / 100).toFixed(0)} ENTRY FEE
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-electric-cyan" />
                <div>
                  <div className="text-slate-400">Date & Time</div>
                  <div className="font-semibold text-white">
                    {new Date(event.eventDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-electric-cyan" />
                <div>
                  <div className="text-slate-400">Location</div>
                  <div className="font-semibold text-white truncate max-w-[150px]">{event.venue}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users size={18} className="text-electric-cyan" />
                <div>
                  <div className="text-slate-400">Registration</div>
                  <div className="font-semibold text-white">{event.registrationCount || 0} Registered</div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {registered && !event.isPaid && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle size={16} />
                <span>You are successfully registered for this event!</span>
              </div>
            )}

            {paymentSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Payment proof submitted! Verification is pending by ACES coordinators.</span>
              </div>
            )}

            {!registered && (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-bold text-xs uppercase tracking-wider hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-electric-blue/20"
              >
                {registering ? 'Processing...' : event.isPaid ? 'Proceed to Register & Pay' : 'Register Now (Free)'}
              </button>
            )}

            {registered && event.isPaid && !paymentSuccess && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-black text-xs uppercase tracking-wider transition-all"
              >
                Submit Payment UTR & Screenshot
              </button>
            )}

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                About the Event
              </h2>
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Proof Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-navy-850 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Submit Payment Proof</h3>
                <p className="text-xs text-slate-400">
                  Pay ₹{(event.feeAmountInPaise / 100).toFixed(0)} to UPI ID:{' '}
                  <strong className="text-white">{event.upiId || 'aces.kbtcoe@upi'}</strong> and submit reference.
                </p>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">UTR / Transaction Reference *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 423589123456"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electric-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Your UPI ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. student@okhdfcbank"
                    value={payerUpiId}
                    onChange={(e) => setPayerUpiId(e.target.value)}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electric-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Payment Screenshot (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    className="w-full text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProof}
                    className="flex-1 py-2.5 rounded-xl bg-electric-blue hover:bg-blue-600 text-white font-bold"
                  >
                    {submittingProof ? 'Submitting...' : 'Confirm Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetailPage;
