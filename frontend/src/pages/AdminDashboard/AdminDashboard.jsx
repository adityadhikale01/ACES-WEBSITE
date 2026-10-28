import React, { useState, useEffect } from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  CreditCard,
  Image,
  Award,
  FileText,
  Mail,
  Shield,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  Upload,
  Globe,
  Settings,
  AlertCircle,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth.js';
import { api } from '../../services/api.js';

export function AdminDashboard() {
  const { isSuperAdmin, isFaculty, isPresident } = useAuth();
  const loaderData = useLoaderData();

  // Active Tab
  const [activeTab, setActiveTab] = useState(() => {
    if (isFaculty) return 'activities';
    return 'overview';
  });

  // State collections
  const [stats, setStats] = useState(loaderData?.stats || {});
  const [events, setEvents] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [galleryAlbums, setGalleryAlbums] = useState([]);
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [branding, setBranding] = useState({
    clubName: 'ACES KBTCOE',
    fullName: "Association of Computer Engineering Students'",
    tagline: 'Where Ideas Meet Innovation.',
    logoUrl: '/assets/aces-logo.jpeg',
    groupPhotoUrl: '/assets/aces-team.jpg',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modals
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'WORKSHOP',
    eventDate: new Date().toISOString().slice(0, 10),
    venue: 'Dept. of Computer Engineering, MVPS KBTCOE Nashik',
    isPaid: false,
    feeAmountInPaise: 0,
    upiId: 'aces.kbtcoe@upi',
  });

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    designation: '',
    category: 'COMMITTEE',
    photoUrl: '/assets/team/uday-dhikale.jpg',
    email: '',
    linkedin: '',
    github: '',
    bio: '',
  });

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityFormData, setActivityFormData] = useState({
    title: '',
    type: 'ACTIVITY',
    category: 'EXPERT_TALK',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    impactSummary: '',
  });

  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [albumFormData, setAlbumFormData] = useState({
    title: '',
    description: '',
    eventDate: new Date().toISOString().slice(0, 10),
    coverMediaUrl: '/assets/aces-team.jpg',
  });

  // Fetch data on tab change
  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab]);

  const fetchTabData = async (tab) => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'overview') {
        const res = await api.admin.getStats();
        setStats(res.stats || {});
      } else if (tab === 'events') {
        const res = await api.events.getAll('status=ALL');
        setEvents(res.events || []);
      } else if (tab === 'payments') {
        const res = await api.payments.getAllAdmin('ALL');
        setPendingPayments(res.payments || []);
      } else if (tab === 'team') {
        const [teamRes, desRes] = await Promise.all([
          api.team.getAll(),
          api.team.getDesignations(),
        ]);
        setTeamMembers(teamRes.members || []);
        setDesignations(desRes.designations || []);
      } else if (tab === 'activities') {
        const res = await api.activities.getAll();
        setActivities(res.items || []);
      } else if (tab === 'gallery') {
        const res = await api.gallery.getAlbums();
        setGalleryAlbums(res.albums || []);
      } else if (tab === 'applications') {
        const res = await api.membership.getAll('ALL');
        setApplications(res.applications || []);
      } else if (tab === 'messages') {
        const res = await api.contact.getAll();
        setMessages(res.messages || []);
      } else if (tab === 'content') {
        const res = await api.content.get('branding');
        if (res.data) setBranding(res.data);
      } else if (tab === 'users') {
        const res = await api.admin.getUsers();
        setAllUsers(res.users || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load section data');
    } finally {
      setLoading(false);
    }
  };

  // 1. Group Photo & Logo Upload in CMS
  const handleUploadBrandingImage = async (type, file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.content.uploadImage(formData);
      const uploadedUrl = res.imageUrl || res.url;

      const updated = {
        ...branding,
        [type === 'logo' ? 'logoUrl' : 'groupPhotoUrl']: uploadedUrl,
      };
      setBranding(updated);
      await api.content.update('branding', updated);
      setMessage(`Updated ${type === 'logo' ? 'Club Logo' : 'Group Photo'} successfully!`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Image upload failed');
    }
  };

  // 2. Team Member Photo Upload
  const handleUploadMemberPhoto = async (file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.team.uploadPhoto(formData);
      setMemberFormData((prev) => ({
        ...prev,
        photoUrl: res.photoUrl || res.url,
      }));
      setMessage('Member photo uploaded!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Photo upload failed');
    }
  };

  // Save Event
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.events.update(editingEvent._id, eventFormData);
      } else {
        await api.events.create(eventFormData);
      }
      setShowEventModal(false);
      setEditingEvent(null);
      fetchTabData('events');
      setMessage('Event saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save event');
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.events.delete(id);
      fetchTabData('events');
    } catch (err) {
      setError(err.message);
    }
  };

  // Save Team Member
  const handleSaveMember = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await api.team.update(editingMember._id, memberFormData);
      } else {
        await api.team.create(memberFormData);
      }
      setShowTeamModal(false);
      setEditingMember(null);
      fetchTabData('team');
      setMessage('Team member saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save member');
    }
  };

  // Delete Team Member
  const handleDeleteMember = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      await api.team.delete(id);
      fetchTabData('team');
    } catch (err) {
      setError(err.message);
    }
  };

  // Save Activity
  const handleSaveActivity = async (e) => {
    e.preventDefault();
    try {
      if (editingActivity) {
        await api.activities.update(editingActivity._id, activityFormData);
      } else {
        await api.activities.create(activityFormData);
      }
      setShowActivityModal(false);
      setEditingActivity(null);
      fetchTabData('activities');
      setMessage('Activity saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Verify Payment
  const handleVerifyPayment = async (id, status) => {
    try {
      await api.payments.verify(id, { status });
      fetchTabData('payments');
      setMessage(`Payment marked as ${status}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Review Application
  const handleReviewApplication = async (id, status) => {
    try {
      await api.membership.review(id, { status });
      fetchTabData('applications');
      setMessage(`Application marked as ${status}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Update User Role (Superadmin only)
  const handleUpdateRole = async (userId, role) => {
    try {
      await api.admin.updateUserRole(userId, role);
      fetchTabData('users');
      setMessage('Role updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Define tabs based on role permissions
  const tabs = [];

  // Superadmin & President have access to Overview
  if (isSuperAdmin || isPresident || isFaculty) {
    tabs.push({ id: 'overview', name: 'Overview', icon: Globe });
  }

  // Superadmin & President have access to Events & Payments
  if (isSuperAdmin || isPresident) {
    tabs.push({ id: 'events', name: 'Events', icon: Calendar });
    tabs.push({ id: 'payments', name: 'Payments', icon: CreditCard });
    tabs.push({ id: 'team', name: 'Team Management', icon: Users });
    tabs.push({ id: 'gallery', name: 'Gallery', icon: Image });
    tabs.push({ id: 'applications', name: 'Membership', icon: FileText });
    tabs.push({ id: 'messages', name: 'Messages', icon: Mail });
  }

  // Faculty and Superadmin have access to Activities & Achievements
  if (isSuperAdmin || isFaculty) {
    tabs.push({ id: 'activities', name: 'Activities & Achievements', icon: Award });
  }

  // Only Superadmin has Website Content and Member Role Management
  if (isSuperAdmin) {
    tabs.push({ id: 'content', name: 'Website Content', icon: Settings });
    tabs.push({ id: 'users', name: 'Member Roles', icon: Shield });
  }

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-electric-blue/20 text-electric-cyan text-[10px] font-bold uppercase tracking-wider">
                {isSuperAdmin ? 'SUPERADMIN CONSOLE' : isFaculty ? 'FACULTY PORTAL' : 'PRESIDENT DASHBOARD'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              ACES Management System
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              View Public Website
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-electric-blue text-white shadow-lg shadow-electric-blue/20'
                    : 'bg-navy-850 text-slate-400 hover:text-white hover:bg-navy-800 border border-slate-800'
                }`}
              >
                <Icon size={14} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-navy-850 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Events</div>
                <div className="text-3xl font-black text-white">{stats.totalEvents || 0}</div>
              </div>
              <div className="p-6 rounded-2xl bg-navy-850 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registrations</div>
                <div className="text-3xl font-black text-electric-cyan">{stats.totalRegistrations || 0}</div>
              </div>
              <div className="p-6 rounded-2xl bg-navy-850 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Payments</div>
                <div className="text-3xl font-black text-amber-400">{stats.pendingPayments || 0}</div>
              </div>
              <div className="p-6 rounded-2xl bg-navy-850 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Applications</div>
                <div className="text-3xl font-black text-indigo-400">{stats.pendingApplications || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Departmental Events</h2>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setEventFormData({
                    title: '',
                    shortDescription: '',
                    description: '',
                    category: 'WORKSHOP',
                    eventDate: new Date().toISOString().slice(0, 10),
                    venue: 'Dept. of Computer Engineering, MVPS KBTCOE Nashik',
                    isPaid: false,
                    feeAmountInPaise: 0,
                    upiId: 'aces.kbtcoe@upi',
                  });
                  setShowEventModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric-blue hover:bg-blue-600 text-white text-xs font-bold transition-colors"
              >
                <Plus size={14} />
                <span>Create Event</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-navy-850">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Fee</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {events.map((e) => (
                    <tr key={e._id} className="hover:bg-white/5">
                      <td className="p-4 font-semibold text-white">{e.title}</td>
                      <td className="p-4">{e.category}</td>
                      <td className="p-4">{new Date(e.eventDate).toLocaleDateString()}</td>
                      <td className="p-4">{e.isPaid ? `₹${e.feeAmountInPaise / 100}` : 'Free'}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          {e.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingEvent(e);
                            setEventFormData({
                              title: e.title,
                              shortDescription: e.shortDescription,
                              description: e.description,
                              category: e.category,
                              eventDate: new Date(e.eventDate).toISOString().slice(0, 10),
                              venue: e.venue,
                              isPaid: e.isPaid,
                              feeAmountInPaise: e.feeAmountInPaise,
                              upiId: e.upiId || 'aces.kbtcoe@upi',
                            });
                            setShowEventModal(true);
                          }}
                          className="p-1.5 hover:text-white"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteEvent(e._id)} className="p-1.5 hover:text-rose-400">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Payment Proof Verification Queue</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-navy-850">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Event</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">UTR Reference</th>
                    <th className="p-4">Proof Receipt</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {pendingPayments.map((p) => (
                    <tr key={p._id} className="hover:bg-white/5">
                      <td className="p-4 font-semibold text-white">
                        {p.userId?.name || 'Student'} <br />
                        <span className="text-[10px] text-slate-400">{p.userId?.email}</span>
                      </td>
                      <td className="p-4">{p.eventId?.title}</td>
                      <td className="p-4 font-mono font-bold text-white">₹{(p.amountInPaise / 100).toFixed(0)}</td>
                      <td className="p-4 font-mono">{p.utrNumber}</td>
                      <td className="p-4">
                        <a
                          href={api.payments.getScreenshotUrl(p._id)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-electric-cyan hover:underline"
                        >
                          <Eye size={13} /> View Receipt
                        </a>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : p.verificationStatus === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {p.verificationStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {p.verificationStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleVerifyPayment(p._id, 'VERIFIED')}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/30"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerifyPayment(p._id, 'REJECTED')}
                              className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 font-bold hover:bg-rose-500/30"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TEAM MANAGEMENT */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Committee Members</h2>
              <button
                onClick={() => {
                  setEditingMember(null);
                  setMemberFormData({
                    name: '',
                    designation: designations[0]?.title || 'Committee Member',
                    category: 'COMMITTEE',
                    photoUrl: '/assets/team/uday-dhikale.jpg',
                    email: '',
                    linkedin: '',
                    github: '',
                    bio: '',
                  });
                  setShowTeamModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric-blue hover:bg-blue-600 text-white text-xs font-bold transition-colors"
              >
                <Plus size={14} />
                <span>Add Member</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {teamMembers.map((m) => (
                <div key={m._id} className="p-4 rounded-2xl bg-navy-850 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.photoUrl || '/assets/team/uday-dhikale.jpg'}
                      alt={m.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-white text-xs">{m.name}</h3>
                      <p className="text-[11px] text-electric-cyan">{m.designation}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setEditingMember(m);
                        setMemberFormData({
                          name: m.name,
                          designation: m.designation,
                          category: m.category,
                          photoUrl: m.photoUrl,
                          email: m.email || '',
                          linkedin: m.linkedin || '',
                          github: m.github || '',
                          bio: m.bio || '',
                        });
                        setShowTeamModal(true);
                      }}
                      className="p-1 hover:text-white"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDeleteMember(m._id)} className="p-1 hover:text-rose-400">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: WEBSITE CONTENT (CMS - Superadmin only) */}
        {activeTab === 'content' && (
          <div className="space-y-8">
            <h2 className="text-lg font-bold text-white">Website Branding & Media Control</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Group Photo Control */}
              <div className="p-6 rounded-3xl bg-navy-850 border border-slate-800 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Official Committee Group Photograph</h3>
                  <p className="text-xs text-slate-400">
                    Syncs automatically across the Hero section, homepage preview, and the Team page.
                  </p>
                </div>

                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-navy-900 border border-white/10">
                  <img
                    src={branding.groupPhotoUrl}
                    alt="Committee Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Upload New Group Photo:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadBrandingImage('group', e.target.files?.[0])}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-electric-blue file:text-white hover:file:bg-blue-600"
                  />
                </div>
              </div>

              {/* Logo Control */}
              <div className="p-6 rounded-3xl bg-navy-850 border border-slate-800 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Official ACES Logo</h3>
                  <p className="text-xs text-slate-400">
                    Displays on the navbar header, footer, and institutional cards.
                  </p>
                </div>

                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-navy-900 border border-white/10 mx-auto">
                  <img
                    src={branding.logoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Upload New Club Logo:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadBrandingImage('logo', e.target.files?.[0])}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-electric-blue file:text-white hover:file:bg-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ACTIVITIES & ACHIEVEMENTS */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Department Activities & Achievements</h2>
              <button
                onClick={() => {
                  setEditingActivity(null);
                  setActivityFormData({
                    title: '',
                    type: 'ACTIVITY',
                    category: 'EXPERT_TALK',
                    date: new Date().toISOString().slice(0, 10),
                    description: '',
                    impactSummary: '',
                  });
                  setShowActivityModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric-blue hover:bg-blue-600 text-white text-xs font-bold transition-colors"
              >
                <Plus size={14} />
                <span>Add Record</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.map((act) => (
                <div key={act._id} className="p-5 rounded-2xl bg-navy-850 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-electric-blue/10 text-electric-cyan text-[10px] font-bold">
                      {act.type}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(act.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm">{act.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{act.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: MEMBER ROLES (Superadmin only) */}
        {activeTab === 'users' && isSuperAdmin && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">System Security & Role Assignment</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-navy-850">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Current Role</th>
                    <th className="p-4">Assign Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {allUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-white/5">
                      <td className="p-4 font-semibold text-white">{u.name}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                          className="bg-navy-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                        >
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          <option value="FACULTY">FACULTY</option>
                          <option value="PRESIDENT">PRESIDENT</option>
                          <option value="MEMBER">MEMBER</option>
                          <option value="VISITOR">VISITOR</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Team Member Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-850 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingMember ? 'Edit Committee Member' : 'Add Committee Member'}
            </h3>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300">Member Name *</label>
                <input
                  type="text"
                  required
                  value={memberFormData.name}
                  onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Designation *</label>
                <select
                  value={memberFormData.designation}
                  onChange={(e) => setMemberFormData({ ...memberFormData, designation: e.target.value })}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {designations.map((d) => (
                    <option key={d._id} value={d.title}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Member Portrait Photo</label>
                <div className="flex items-center gap-3">
                  <img
                    src={memberFormData.photoUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover bg-navy-900"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadMemberPhoto(e.target.files?.[0])}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-white/10 file:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-electric-blue text-white font-bold"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-850 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Add Activity / Achievement</h3>

            <form onSubmit={handleSaveActivity} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300">Title *</label>
                <input
                  type="text"
                  required
                  value={activityFormData.title}
                  onChange={(e) => setActivityFormData({ ...activityFormData, title: e.target.value })}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">Type</label>
                  <select
                    value={activityFormData.type}
                    onChange={(e) => setActivityFormData({ ...activityFormData, type: e.target.value })}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="ACTIVITY">Department Activity</option>
                    <option value="ACHIEVEMENT">Student Achievement</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300">Date</label>
                  <input
                    type="date"
                    value={activityFormData.date}
                    onChange={(e) => setActivityFormData({ ...activityFormData, date: e.target.value })}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={activityFormData.description}
                  onChange={(e) => setActivityFormData({ ...activityFormData, description: e.target.value })}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-electric-blue text-white font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-850 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingEvent ? 'Edit Event' : 'Create Departmental Event'}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300">Title *</label>
                <input
                  type="text"
                  required
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Short Summary *</label>
                <input
                  type="text"
                  required
                  value={eventFormData.shortDescription}
                  onChange={(e) => setEventFormData({ ...eventFormData, shortDescription: e.target.value })}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">Category</label>
                  <select
                    value={eventFormData.category}
                    onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="WORKSHOP">Workshop</option>
                    <option value="SEMINAR">Seminar</option>
                    <option value="COMPETITION">Competition</option>
                    <option value="HACKATHON">Hackathon</option>
                    <option value="EXPERT_TALK">Expert Talk</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">Date</label>
                  <input
                    type="date"
                    value={eventFormData.eventDate}
                    onChange={(e) => setEventFormData({ ...eventFormData, eventDate: e.target.value })}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-white font-medium">
                  <input
                    type="checkbox"
                    checked={eventFormData.isPaid}
                    onChange={(e) => setEventFormData({ ...eventFormData, isPaid: e.target.checked })}
                    className="rounded text-electric-blue"
                  />
                  <span>Paid Event</span>
                </label>
                {eventFormData.isPaid && (
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Fee in Rupees (e.g. 150)"
                      value={eventFormData.feeAmountInPaise ? eventFormData.feeAmountInPaise / 100 : ''}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          feeAmountInPaise: Math.round(Number(e.target.value) * 100),
                        })
                      }
                      className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Full Description *</label>
                <textarea
                  required
                  rows={4}
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-electric-blue text-white font-bold"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
