import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  FileCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Download,
  Mail,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Image,
  Award,
  Settings,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { EventItem, MembershipApplication, ContactMessage } from '../types/index.js';

type AdminTab =
  | 'overview'
  | 'events'
  | 'applications'
  | 'attendees'
  | 'team'
  | 'gallery'
  | 'messages'
  | 'cms';

export const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalApprovedMembers: 0,
    pendingApplications: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    unreadMessages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tab-specific states
  const [events, setEvents] = useState<EventItem[]>([]);
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [teamList, setTeamList] = useState<any[]>([]);

  // Create Event Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    category: 'WORKSHOP',
    venue: 'Seminar Hall, KBTCOE',
    isOnline: false,
    startDate: '',
    timeString: '10:00 AM - 1:00 PM',
    registrationDeadline: '',
    capacity: 100,
    eligibility: 'OPEN_TO_ALL',
    status: 'PUBLISHED',
    posterUrl: '',
  });

  // Selected event for attendee inspection & CSV export
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // Load Admin Data
  const loadAllAdminData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, evRes, appRes, msgRes, teamRes] = await Promise.all([
        api.admin.getStats(),
        api.events.getAll(),
        api.applications.getAll(),
        api.contact.getAll(),
        api.team.getAll(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (evRes.success && evRes.events) {
        setEvents(evRes.events);
        if (evRes.events.length > 0 && !selectedEventId) {
          setSelectedEventId(evRes.events[0]._id);
        }
      }
      if (appRes.success && appRes.applications) setApplications(appRes.applications);
      if (msgRes.success && msgRes.messages) setMessages(msgRes.messages);
      if (teamRes.success && teamRes.team?.all) setTeamList(teamRes.team.all);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadAllAdminData();
  }, [isAuthenticated, isAdmin, navigate]);

  // Load Attendees when selectedEventId changes
  useEffect(() => {
    if (!selectedEventId) return;
    const fetchAttendees = async () => {
      try {
        setLoadingAttendees(true);
        const res = await api.registrations.getAttendees(selectedEventId);
        if (res.success && res.attendees) {
          setAttendees(res.attendees);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAttendees(false);
      }
    };
    fetchAttendees();
  }, [selectedEventId]);

  // Actions
  const handleReviewApp = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const notes = prompt(`Optional feedback note for applicant (${status}):`) || '';
    try {
      const res = await api.applications.review(id, { status, adminNotes: notes });
      if (res.success) {
        setApplications((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status, adminNotes: notes } : a))
        );
        loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Review failed');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Delete this event and remove all registrations?')) return;
    try {
      const res = await api.events.delete(id);
      if (res.success) {
        setEvents((prev) => prev.filter((e) => e._id !== id));
        loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleToggleEventStatus = async (event: EventItem) => {
    const newStatus = event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await api.events.update(event._id, { status: newStatus });
      if (res.success) {
        setEvents((prev) =>
          prev.map((e) => (e._id === event._id ? { ...e, status: newStatus } : e))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.events.create({
        ...eventForm,
        startDate: new Date(eventForm.startDate).toISOString(),
        registrationDeadline: new Date(eventForm.registrationDeadline).toISOString(),
      });
      if (res.success) {
        setIsEventModalOpen(false);
        loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create event');
    }
  };

  const handleToggleAttendance = async (regId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ATTENDED' ? 'REGISTERED' : 'ATTENDED';
    try {
      const res = await api.registrations.updateAttendance(regId, nextStatus);
      if (res.success) {
        setAttendees((prev) =>
          prev.map((a) => (a._id === regId ? { ...a, status: nextStatus } : a))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update attendance');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ADMIN CONTROL CENTER
              </span>
              <span className="text-xs text-slate-500">ACES KBTCOE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Club Administration & Operations
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllAdminData}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh DB Data</span>
            </button>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-electric-blue text-white text-xs font-semibold"
            >
              My Member Dashboard
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-white/5">
          {[
            { id: 'overview', label: 'Overview Metrics', icon: Layers },
            { id: 'events', label: 'Events & Workshops', icon: Calendar },
            { id: 'applications', label: `Membership Apps (${stats.pendingApplications})`, icon: FileCheck },
            { id: 'attendees', label: 'Registrations & Attendees', icon: Users },
            { id: 'messages', label: `Inquiries (${stats.unreadMessages})`, icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'bg-navy-850 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-5 rounded-2xl glass-card border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
                <div className="text-2xl font-black text-white mt-1">{stats.totalUsers}</div>
              </div>
              <div className="p-5 rounded-2xl glass-card border border-white/10">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Approved Members</span>
                <div className="text-2xl font-black text-emerald-300 mt-1">{stats.totalApprovedMembers}</div>
              </div>
              <div className="p-5 rounded-2xl glass-card border border-white/10">
                <span className="text-[10px] uppercase font-bold text-amber-400">Pending Apps</span>
                <div className="text-2xl font-black text-amber-300 mt-1">{stats.pendingApplications}</div>
              </div>
              <div className="p-5 rounded-2xl glass-card border border-white/10">
                <span className="text-[10px] uppercase font-bold text-electric-cyan">Active Events</span>
                <div className="text-2xl font-black text-white mt-1">{stats.activeEvents}</div>
              </div>
              <div className="p-5 rounded-2xl glass-card border border-white/10">
                <span className="text-[10px] uppercase font-bold text-indigo-400">Registrations</span>
                <div className="text-2xl font-black text-indigo-300 mt-1">{stats.totalRegistrations}</div>
              </div>
              <div className="p-5 rounded-2xl glass-card border border-white/10">
                <span className="text-[10px] uppercase font-bold text-rose-400">Unread Messages</span>
                <div className="text-2xl font-black text-rose-300 mt-1">{stats.unreadMessages}</div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 rounded-3xl bg-navy-850 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setActiveTab('events');
                  setIsEventModalOpen(true);
                }}
                className="p-4 rounded-2xl bg-electric-blue/15 border border-electric-blue/30 text-left hover:bg-electric-blue/25 transition-colors group"
              >
                <div className="text-electric-cyan font-bold text-xs flex items-center justify-between">
                  <span>+ Add New Event</span>
                  <Plus size={16} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Publish a workshop or hackathon</p>
              </button>

              <button
                onClick={() => setActiveTab('applications')}
                className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-left hover:bg-amber-500/25 transition-colors group"
              >
                <div className="text-amber-300 font-bold text-xs flex items-center justify-between">
                  <span>Review Membership Applications</span>
                  <FileCheck size={16} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{stats.pendingApplications} student submissions pending</p>
              </button>

              <button
                onClick={() => setActiveTab('attendees')}
                className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-left hover:bg-indigo-500/25 transition-colors group"
              >
                <div className="text-indigo-300 font-bold text-xs flex items-center justify-between">
                  <span>Export Event Attendees</span>
                  <Download size={16} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Download CSV records of registered students</p>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: EVENTS MANAGEMENT */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Departmental Events ({events.length})</h2>
              <button
                onClick={() => setIsEventModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold shadow-lg"
              >
                <Plus size={15} />
                <span>Create New Event</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-navy-850">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Title / Category</th>
                    <th className="py-3 px-4">Event Date</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.map((e) => (
                    <tr key={e._id} className="hover:bg-white/5">
                      <td className="py-3.5 px-4">
                        <strong className="text-white block">{e.title}</strong>
                        <span className="text-[10px] text-electric-cyan uppercase font-semibold">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {new Date(e.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 truncate max-w-[150px]">{e.venue}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {e.registeredCount || 0} / {e.capacity || '∞'}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleEventStatus(e)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                            e.status === 'PUBLISHED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {e.status} (Click to toggle)
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          to={`/events/${e.slug}`}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteEvent(e._id)}
                          className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MEMBERSHIP APPLICATION MANAGEMENT */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">
              Membership Review Queue ({applications.length})
            </h2>

            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 glass-card rounded-2xl">
                  No membership applications submitted yet.
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app._id}
                    className="p-6 rounded-2xl bg-navy-850 border border-white/10 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-white">{app.fullName}</h4>
                        <p className="text-xs text-slate-400">
                          {app.email} • {app.department} ({app.academicYear})
                          {app.prnOrRoll ? ` • PRN: ${app.prnOrRoll}` : ''}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                          app.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-2">
                      <div>
                        <strong className="text-slate-400 block mb-1">Areas of Interest:</strong>
                        <div className="flex flex-wrap gap-1.5">
                          {app.areasOfInterest?.map((interest) => (
                            <span
                              key={interest}
                              className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[11px]"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <strong className="text-slate-400 block mb-0.5">Motivation:</strong>
                        <p className="text-slate-300 italic bg-navy-950 p-3 rounded-xl border border-white/5">
                          "{app.reasonForJoining}"
                        </p>
                      </div>
                    </div>

                    {app.status === 'PENDING' && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleReviewApp(app._id, 'APPROVED')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          <CheckCircle2 size={14} />
                          <span>Approve Membership</span>
                        </button>
                        <button
                          onClick={() => handleReviewApp(app._id, 'REJECTED')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: EVENT ATTENDEES & CSV EXPORT */}
        {activeTab === 'attendees' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Event Attendees & CSV Export</h2>
                <p className="text-xs text-slate-400">Select an event to view registered students.</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-navy-850 border border-white/10 text-xs text-white"
                >
                  {events.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.title}
                    </option>
                  ))}
                </select>

                {selectedEventId && (
                  <a
                    href={api.registrations.getExportUrl(selectedEventId)}
                    download
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    <Download size={14} />
                    <span>Download CSV</span>
                  </a>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-navy-850">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Department / Year</th>
                    <th className="py-3 px-4">Registration Date</th>
                    <th className="py-3 px-4">Attendance Status</th>
                    <th className="py-3 px-4 text-right">Toggle Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {attendees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No registrations recorded for this event yet.
                      </td>
                    </tr>
                  ) : (
                    attendees.map((a) => (
                      <tr key={a._id} className="hover:bg-white/5">
                        <td className="py-3 px-4 font-semibold text-white">{a.fullName}</td>
                        <td className="py-3 px-4">{a.email}</td>
                        <td className="py-3 px-4">
                          {a.department} ({a.academicYear})
                        </td>
                        <td className="py-3 px-4">
                          {new Date(a.registrationDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              a.status === 'ATTENDED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleAttendance(a._id, a.status)}
                            className="px-2.5 py-1 rounded bg-white/10 text-xs font-medium text-slate-200 hover:bg-white/20"
                          >
                            Mark {a.status === 'ATTENDED' ? 'Absent' : 'Present'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: INCOMING MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Contact Inquiries ({messages.length})</h2>

            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 glass-card rounded-2xl">
                  No contact messages received.
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m._id}
                    className={`p-6 rounded-2xl border transition-all ${
                      m.isRead ? 'bg-navy-850/60 border-white/5' : 'bg-navy-850 border-electric-cyan/30'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{m.name}</strong>
                        <span className="text-slate-400">&lt;{m.email}&gt;</span>
                      </div>
                      <span className="text-slate-500">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-electric-cyan block">{m.subject}</span>
                      <p className="text-slate-300 leading-relaxed">{m.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* CREATE EVENT MODAL */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-navy-850 border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Create New Departmental Event</h3>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DEVMIRROR HACKATHON"
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        title: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="devmirror-hackathon"
                    value={eventForm.slug}
                    onChange={(e) => setEventForm({ ...eventForm, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. 24-Hour Departmental Product Sprint"
                  value={eventForm.subtitle}
                  onChange={(e) => setEventForm({ ...eventForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed description of the workshop or competition..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                  >
                    <option value="FLAGSHIP">Flagship</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="CODING">Coding / DSA</option>
                    <option value="DEVELOPMENT">Development</option>
                    <option value="CHALLENGE">Challenge</option>
                    <option value="COMMUNITY">Community</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Venue</label>
                  <input
                    type="text"
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Capacity (Seats)</label>
                  <input
                    type="number"
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({ ...eventForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Registration Deadline *</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventForm.registrationDeadline}
                    onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-electric-blue text-white font-bold"
                >
                  Save & Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
