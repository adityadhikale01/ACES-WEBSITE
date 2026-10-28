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
  Image as ImageIcon,
  Award,
  Settings as SettingsIcon,
  Layers,
  ChevronRight,
  ExternalLink,
  CreditCard,
  Eye,
  AlertTriangle,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Camera,
  Video,
  UploadCloud,
  Edit3,
  Briefcase,
  Globe,
  Sliders,
  Shield,
  Upload,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import {
  EventItem,
  MembershipApplication,
  ContactMessage,
  PaymentSubmission,
  Designation,
  TeamMember,
  EventGalleryAlbum,
  ActivityItem,
  UserRole,
} from '../types/index.js';

type AdminTab =
  | 'overview'
  | 'events'
  | 'registrations'
  | 'payments'
  | 'team'
  | 'gallery'
  | 'activities'
  | 'applications'
  | 'members'
  | 'cms'
  | 'messages'
  | 'settings';

export const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, isFaculty, isPresident } = useAuth();
  const navigate = useNavigate();

  const userRole = (user?.role || 'MEMBER') as UserRole;

  // Determine accessible tabs based on Role-Based Access Control (RBAC)
  // Superadmin: Complete website control
  // Faculty: Departmental activities & student achievements
  // President: Team members, messages, new member applications, add/remove events and registration details
  const allTabDefinitions: {
    id: AdminTab;
    label: string;
    icon: any;
    badgeKey?: string;
    roles: string[];
  }[] = [
    {
      id: 'overview',
      label: '1. Overview',
      icon: Layers,
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'PRESIDENT'],
    },
    {
      id: 'events',
      label: '2. Events',
      icon: Calendar,
      badgeKey: 'events',
      roles: ['SUPER_ADMIN', 'ADMIN', 'PRESIDENT'],
    },
    {
      id: 'registrations',
      label: '3. Registrations',
      icon: Users,
      badgeKey: 'registrations',
      roles: ['SUPER_ADMIN', 'ADMIN', 'PRESIDENT'],
    },
    {
      id: 'payments',
      label: '4. Payment Verification',
      icon: CreditCard,
      badgeKey: 'pendingPayments',
      roles: ['SUPER_ADMIN', 'ADMIN', 'PRESIDENT'],
    },
    {
      id: 'team',
      label: '5. Team Management',
      icon: Briefcase,
      badgeKey: 'team',
      roles: ['SUPER_ADMIN', 'ADMIN', 'PRESIDENT'],
    },
    {
      id: 'gallery',
      label: '6. Event Gallery',
      icon: ImageIcon,
      badgeKey: 'albums',
      roles: ['SUPER_ADMIN', 'ADMIN', 'PRESIDENT'],
    },
    {
      id: 'activities',
      label: '7. Activities & Achievements',
      icon: Award,
      badgeKey: 'activities',
      roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY'],
    },
    {
      id: 'applications',
      label: '8. Membership Apps',
      icon: FileCheck,
      badgeKey: 'pendingApplications',
      roles: ['SUPER_ADMIN', 'ADMIN', 'PRESIDENT'],
    },
    {
      id: 'members',
      label: '9. Members & Roles',
      icon: Users,
      badgeKey: 'users',
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      id: 'cms',
      label: '10. Website Content & Photos',
      icon: Globe,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      id: 'messages',
      label: '11. Messages',
      icon: Mail,
      badgeKey: 'messages',
      roles: ['SUPER_ADMIN', 'ADMIN', 'PRESIDENT'],
    },
    {
      id: 'settings',
      label: '12. Settings',
      icon: SettingsIcon,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
  ];

  const accessibleTabs = allTabDefinitions.filter((tab) =>
    tab.roles.includes(userRole)
  );

  const [activeTab, setActiveTab] = useState<AdminTab>(
    isFaculty ? 'activities' : 'overview'
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalApprovedMembers: 0,
    pendingApplications: 0,
    totalEvents: 0,
    activeEvents: 0,
    upcomingEvents: 0,
    totalRegistrations: 0,
    pendingPayments: 0,
    confirmedPaid: 0,
    unreadMessages: 0,
    totalAlbums: 0,
  });

  // Data lists
  const [events, setEvents] = useState<EventItem[]>([]);
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [teamList, setTeamList] = useState<TeamMember[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [albums, setAlbums] = useState<EventGalleryAlbum[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  // Registrations inspection
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // Payment review modal
  const [inspectingPayment, setInspectingPayment] = useState<PaymentSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [paymentActionLoading, setPaymentActionLoading] = useState(false);

  // Event modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    category: 'WORKSHOP',
    venue: 'Seminar Hall, KBTCOE',
    isOnline: false,
    startDate: '',
    endDate: '',
    timeString: '10:00 AM - 1:00 PM',
    registrationDeadline: '',
    capacity: 100,
    eligibility: 'OPEN_TO_ALL',
    status: 'PUBLISHED',
    posterUrl: '',
    isFeatured: false,
    isPaid: false,
    feeInRupees: 0,
    paymentUpiId: 'aceskbtcoe@okaxis',
    paymentInstructions: 'Pay via UPI and enter transaction UTR.',
    refundPolicy: 'Non-refundable once confirmed.',
  });

  // Team member modal with Photo Upload
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberPhotoFile, setMemberPhotoFile] = useState<File | null>(null);
  const [uploadingMemberPhoto, setUploadingMemberPhoto] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: '',
    designationId: '',
    role: '',
    tier: 'COMMITTEE',
    department: 'Computer Engineering',
    academicYear: 'SE',
    bio: '',
    photoUrl: '/assets/members/President.jpeg',
    linkedinUrl: '',
    githubUrl: '',
    displayOrder: 10,
    isPublished: true,
  });

  // Designation modal
  const [isDesgModalOpen, setIsDesgModalOpen] = useState(false);
  const [desgForm, setDesgForm] = useState({
    title: '',
    tier: 'COMMITTEE',
    displayOrder: 10,
    description: '',
  });

  // Gallery album modal
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [albumForm, setAlbumForm] = useState({
    title: '',
    description: '',
    eventDate: new Date().toISOString().split('T')[0],
    academicYear: '2026-27',
    category: 'FLAGSHIP',
    coverImageUrl: '',
    isPublished: true,
  });

  // Album media upload
  const [uploadingAlbumId, setUploadingAlbumId] = useState<string | null>(null);
  const [uploadMediaCaption, setUploadMediaCaption] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Activities & Achievements Modal
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [activityForm, setActivityForm] = useState({
    title: '',
    type: 'ACTIVITY',
    description: '',
    date: new Date().toISOString().split('T')[0],
    tags: 'Department, Workshop',
    imageUrl: '',
    featured: false,
  });

  // Website Content (CMS) & Photo Uploads
  const [branding, setBranding] = useState({
    groupPhotoUrl: '/assets/aces-team.jpg',
    logoUrl: '/assets/aces-logo.jpeg',
    heroBannerUrl: '',
    headline: 'Where Ideas Meet Innovation.',
    subtitle:
      'Discover departmental activities, technical workshops, learning sessions, and the people who make ACES KBTCOE happen.',
    contactEmail: 'aces.kbtcoe@gmail.com',
    contactPhone: '+91 253 2571439',
    campusLocation: 'Department of Computer Engineering, NDMVP KBTCOE, Nashik - 422013',
  });
  const [groupPhotoFile, setGroupPhotoFile] = useState<File | null>(null);
  const [uploadingGroupPhoto, setUploadingGroupPhoto] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);

  // Search and filter controls
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [memberSearch, setMemberSearch] = useState('');

  // Load all admin data safely based on permissions
  const loadAllAdminData = async () => {
    try {
      setRefreshing(true);
      const isFacOnly = userRole === 'FACULTY';
      const isPres = userRole === 'PRESIDENT';
      const isSuper = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

      const [
        statsRes,
        evRes,
        appRes,
        msgRes,
        teamRes,
        desgRes,
        payRes,
        albRes,
        actRes,
        userRes,
        brandRes,
      ] = await Promise.all([
        api.admin.getStats().catch(() => ({ success: false })),
        !isFacOnly ? api.events.getAll().catch(() => ({ success: false })) : Promise.resolve({ success: false }),
        !isFacOnly ? api.applications.getAll().catch(() => ({ success: false })) : Promise.resolve({ success: false }),
        !isFacOnly ? api.contact.getAll().catch(() => ({ success: false })) : Promise.resolve({ success: false }),
        !isFacOnly
          ? (api.team.getAllAdmin ? api.team.getAllAdmin() : api.team.getAll()).catch(() => ({ success: false }))
          : Promise.resolve({ success: false }),
        !isFacOnly
          ? (api.designations.getAllAdmin ? api.designations.getAllAdmin() : api.designations.getAll()).catch(() => ({ success: false }))
          : Promise.resolve({ success: false }),
        !isFacOnly ? api.payments.getAdminQueue().catch(() => ({ success: false })) : Promise.resolve({ success: false }),
        api.gallery.getAlbums().catch(() => ({ success: false })),
        api.activities.getAll().catch(() => ({ success: false })),
        isSuper ? api.admin.getUsers().catch(() => ({ success: false })) : Promise.resolve({ success: false }),
        api.content.get('branding').catch(() => ({ success: false })),
      ]);

      if (statsRes.success && statsRes.stats) setStats(statsRes.stats);
      if (evRes.success && evRes.events) {
        setEvents(evRes.events);
        if (evRes.events.length > 0 && !selectedEventId) {
          setSelectedEventId(evRes.events[0]._id);
        }
      }
      if (appRes.success && appRes.applications) setApplications(appRes.applications);
      if (msgRes.success && msgRes.messages) setMessages(msgRes.messages);
      if (teamRes.success) {
        setTeamList(teamRes.members || teamRes.team?.all || []);
      }
      if (desgRes.success && desgRes.designations) setDesignations(desgRes.designations);
      if (payRes.success && payRes.submissions) setPayments(payRes.submissions);
      if (albRes.success && albRes.albums) setAlbums(albRes.albums);
      if (actRes.success && actRes.items) setActivities(actRes.items);
      if (userRes.success && userRes.users) setUsersList(userRes.users);
      if (brandRes.success && brandRes.data) {
        setBranding((prev) => ({ ...prev, ...brandRes.data }));
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
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

  // Load attendees for selected event
  useEffect(() => {
    if (!selectedEventId || userRole === 'FACULTY') return;
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
  }, [selectedEventId, userRole]);

  // Payment Verification Handler
  const handleReviewPayment = async (status: 'VERIFIED' | 'REJECTED' | 'RESUBMISSION_REQUESTED') => {
    if (!inspectingPayment) return;
    if ((status === 'REJECTED' || status === 'RESUBMISSION_REQUESTED') && !rejectionReason.trim()) {
      alert('A clear rejection reason is mandatory to guide the student.');
      return;
    }
    try {
      setPaymentActionLoading(true);
      const res = await api.payments.verifyProof(inspectingPayment._id, {
        status,
        rejectionReason: rejectionReason.trim(),
        adminNotes: adminNote.trim(),
      });
      if (res.success) {
        setInspectingPayment(null);
        setRejectionReason('');
        setAdminNote('');
        loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Payment review failed');
    } finally {
      setPaymentActionLoading(false);
    }
  };

  // Event Handlers
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...eventForm,
        fee: Math.round(eventForm.feeInRupees * 100), // convert rupees to paise
        startDate: new Date(eventForm.startDate).toISOString(),
        registrationDeadline: new Date(eventForm.registrationDeadline).toISOString(),
        endDate: eventForm.endDate ? new Date(eventForm.endDate).toISOString() : undefined,
      };

      if (editingEventId) {
        await api.events.update(editingEventId, payload);
      } else {
        await api.events.create(payload);
      }
      setIsEventModalOpen(false);
      setEditingEventId(null);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save event');
    }
  };

  const handleEditEvent = (event: EventItem) => {
    setEditingEventId(event._id);
    setEventForm({
      title: event.title,
      slug: event.slug,
      subtitle: event.subtitle || '',
      description: event.description,
      category: event.category,
      venue: event.venue,
      isOnline: event.isOnline,
      startDate: event.startDate ? event.startDate.substring(0, 16) : '',
      endDate: event.endDate ? event.endDate.substring(0, 16) : '',
      timeString: event.timeString || '10:00 AM - 1:00 PM',
      registrationDeadline: event.registrationDeadline ? event.registrationDeadline.substring(0, 16) : '',
      capacity: event.capacity || 100,
      eligibility: event.eligibility,
      status: event.status,
      posterUrl: event.posterUrl || '',
      isFeatured: event.isFeatured,
      isPaid: event.isPaid || false,
      feeInRupees: event.fee ? event.fee / 100 : 0,
      paymentUpiId: event.paymentUpiId || 'aceskbtcoe@okaxis',
      paymentInstructions: event.paymentInstructions || 'Pay via UPI and enter transaction UTR.',
      refundPolicy: event.refundPolicy || 'Non-refundable once confirmed.',
    });
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Delete this event? Registrations will also be removed.')) return;
    try {
      await api.events.delete(id);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  // Team Member Photo Upload Handler
  const handleUploadMemberPhoto = async () => {
    if (!memberPhotoFile) {
      alert('Please select an image file first.');
      return;
    }
    try {
      setUploadingMemberPhoto(true);
      const formData = new FormData();
      formData.append('photo', memberPhotoFile);
      const res = await api.team.uploadPhoto(formData);
      if (res.success && res.url) {
        setTeamForm((prev) => ({ ...prev, photoUrl: res.url }));
        setMemberPhotoFile(null);
        alert('Photo uploaded successfully! Preview updated below.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload member photo');
    } finally {
      setUploadingMemberPhoto(false);
    }
  };

  // Team Management Handlers
  const handleSaveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMemberId) {
        await api.team.update(editingMemberId, teamForm);
      } else {
        await api.team.add(teamForm);
      }
      setIsTeamModalOpen(false);
      setEditingMemberId(null);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save team member');
    }
  };

  const handleMoveTeamMember = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= teamList.length) return;

    const updated = [...teamList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setTeamList(updated);
    try {
      const orderedIds = updated.map((m) => m._id);
      await api.team.reorder(orderedIds);
    } catch (err) {
      console.error('Failed to persist team order:', err);
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!window.confirm('Remove this committee member from public listing?')) return;
    try {
      await api.team.delete(id);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  // Designation Handlers
  const handleSaveDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.designations.create(desgForm);
      setIsDesgModalOpen(false);
      setDesgForm({ title: '', tier: 'COMMITTEE', displayOrder: 10, description: '' });
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create designation');
    }
  };

  const handleRetireDesignation = async (id: string) => {
    if (!window.confirm('Retire this designation? Existing members will retain historical record.')) return;
    try {
      await api.designations.retire(id);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to retire designation');
    }
  };

  // Gallery Album Handlers
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.gallery.createAlbum(albumForm);
      setIsAlbumModalOpen(false);
      setAlbumForm({
        title: '',
        description: '',
        eventDate: new Date().toISOString().split('T')[0],
        academicYear: '2026-27',
        category: 'FLAGSHIP',
        coverImageUrl: '',
        isPublished: true,
      });
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create gallery album');
    }
  };

  const handleUploadMedia = async (albumId: string) => {
    if (!uploadFile) {
      alert('Please select an image or video file.');
      return;
    }
    const formData = new FormData();
    formData.append('mediaFile', uploadFile);
    formData.append('caption', uploadMediaCaption);

    try {
      await api.gallery.uploadMedia(albumId, formData);
      setUploadFile(null);
      setUploadMediaCaption('');
      setUploadingAlbumId(null);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Media upload failed');
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!window.confirm('Delete this event album and all associated photos/videos?')) return;
    try {
      await api.gallery.deleteAlbum(id);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete album');
    }
  };

  // Activity & Achievement Handlers
  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...activityForm,
        tags: activityForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      if (editingActivityId) {
        await api.activities.update(editingActivityId, payload);
      } else {
        await api.activities.create(payload);
      }
      setIsActivityModalOpen(false);
      setEditingActivityId(null);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save activity');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!window.confirm('Delete this departmental activity / achievement?')) return;
    try {
      await api.activities.delete(id);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete activity');
    }
  };

  // Group Photo Upload Handler (CMS)
  const handleUploadGroupPhoto = async () => {
    if (!groupPhotoFile) {
      alert('Please select a group photo file first.');
      return;
    }
    try {
      setUploadingGroupPhoto(true);
      const formData = new FormData();
      formData.append('image', groupPhotoFile);
      const res = await api.content.uploadImage(formData);
      if (res.success && res.url) {
        const updatedBranding = { ...branding, groupPhotoUrl: res.url };
        setBranding(updatedBranding);
        await api.content.update('branding', updatedBranding);
        setGroupPhotoFile(null);
        alert('Official Group Photo uploaded and updated live on the website!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload group photo');
    } finally {
      setUploadingGroupPhoto(false);
    }
  };

  // Logo Upload Handler (CMS)
  const handleUploadLogo = async () => {
    if (!logoFile) {
      alert('Please select a logo file first.');
      return;
    }
    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('image', logoFile);
      const res = await api.content.uploadImage(formData);
      if (res.success && res.url) {
        const updatedBranding = { ...branding, logoUrl: res.url };
        setBranding(updatedBranding);
        await api.content.update('branding', updatedBranding);
        setLogoFile(null);
        alert('Official Club Logo uploaded and updated live on the website!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save All Branding CMS Details
  const handleSaveBranding = async () => {
    try {
      setSavingBranding(true);
      await api.content.update('branding', branding);
      alert('Website branding, photos, and contact info saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save branding');
    } finally {
      setSavingBranding(false);
    }
  };

  // User Security Role Update (Superadmin only)
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.admin.updateUser(userId, { role: newRole });
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      alert(`User role updated to ${newRole}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  // Application Handlers
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

  // Contact Messages Handler
  const handleToggleMessageRead = async (id: string, current: boolean) => {
    try {
      await api.contact.markRead(id, !current);
      setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, isRead: !current } : m)));
    } catch (err: any) {
      alert(err.message || 'Failed to update message status');
    }
  };

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const matchesStatus = paymentStatusFilter === 'ALL' || p.status === paymentStatusFilter;
    const studentName = typeof p.userId === 'object' ? p.userId.fullName : '';
    const studentEmail = typeof p.userId === 'object' ? p.userId.email : '';
    const q = paymentSearch.toLowerCase();
    const matchesSearch =
      !q ||
      p.utrReference.toLowerCase().includes(q) ||
      studentName.toLowerCase().includes(q) ||
      studentEmail.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingPaymentsCount = payments.filter((p) => p.status === 'PROOF_SUBMITTED').length;

  if (!isAdmin) return null;

  // Role Badge Display
  const getRoleBadge = () => {
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      return {
        title: 'SUPERADMIN CONTROL CENTER',
        desc: 'Full website, media, user roles & system control',
        color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      };
    }
    if (userRole === 'FACULTY') {
      return {
        title: 'FACULTY COORDINATOR CONTROL CENTER',
        desc: 'Departmental activities & student achievements management',
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      };
    }
    if (userRole === 'PRESIDENT') {
      return {
        title: 'CLUB PRESIDENT CONTROL CENTER',
        desc: 'Team members, events, registrations, applications & messages',
        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      };
    }
    return {
      title: 'ADMIN ACCESS',
      desc: 'ACES KBTCOE Departmental Club',
      color: 'bg-white/10 text-slate-300 border-white/10',
    };
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="pt-24 pb-20 min-h-screen bg-navy-950 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge.color}`}>
                {roleBadge.title}
              </span>
              <span className="text-xs text-slate-500 font-medium">{roleBadge.desc}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              ACES KBTCOE Operations Suite
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllAdminData}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <Link
              to="/dashboard"
              className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10"
            >
              Member View
            </Link>
            <Link
              to="/"
              className="px-3.5 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors"
            >
              Live Site
            </Link>
          </div>
        </div>

        {/* Dynamic RBAC Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-8 scrollbar-none border-b border-white/5">
          {accessibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            let badgeValue: number | null = null;
            let isAlert = false;
            if (tab.id === 'events') badgeValue = events.length;
            if (tab.id === 'registrations') badgeValue = stats.totalRegistrations;
            if (tab.id === 'payments') {
              badgeValue = pendingPaymentsCount;
              isAlert = pendingPaymentsCount > 0;
            }
            if (tab.id === 'team') badgeValue = teamList.length;
            if (tab.id === 'gallery') badgeValue = albums.length;
            if (tab.id === 'activities') badgeValue = activities.length;
            if (tab.id === 'applications') {
              badgeValue = stats.pendingApplications;
              isAlert = stats.pendingApplications > 0;
            }
            if (tab.id === 'members') badgeValue = usersList.length;
            if (tab.id === 'messages') badgeValue = stats.unreadMessages;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'bg-navy-900/80 text-slate-400 border-white/5 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
                {badgeValue !== null && badgeValue > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isAlert ? 'bg-amber-500 text-black' : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {badgeValue}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="p-4 rounded-2xl glass-card border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
                <div className="text-2xl font-black text-white mt-1">{stats.totalUsers || 0}</div>
                <div className="text-[10px] text-slate-500 mt-1">Registered in portal</div>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-white/10">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Published Events</span>
                <div className="text-2xl font-black text-emerald-300 mt-1">{stats.activeEvents || events.length}</div>
                <div className="text-[10px] text-slate-500 mt-1">Live for students</div>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-white/10">
                <span className="text-[10px] uppercase font-bold text-indigo-400">Registrations</span>
                <div className="text-2xl font-black text-indigo-300 mt-1">{stats.totalRegistrations || 0}</div>
                <div className="text-[10px] text-slate-500 mt-1">Across all events</div>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-amber-500/30 bg-amber-500/5">
                <span className="text-[10px] uppercase font-bold text-amber-400">Pending Payments</span>
                <div className="text-2xl font-black text-amber-300 mt-1">{stats.pendingPayments || pendingPaymentsCount}</div>
                <div className="text-[10px] text-amber-400/70 mt-1">Requires verification</div>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-white/10">
                <span className="text-[10px] uppercase font-bold text-teal-400">Confirmed Paid</span>
                <div className="text-2xl font-black text-teal-300 mt-1">{stats.confirmedPaid || 0}</div>
                <div className="text-[10px] text-slate-500 mt-1">Verified registrations</div>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-white/10">
                <span className="text-[10px] uppercase font-bold text-rose-400">Pending Apps</span>
                <div className="text-2xl font-black text-rose-300 mt-1">{stats.pendingApplications || 0}</div>
                <div className="text-[10px] text-slate-500 mt-1">Awaiting club review</div>
              </div>
            </div>

            {/* Quick Actions Panel Tailored to Current Role */}
            <div className="p-6 rounded-3xl bg-navy-900 border border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Operational Shortcuts for {userRole.replace('_', ' ')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {(isSuperAdmin || isPresident) && (
                  <>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left hover:bg-amber-500/20 transition-all"
                    >
                      <div className="text-amber-300 font-bold text-xs flex items-center justify-between">
                        <span>Payment Verification</span>
                        <CreditCard size={15} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {pendingPaymentsCount} receipts pending review
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        setEditingEventId(null);
                        setIsEventModalOpen(true);
                      }}
                      className="p-4 rounded-2xl bg-electric-blue/10 border border-electric-blue/20 text-left hover:bg-electric-blue/20 transition-all"
                    >
                      <div className="text-electric-cyan font-bold text-xs flex items-center justify-between">
                        <span>+ Add New Event</span>
                        <Plus size={15} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Configure free or paid departmental event</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('team')}
                      className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-left hover:bg-indigo-500/20 transition-all"
                    >
                      <div className="text-indigo-300 font-bold text-xs flex items-center justify-between">
                        <span>Manage Team & Photos</span>
                        <Briefcase size={15} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{teamList.length} committee members listed</p>
                    </button>
                  </>
                )}

                {(isSuperAdmin || isFaculty) && (
                  <button
                    onClick={() => {
                      setEditingActivityId(null);
                      setActivityForm({
                        title: '',
                        type: 'ACTIVITY',
                        description: '',
                        date: new Date().toISOString().split('T')[0],
                        tags: 'Department, Workshop',
                        imageUrl: '',
                        featured: false,
                      });
                      setIsActivityModalOpen(true);
                    }}
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left hover:bg-emerald-500/20 transition-all"
                  >
                    <div className="text-emerald-300 font-bold text-xs flex items-center justify-between">
                      <span>+ Departmental Activity</span>
                      <Award size={15} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Post workshop or student achievement</p>
                  </button>
                )}

                {isSuperAdmin && (
                  <button
                    onClick={() => setActiveTab('cms')}
                    className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-left hover:bg-teal-500/20 transition-all"
                  >
                    <div className="text-teal-300 font-bold text-xs flex items-center justify-between">
                      <span>Change Website Photos</span>
                      <UploadCloud size={15} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Upload new Group Photo or Club Logo</p>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: EVENTS */}
        {/* ========================================================================= */}
        {activeTab === 'events' && (isSuperAdmin || isPresident) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Departmental Events ({events.length})</h2>
                <p className="text-xs text-slate-400">Manage free and paid workshops, seminars, and hackathons</p>
              </div>
              <button
                onClick={() => {
                  setEditingEventId(null);
                  setEventForm({
                    title: '',
                    slug: '',
                    subtitle: '',
                    description: '',
                    category: 'WORKSHOP',
                    venue: 'Seminar Hall, KBTCOE',
                    isOnline: false,
                    startDate: '',
                    endDate: '',
                    timeString: '10:00 AM - 1:00 PM',
                    registrationDeadline: '',
                    capacity: 100,
                    eligibility: 'OPEN_TO_ALL',
                    status: 'PUBLISHED',
                    posterUrl: '',
                    isFeatured: false,
                    isPaid: false,
                    feeInRupees: 0,
                    paymentUpiId: 'aceskbtcoe@okaxis',
                    paymentInstructions: 'Pay via UPI and enter transaction UTR.',
                    refundPolicy: 'Non-refundable once confirmed.',
                  });
                  setIsEventModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors"
              >
                <Plus size={14} />
                <span>Create New Event</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-navy-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Event & Category</th>
                    <th className="py-3 px-4">Fee Structure</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4">Seats</th>
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
                        {e.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ₹{(e.fee / 100).toFixed(2)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            FREE
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {new Date(e.startDate).toLocaleDateString()}
                        <span className="block text-[10px] text-slate-400">{e.timeString || 'TBD'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {e.registeredCount || 0} / {e.capacity || '∞'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            e.status === 'PUBLISHED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditEvent(e)}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                        >
                          Edit
                        </button>
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

        {/* ========================================================================= */}
        {/* SECTION 3: EVENT REGISTRATIONS */}
        {/* ========================================================================= */}
        {activeTab === 'registrations' && (isSuperAdmin || isPresident) && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Student Event Registrations</h2>
                <p className="text-xs text-slate-400">Track attendees, attendance, and payment state</p>
              </div>

              {selectedEventId && (
                <a
                  href={api.registrations.getExportUrl(selectedEventId)}
                  download
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
                >
                  <Download size={14} />
                  <span>Export CSV with Payment Info</span>
                </a>
              )}
            </div>

            {/* Event Selector */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Filter Event:</span>
              {events.map((e) => (
                <button
                  key={e._id}
                  onClick={() => setSelectedEventId(e._id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                    selectedEventId === e._id
                      ? 'bg-electric-blue text-white border-electric-blue'
                      : 'bg-navy-900 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  {e.title}
                </button>
              ))}
            </div>

            {loadingAttendees ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading registrations...</div>
            ) : attendees.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 glass-card rounded-2xl">
                No students registered for this event yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-navy-900">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Department / Batch</th>
                      <th className="py-3 px-4">Registration Status</th>
                      <th className="py-3 px-4">Payment Status</th>
                      <th className="py-3 px-4">Date Registered</th>
                      <th className="py-3 px-4 text-right">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {attendees.map((a) => (
                      <tr key={a._id} className="hover:bg-white/5">
                        <td className="py-3.5 px-4">
                          <strong className="text-white block">{a.fullName}</strong>
                          <span className="text-[10px] text-slate-400">{a.email}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {a.department} • <span className="font-semibold text-white">{a.academicYear}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              a.status === 'REGISTERED' || a.status === 'ATTENDED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              a.paymentStatus === 'VERIFIED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : a.paymentStatus === 'PROOF_SUBMITTED'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : a.paymentStatus === 'REJECTED'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {a.paymentStatus || (a.isPaidEvent ? 'AWAITING_PAYMENT' : 'FREE')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(a.registrationDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={async () => {
                              const next = a.status === 'ATTENDED' ? 'REGISTERED' : 'ATTENDED';
                              await api.registrations.updateAttendance(a._id, next);
                              setAttendees((prev) =>
                                prev.map((item) => (item._id === a._id ? { ...item, status: next } : item))
                              );
                            }}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                              a.status === 'ATTENDED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            {a.status === 'ATTENDED' ? '✓ Attended' : 'Mark Attended'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: PAYMENT VERIFICATION */}
        {/* ========================================================================= */}
        {activeTab === 'payments' && (isSuperAdmin || isPresident) && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Manual Payment Verification Queue</h2>
                <p className="text-xs text-slate-400">
                  Review student UTR references and private encrypted payment screenshots
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-2">
                {['ALL', 'PROOF_SUBMITTED', 'VERIFIED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setPaymentStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      paymentStatusFilter === st
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-navy-900 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {st === 'PROOF_SUBMITTED' ? 'PENDING' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by UTR reference, student name, or email..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-navy-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
              />
            </div>

            {filteredPayments.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 glass-card rounded-2xl">
                No payment submissions match the selected filter.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-navy-900">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Event</th>
                      <th className="py-3 px-4">Expected Fee</th>
                      <th className="py-3 px-4">UTR Reference</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPayments.map((p) => {
                      const studentName = typeof p.userId === 'object' ? p.userId.fullName : 'Student';
                      const studentEmail = typeof p.userId === 'object' ? p.userId.email : '';
                      const eventTitle = typeof p.eventId === 'object' ? p.eventId.title : 'Event';

                      return (
                        <tr key={p._id} className="hover:bg-white/5">
                          <td className="py-3.5 px-4">
                            <strong className="text-white block">{studentName}</strong>
                            <span className="text-[10px] text-slate-400">{studentEmail}</span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-white">{eventTitle}</td>
                          <td className="py-3.5 px-4 font-bold text-amber-300">
                            ₹{(p.expectedAmount / 100).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-300 bg-white/5 px-2 py-1 rounded inline-block my-2">
                            {p.utrReference}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {new Date(p.submittedAt || p.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                p.status === 'VERIFIED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : p.status === 'PROOF_SUBMITTED'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setInspectingPayment(p);
                                setRejectionReason(p.rejectionReason || '');
                                setAdminNote(p.adminNotes || '');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-electric-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors inline-flex items-center gap-1.5"
                            >
                              <Eye size={12} />
                              <span>Inspect Proof</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: TEAM MANAGEMENT (With Photo Upload) */}
        {/* ========================================================================= */}
        {activeTab === 'team' && (isSuperAdmin || isPresident) && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Committee Team & Configurable Roles</h2>
                <p className="text-xs text-slate-400">
                  Upload member photos, assign designations, and reorder members
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDesgModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10"
                >
                  + Add Designation
                </button>
                <button
                  onClick={() => {
                    setEditingMemberId(null);
                    setMemberPhotoFile(null);
                    setTeamForm({
                      name: '',
                      designationId: designations[0]?._id || '',
                      role: 'COMMITTEE MEMBER',
                      tier: 'COMMITTEE',
                      department: 'Computer Engineering',
                      academicYear: 'SE',
                      bio: '',
                      photoUrl: '/assets/members/President.jpeg',
                      linkedinUrl: '',
                      githubUrl: '',
                      displayOrder: teamList.length + 1,
                      isPublished: true,
                    });
                    setIsTeamModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600"
                >
                  <Plus size={14} />
                  <span>Add Team Member</span>
                </button>
              </div>
            </div>

            {/* Designations Pill Cloud */}
            <div className="p-4 rounded-2xl bg-navy-900 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Configurable Club Designations ({designations.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {designations.map((d) => (
                  <div
                    key={d._id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  >
                    <span>{d.title}</span>
                    <span className="text-[10px] text-amber-400 font-mono">({d.tier})</span>
                    {!d.isRetired && (
                      <button
                        onClick={() => handleRetireDesignation(d._id)}
                        className="text-slate-500 hover:text-rose-400 text-[10px]"
                        title="Retire designation"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Committee Members Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-navy-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Member Photo & Name</th>
                    <th className="py-3 px-4">Public Designation</th>
                    <th className="py-3 px-4">Department / Year</th>
                    <th className="py-3 px-4">Published</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {teamList.map((m, idx) => (
                    <tr key={m._id} className="hover:bg-white/5">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveTeamMember(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-slate-400"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <span className="font-mono text-white text-[11px] w-5 text-center">
                            {idx + 1}
                          </span>
                          <button
                            onClick={() => handleMoveTeamMember(idx, 'down')}
                            disabled={idx === teamList.length - 1}
                            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-slate-400"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img
                          src={m.photoUrl}
                          alt={m.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/20 shadow"
                        />
                        <div>
                          <strong className="text-white block">{m.name}</strong>
                          <span className="text-[10px] text-slate-400">{m.role}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-cyan-300 border border-white/10">
                          {typeof m.designationId === 'object' && m.designationId
                            ? m.designationId.title
                            : m.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {m.department} • <span className="font-semibold text-white">{m.academicYear || 'SE'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={async () => {
                            const next = !m.isPublished;
                            await api.team.update(m._id, { isPublished: next });
                            setTeamList((prev) =>
                              prev.map((item) => (item._id === m._id ? { ...item, isPublished: next } : item))
                            );
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.isPublished ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {m.isPublished ? 'Published' : 'Hidden'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingMemberId(m._id);
                            setMemberPhotoFile(null);
                            setTeamForm({
                              name: m.name,
                              designationId:
                                typeof m.designationId === 'object' && m.designationId
                                  ? m.designationId._id
                                  : (m.designationId as string) || '',
                              role: m.role,
                              tier: m.tier || 'COMMITTEE',
                              department: m.department || 'Computer Engineering',
                              academicYear: m.academicYear || 'SE',
                              bio: m.bio || '',
                              photoUrl: m.photoUrl,
                              linkedinUrl: m.linkedinUrl || '',
                              githubUrl: m.githubUrl || '',
                              displayOrder: m.displayOrder || 10,
                              isPublished: m.isPublished ?? true,
                            });
                            setIsTeamModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                        >
                          Edit & Change Photo
                        </button>
                        <button
                          onClick={() => handleDeleteTeamMember(m._id)}
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

        {/* ========================================================================= */}
        {/* SECTION 6: EVENT GALLERY */}
        {/* ========================================================================= */}
        {activeTab === 'gallery' && (isSuperAdmin || isPresident) && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Event Media Albums ({albums.length})</h2>
                <p className="text-xs text-slate-400">
                  Completed event photo and video galleries with Cloudinary delivery
                </p>
              </div>

              <button
                onClick={() => setIsAlbumModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600"
              >
                <Plus size={14} />
                <span>Create Event Album</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((alb) => (
                <div
                  key={alb._id}
                  className="rounded-2xl bg-navy-900 border border-white/10 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 bg-navy-950 overflow-hidden">
                      {alb.coverImageUrl ? (
                        <img
                          src={alb.coverImageUrl}
                          alt={alb.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-600 text-xs">
                          No cover photo uploaded
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold bg-navy-950/80 text-white backdrop-blur border border-white/10">
                        {alb.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-white text-sm">{alb.title}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{alb.description}</p>
                      <div className="text-[10px] text-slate-500">
                        Date: {new Date(alb.eventDate).toLocaleDateString()} • {alb.media?.length || 0} media assets
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <button
                      onClick={() => setUploadingAlbumId(alb._id)}
                      className="text-xs font-semibold text-electric-cyan hover:underline flex items-center gap-1"
                    >
                      <UploadCloud size={13} />
                      <span>Upload Photos/Videos</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAlbum(alb._id)}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 7: ACTIVITIES & ACHIEVEMENTS (FACULTY & SUPERADMIN) */}
        {/* ========================================================================= */}
        {activeTab === 'activities' && (isSuperAdmin || isFaculty) && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Departmental Activities & Student Achievements</h2>
                <p className="text-xs text-slate-400">
                  Add and manage student technical workshops, hackathons, and departmental awards
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingActivityId(null);
                  setActivityForm({
                    title: '',
                    type: 'ACTIVITY',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    tags: 'Department, Workshop',
                    imageUrl: '',
                    featured: false,
                  });
                  setIsActivityModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                <Plus size={14} />
                <span>Add Activity / Achievement</span>
              </button>
            </div>

            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 glass-card rounded-2xl">
                  No departmental activities or achievements listed yet. Click "+ Add Activity / Achievement" to create one.
                </div>
              ) : (
                activities.map((act) => (
                  <div
                    key={act._id}
                    className="p-5 rounded-2xl bg-navy-900 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-amber-400 shrink-0">
                        <Award size={20} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{act.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-amber-300 border border-white/10">
                            {act.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{act.description}</p>
                        <div className="text-[10px] text-slate-400 pt-1">
                          Date: {new Date(act.date).toLocaleDateString()}
                          {act.tags?.length > 0 && ` • Tags: ${act.tags.join(', ')}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingActivityId(act._id);
                          setActivityForm({
                            title: act.title,
                            type: act.type,
                            description: act.description,
                            date: act.date ? act.date.substring(0, 10) : '',
                            tags: act.tags?.join(', ') || '',
                            imageUrl: act.imageUrl || '',
                            featured: act.featured || false,
                          });
                          setIsActivityModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(act._id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 8: MEMBERSHIP APPLICATIONS (SUPERADMIN & PRESIDENT) */}
        {/* ========================================================================= */}
        {activeTab === 'applications' && (isSuperAdmin || isPresident) && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                Student Membership Applications ({applications.length})
              </h2>
              <p className="text-xs text-slate-400">Review student statements and departmental club requests</p>
            </div>

            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 glass-card rounded-2xl">
                  No membership applications submitted yet.
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app._id}
                    className="p-5 rounded-2xl bg-navy-900 border border-white/10 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div>
                        <h3 className="font-bold text-white text-sm">{app.fullName}</h3>
                        <p className="text-[11px] text-slate-400">
                          {app.email} • {app.department} ({app.academicYear})
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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

                    <div className="space-y-2 text-xs">
                      <div>
                        <strong className="text-slate-400 text-[10px] uppercase block">Reason for Joining:</strong>
                        <p className="text-slate-200 mt-0.5">{app.reasonForJoining}</p>
                      </div>

                      {app.areasOfInterest?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {app.areasOfInterest.map((a, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-cyan-300 border border-white/10"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {app.status === 'PENDING' && (
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => handleReviewApp(app._id, 'APPROVED')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                        >
                          Approve Membership
                        </button>
                        <button
                          onClick={() => handleReviewApp(app._id, 'REJECTED')}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 9: MEMBER MANAGEMENT & USER ROLES (SUPERADMIN ONLY) */}
        {/* ========================================================================= */}
        {activeTab === 'members' && isSuperAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Registered Users & Role Assignment ({usersList.length})</h2>
                <p className="text-xs text-slate-400">
                  Assign administrative privileges (SUPER_ADMIN, FACULTY, PRESIDENT) or approve club members
                </p>
              </div>

              <input
                type="text"
                placeholder="Search by student name or email..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="px-3.5 py-1.5 bg-navy-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-navy-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Department / Year</th>
                    <th className="py-3 px-4">Administrative Role</th>
                    <th className="py-3 px-4">Club Member Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersList
                    .filter(
                      (u) =>
                        !memberSearch ||
                        u.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(memberSearch.toLowerCase())
                    )
                    .map((u) => (
                      <tr key={u._id} className="hover:bg-white/5">
                        <td className="py-3.5 px-4">
                          <strong className="text-white block">{u.fullName}</strong>
                          <span className="text-[10px] text-slate-400">{u.email}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {u.department} • <span className="font-semibold text-white">{u.academicYear || 'SE'}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              u.role === 'SUPER_ADMIN' || u.role === 'ADMIN'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : u.role === 'FACULTY'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : u.role === 'PRESIDENT'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                : 'bg-navy-950 text-slate-300 border-white/10'
                            }`}
                          >
                            <option value="SUPER_ADMIN">SUPER_ADMIN (Full Website Control)</option>
                            <option value="FACULTY">FACULTY (Activities & Achievements)</option>
                            <option value="PRESIDENT">PRESIDENT (Team, Events, Applications)</option>
                            <option value="MEMBER">MEMBER (Student Member)</option>
                            <option value="VISITOR">VISITOR (Guest)</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.isApprovedMember ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {u.isApprovedMember ? 'Approved Member' : 'Regular User'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={async () => {
                              const nextApproved = !u.isApprovedMember;
                              await api.admin.updateUser(u._id, { isApprovedMember: nextApproved });
                              setUsersList((prev) =>
                                prev.map((item) => (item._id === u._id ? { ...item, isApprovedMember: nextApproved } : item))
                              );
                            }}
                            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-semibold"
                          >
                            Toggle Approval
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 10: WEBSITE CONTENT & PHOTOS (SUPERADMIN ONLY) */}
        {/* ========================================================================= */}
        {activeTab === 'cms' && isSuperAdmin && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-white">Website Content & Photo Control Center</h2>
              <p className="text-xs text-slate-400">
                Change the official committee group photo, club logo, hero announcements, and contact information
              </p>
            </div>

            {/* Photo Uploaders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Group Photo Management */}
              <div className="p-6 rounded-3xl bg-navy-900 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">Official Committee Group Photograph</h3>
                    <p className="text-[11px] text-slate-400">Displayed on Home Page and Team Page</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                    PUBLIC
                  </span>
                </div>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-navy-950 border border-white/10">
                  <img
                    src={branding.groupPhotoUrl}
                    alt="Current Committee Group Photo"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-300 font-semibold block">
                    Upload New Group Photo (JPEG/PNG/WebP):
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setGroupPhotoFile(e.target.files?.[0] || null)}
                      className="flex-1 px-3 py-1.5 bg-navy-950 border border-white/10 rounded-xl text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-white/10 file:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleUploadGroupPhoto}
                      disabled={uploadingGroupPhoto || !groupPhotoFile}
                      className="px-4 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600 disabled:opacity-50 transition-colors shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <UploadCloud size={14} />
                      <span>{uploadingGroupPhoto ? 'Uploading...' : 'Upload & Apply'}</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Uploaded photos are automatically synchronized and delivered via Cloudinary CDN.
                  </span>
                </div>
              </div>

              {/* 2. Club Logo Management */}
              <div className="p-6 rounded-3xl bg-navy-900 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">Official ACES Club Logo</h3>
                    <p className="text-[11px] text-slate-400">Displayed in Navbar, Footer, and Header</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                    BRANDING
                  </span>
                </div>

                <div className="h-44 rounded-2xl bg-navy-950 border border-white/10 flex items-center justify-center p-4">
                  <img
                    src={branding.logoUrl}
                    alt="Current Club Logo"
                    className="max-h-36 max-w-full object-contain"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-300 font-semibold block">
                    Upload New Club Logo (PNG/JPEG/WebP):
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      className="flex-1 px-3 py-1.5 bg-navy-950 border border-white/10 rounded-xl text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-white/10 file:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleUploadLogo}
                      disabled={uploadingLogo || !logoFile}
                      className="px-4 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600 disabled:opacity-50 transition-colors shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <UploadCloud size={14} />
                      <span>{uploadingLogo ? 'Uploading...' : 'Upload & Apply'}</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Square aspect ratio recommended for optimal navbar appearance.
                  </span>
                </div>
              </div>
            </div>

            {/* General Content Form */}
            <div className="p-6 rounded-3xl bg-navy-900 border border-white/10 space-y-4">
              <h3 className="font-bold text-white text-sm">Website Headlines & Campus Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 uppercase font-semibold">Hero Headline</label>
                  <input
                    type="text"
                    value={branding.headline}
                    onChange={(e) => setBranding({ ...branding, headline: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 uppercase font-semibold">Official Contact Email</label>
                  <input
                    type="text"
                    value={branding.contactEmail}
                    onChange={(e) => setBranding({ ...branding, contactEmail: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] text-slate-400 uppercase font-semibold">Sub-headline Description</label>
                  <textarea
                    rows={2}
                    value={branding.subtitle}
                    onChange={(e) => setBranding({ ...branding, subtitle: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] text-slate-400 uppercase font-semibold">Campus Location</label>
                  <input
                    type="text"
                    value={branding.campusLocation}
                    onChange={(e) => setBranding({ ...branding, campusLocation: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSaveBranding}
                  disabled={savingBranding}
                  className="px-5 py-2.5 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-electric-blue/20"
                >
                  {savingBranding ? 'Saving...' : 'Save All Branding Details'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 11: CONTACT MESSAGES */}
        {/* ========================================================================= */}
        {activeTab === 'messages' && (isSuperAdmin || isPresident) && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Student & Visitor Inquiries ({messages.length})</h2>
              <p className="text-xs text-slate-400">Messages submitted via the public Contact form</p>
            </div>

            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 glass-card rounded-2xl">
                  No contact messages received.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`p-5 rounded-2xl border transition-colors ${
                      msg.isRead
                        ? 'bg-navy-900/50 border-white/5'
                        : 'bg-navy-900 border-electric-blue/30 shadow-lg shadow-electric-blue/5'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5 mb-2.5">
                      <div>
                        <strong className="text-white text-sm">{msg.subject}</strong>
                        <p className="text-[11px] text-slate-400">
                          From: {msg.name} ({msg.email})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleMessageRead(msg._id, msg.isRead)}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                        >
                          {msg.isRead ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        <span className="text-[10px] text-slate-500">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 12: SETTINGS (SUPERADMIN ONLY) */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && isSuperAdmin && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">System Settings & Infrastructure Status</h2>
              <p className="text-xs text-slate-400">Configuration overview for storage, database, and UPI receiver</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-navy-900 border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-sm">Database & Storage Health</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Database Engine:</span>
                    <span className="font-semibold text-emerald-400">MongoDB with Mongoose ODM</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Database Connection:</span>
                    <span className="font-semibold text-emerald-400">Connected (mongodb://localhost:27017)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Media Delivery:</span>
                    <span className="font-semibold text-cyan-300">Cloudinary with Local File Fallback</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Payment Proof Security:</span>
                    <span className="font-semibold text-emerald-400">Private Stream (IDOR-protected)</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-navy-900 border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-sm">UPI Payment Receiver Configuration</h3>
                <div>
                  <label className="text-[11px] text-slate-400 uppercase font-semibold">Club UPI VPA</label>
                  <input
                    type="text"
                    defaultValue="aceskbtcoe@okaxis"
                    className="w-full mt-1 px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                  ⚠️ Note: Manual payments submitted by students are credited to this UPI VPA. Admins verify UTR references against bank statements before confirming seats.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: INSPECT PAYMENT PROOF */}
        {/* ========================================================================= */}
        {inspectingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Review Payment Proof</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {inspectingPayment._id}</p>
                </div>
                <button
                  onClick={() => setInspectingPayment(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-navy-950 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Student</span>
                  <strong className="text-white">
                    {typeof inspectingPayment.userId === 'object' ? inspectingPayment.userId.fullName : 'Student'}
                  </strong>
                  <div className="text-slate-400 text-[10px]">
                    {typeof inspectingPayment.userId === 'object' ? inspectingPayment.userId.email : ''}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-navy-950 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Expected Fee</span>
                  <strong className="text-amber-300 text-sm">
                    ₹{(inspectingPayment.expectedAmount / 100).toFixed(2)}
                  </strong>
                </div>

                <div className="col-span-2 p-3 rounded-xl bg-navy-950 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Submitted UTR Reference</span>
                  <span className="font-mono text-sm text-cyan-300 font-bold">{inspectingPayment.utrReference}</span>
                </div>
              </div>

              {/* Private Screenshot Preview */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Payment Receipt / Screenshot:</label>
                <div className="rounded-2xl border border-white/10 bg-navy-950 overflow-hidden max-h-72 flex items-center justify-center p-2">
                  <img
                    src={api.payments.getScreenshotUrl(inspectingPayment._id)}
                    alt="Payment Screenshot"
                    className="max-h-68 max-w-full object-contain rounded-lg"
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Rejection / Resubmission Input */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Rejection Reason (Required if Rejecting or Requesting Resubmission):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., UTR not matching statement, amount paid insufficient, blurred receipt"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Internal Admin Audit Notes (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Verified in bank statement at 11:42 AM"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleReviewPayment('REJECTED')}
                  disabled={paymentActionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-colors"
                >
                  Reject Proof
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewPayment('RESUBMISSION_REQUESTED')}
                  disabled={paymentActionLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-colors"
                >
                  Request Resubmission
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewPayment('VERIFIED')}
                  disabled={paymentActionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-lg shadow-emerald-600/20"
                >
                  ✓ Verify & Confirm Seat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: CREATE / EDIT EVENT */}
        {/* ========================================================================= */}
        {isEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white">
                  {editingEventId ? 'Edit Event' : 'Create Departmental Event'}
                </h3>
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Category</label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    >
                      <option value="FLAGSHIP">FLAGSHIP</option>
                      <option value="WORKSHOP">WORKSHOP</option>
                      <option value="CODING">CODING</option>
                      <option value="DEVELOPMENT">DEVELOPMENT</option>
                      <option value="SEMINAR">SEMINAR</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Status</label>
                    <select
                      value={eventForm.status}
                      onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    >
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Registration Deadline</label>
                    <input
                      type="datetime-local"
                      required
                      value={eventForm.registrationDeadline}
                      onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Paid Event Configuration Section */}
                <div className="p-4 rounded-2xl bg-navy-950 border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs">Paid Event Support</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventForm.isPaid}
                        onChange={(e) => setEventForm({ ...eventForm, isPaid: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-white text-xs">Enable Paid Registration</span>
                    </label>
                  </div>

                  {eventForm.isPaid && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Fee in INR (₹)</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={eventForm.feeInRupees}
                            onChange={(e) => setEventForm({ ...eventForm, feeInRupees: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-navy-900 border border-white/10 rounded-xl text-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-300 block mb-1">Payment UPI VPA</label>
                          <input
                            type="text"
                            value={eventForm.paymentUpiId}
                            onChange={(e) => setEventForm({ ...eventForm, paymentUpiId: e.target.value })}
                            className="w-full px-3 py-2 bg-navy-900 border border-white/10 rounded-xl text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Payment Instructions</label>
                        <input
                          type="text"
                          value={eventForm.paymentInstructions}
                          onChange={(e) => setEventForm({ ...eventForm, paymentInstructions: e.target.value })}
                          className="w-full px-3 py-2 bg-navy-900 border border-white/10 rounded-xl text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: TEAM MEMBER ADD/EDIT (With Photo Upload) */}
        {/* ========================================================================= */}
        {isTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white">
                  {editingMemberId ? 'Edit Team Member & Change Photo' : 'Add Committee Member'}
                </h3>
                <button
                  onClick={() => setIsTeamModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Photo Upload Card */}
              <div className="p-4 rounded-2xl bg-navy-950 border border-white/10 flex items-center gap-4">
                <img
                  src={teamForm.photoUrl}
                  alt={teamForm.name || 'Member Preview'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-electric-cyan shrink-0"
                />
                <div className="space-y-1.5 flex-1">
                  <label className="text-[11px] font-bold uppercase text-slate-300 block">
                    Upload & Change Member Photo:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setMemberPhotoFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:bg-white/10 file:text-white w-full"
                    />
                    <button
                      type="button"
                      onClick={handleUploadMemberPhoto}
                      disabled={uploadingMemberPhoto || !memberPhotoFile}
                      className="px-3 py-1 rounded-lg bg-electric-blue text-white text-xs font-semibold hover:bg-blue-600 disabled:opacity-40 shrink-0"
                    >
                      {uploadingMemberPhoto ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveTeamMember} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Designation</label>
                    <select
                      value={teamForm.designationId}
                      onChange={(e) => {
                        const sel = designations.find((d) => d._id === e.target.value);
                        setTeamForm({
                          ...teamForm,
                          designationId: e.target.value,
                          role: sel?.title || teamForm.role,
                          tier: (sel?.tier as any) || teamForm.tier,
                        });
                      }}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    >
                      <option value="">Select Designation...</option>
                      {designations.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.title} ({d.tier})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Public Role Title</label>
                    <input
                      type="text"
                      required
                      value={teamForm.role}
                      onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Department</label>
                    <input
                      type="text"
                      value={teamForm.department}
                      onChange={(e) => setTeamForm({ ...teamForm, department: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Academic Year</label>
                    <select
                      value={teamForm.academicYear}
                      onChange={(e) => setTeamForm({ ...teamForm, academicYear: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    >
                      <option value="FE">First Year (FE)</option>
                      <option value="SE">Second Year (SE)</option>
                      <option value="TE">Third Year (TE)</option>
                      <option value="BE">Final Year (BE)</option>
                      <option value="FACULTY">Faculty Coordinator</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Photo URL / Asset Path</label>
                  <input
                    type="text"
                    required
                    value={teamForm.photoUrl}
                    onChange={(e) => setTeamForm({ ...teamForm, photoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Short Biography</label>
                  <textarea
                    rows={2}
                    value={teamForm.bio}
                    onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsTeamModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600"
                  >
                    Save Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ACTIVITIES & ACHIEVEMENTS ADD/EDIT */}
        {/* ========================================================================= */}
        {isActivityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white">
                  {editingActivityId ? 'Edit Departmental Record' : 'Add Departmental Activity or Achievement'}
                </h3>
                <button
                  onClick={() => setIsActivityModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveActivity} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Winner at State-Level Hackathon 2026 / Expert Session on Cloud"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Type *</label>
                    <select
                      value={activityForm.type}
                      onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    >
                      <option value="ACTIVITY">Departmental Activity / Workshop</option>
                      <option value="ACHIEVEMENT">Student / Faculty Achievement</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={activityForm.date}
                      onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide details about the session, competition, organizing faculty, or participating students..."
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. AI/ML, Cloud Computing, Hackathon, Research"
                    value={activityForm.tags}
                    onChange={(e) => setActivityForm({ ...activityForm, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsActivityModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: CONFIGURABLE DESIGNATION */}
        {/* ========================================================================= */}
        {isDesgModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-md bg-navy-900 border border-white/15 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white">Create Club Designation</h3>
                <button onClick={() => setIsDesgModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveDesignation} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Designation Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Technical Architect"
                    value={desgForm.title}
                    onChange={(e) => setDesgForm({ ...desgForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Tier / Hierarchy</label>
                  <select
                    value={desgForm.tier}
                    onChange={(e) => setDesgForm({ ...desgForm, tier: e.target.value as any })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  >
                    <option value="FACULTY">FACULTY</option>
                    <option value="PRESIDENT">PRESIDENT</option>
                    <option value="VICE_PRESIDENT">VICE_PRESIDENT</option>
                    <option value="EXECUTIVE">EXECUTIVE</option>
                    <option value="COMMITTEE">COMMITTEE</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Description / Responsibility</label>
                  <input
                    type="text"
                    value={desgForm.description}
                    onChange={(e) => setDesgForm({ ...desgForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsDesgModalOpen(false)}
                    className="px-4 py-1.5 rounded-xl bg-white/5 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-electric-blue text-white text-xs font-bold"
                  >
                    Create Designation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: CREATE ALBUM */}
        {/* ========================================================================= */}
        {isAlbumModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-navy-900 border border-white/15 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white">Create Completed Event Album</h3>
                <button onClick={() => setIsAlbumModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateAlbum} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Album / Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kachurli Ashram Shala Community Visit 2026"
                    value={albumForm.title}
                    onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Category</label>
                    <select
                      value={albumForm.category}
                      onChange={(e) => setAlbumForm({ ...albumForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    >
                      <option value="FLAGSHIP">FLAGSHIP</option>
                      <option value="COMMUNITY">COMMUNITY</option>
                      <option value="WORKSHOP">WORKSHOP</option>
                      <option value="COMPETITION">COMPETITION</option>
                      <option value="SYMPOSIUM">SYMPOSIUM</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Event Date</label>
                    <input
                      type="date"
                      required
                      value={albumForm.eventDate}
                      onChange={(e) => setAlbumForm({ ...albumForm, eventDate: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    placeholder="/assets/events/Kachurli_Ashram_Shala_Event.jpg"
                    value={albumForm.coverImageUrl}
                    onChange={(e) => setAlbumForm({ ...albumForm, coverImageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={albumForm.description}
                    onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAlbumModalOpen(false)}
                    className="px-4 py-1.5 rounded-xl bg-white/5 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-electric-blue text-white text-xs font-bold"
                  >
                    Create Album
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: UPLOAD MEDIA TO ALBUM */}
        {/* ========================================================================= */}
        {uploadingAlbumId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-md bg-navy-900 border border-white/15 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white">Upload Media to Album</h3>
                <button onClick={() => setUploadingAlbumId(null)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Select Photo or Video</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Delivered automatically via Cloudinary CDN with local persistent storage backup.
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Media Caption (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Students demonstrating robotics project"
                    value={uploadMediaCaption}
                    onChange={(e) => setUploadMediaCaption(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setUploadingAlbumId(null)}
                    className="px-4 py-1.5 rounded-xl bg-white/5 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUploadMedia(uploadingAlbumId)}
                    className="px-4 py-1.5 rounded-xl bg-electric-blue text-white text-xs font-bold"
                  >
                    Upload Media
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
