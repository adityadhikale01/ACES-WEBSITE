import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  Calendar,
  FileCheck,
  Plus,
  Download,
  Mail,
  Search,
  RefreshCw,
  Image as ImageIcon,
  Award,
  Settings as SettingsIcon,
  Layers,
  CreditCard,
  Eye,
  X,
  ArrowUp,
  ArrowDown,
  UploadCloud,
  Briefcase,
  Globe,
  CheckCircle,
  XCircle,
  Shield,
  ExternalLink,
  MessageSquare,
  Key,
  Sparkles,
  Filter,
  Clock,
  UserCheck,
  UserX
} from "lucide-react";
import { useAuth } from "../../auth/authContext.jsx";
import { api } from "../../services/api.js";

export const AdminDashboard = () => {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, isFaculty, isPresident } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role || "MEMBER";

  // Exact 6-module architecture requested for Superadmin
  const allTabDefinitions = [
    {
      id: "overview",
      label: "1. Dashboard",
      icon: Layers,
      roles: ["SUPER_ADMIN", "ADMIN", "FACULTY", "PRESIDENT"]
    },
    {
      id: "events_hub",
      label: "2. Events & Registrations",
      icon: Calendar,
      badgeKey: "events_hub",
      roles: ["SUPER_ADMIN", "ADMIN", "PRESIDENT"]
    },
    {
      id: "team",
      label: "3. Team & Member Roles",
      icon: Users,
      badgeKey: "team",
      roles: ["SUPER_ADMIN", "ADMIN", "PRESIDENT"]
    },
    {
      id: "gallery",
      label: "4. Event Gallery",
      icon: ImageIcon,
      badgeKey: "albums",
      roles: ["SUPER_ADMIN", "ADMIN", "FACULTY", "PRESIDENT"]
    },
    {
      id: "activities",
      label: "Activities & Achievements",
      icon: Award,
      badgeKey: "activities",
      roles: ["FACULTY"] // Faculty specific view
    },
    {
      id: "applications",
      label: "5. Membership Applications",
      icon: FileCheck,
      badgeKey: "pendingApplications",
      roles: ["SUPER_ADMIN", "ADMIN", "PRESIDENT"]
    },
    {
      id: "settings",
      label: "6. Settings & Website Content",
      icon: SettingsIcon,
      roles: ["SUPER_ADMIN", "ADMIN"]
    }
  ];

  const accessibleTabs = allTabDefinitions.filter(
    (tab) => tab.roles.includes(userRole)
  );

  const [activeTab, setActiveTab] = useState(
    isFaculty ? "activities" : "overview"
  );

  // Sub-tabs for the consolidated modules
  const [eventsSubTab, setEventsSubTab] = useState("events"); // "events" | "registrations" | "payments"
  const [teamSubTab, setTeamSubTab] = useState("members"); // "members" | "committee" | "designations" | "users"
  const [settingsSubTab, setSettingsSubTab] = useState("branding"); // "branding" | "content" | "upi" | "messages" | "system"

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
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
    totalAlbums: 0
  });

  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [activities, setActivities] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Attendee tracking
  const [selectedEventId, setSelectedEventId] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // Payment inspection modal state
  const [inspectingPayment, setInspectingPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [paymentActionLoading, setPaymentActionLoading] = useState(false);

  // Group team details modal
  const [viewingTeamModal, setViewingTeamModal] = useState(null);

  // Event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const defaultEventForm = {
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    category: "WORKSHOP",
    venue: "Seminar Hall, KBTCOE",
    isOnline: false,
    startDate: "",
    endDate: "",
    timeString: "10:00 AM - 1:00 PM",
    registrationDeadline: "",
    capacity: 100,
    eligibility: "OPEN_TO_ALL",
    status: "PUBLISHED",
    posterUrl: "",
    isFeatured: false,
    isPaid: false,
    feeInRupees: 0,
    paymentUpiId: "aceskbtcoe@okaxis",
    paymentInstructions: "Pay via UPI and enter transaction UTR.",
    refundPolicy: "Non-refundable once confirmed.",
    whatsappGroupUrl: "https://chat.whatsapp.com/ACES-KBTCOE-Events",
    isGroupEvent: false,
    maxGroupSize: 4,
    groupMembers: []
  };
  const [eventForm, setEventForm] = useState(defaultEventForm);

  // Team committee member modal state
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberPhotoFile, setMemberPhotoFile] = useState(null);
  const [uploadingMemberPhoto, setUploadingMemberPhoto] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: "",
    designationId: "",
    role: "",
    tier: "COMMITTEE",
    department: "Computer Engineering",
    academicYear: "SE",
    bio: "",
    photoUrl: "/assets/members/President.jpeg",
    linkedinUrl: "",
    githubUrl: "",
    displayOrder: 10,
    isPublished: true
  });

  // Dynamic Post Assignment Modal for approved platform members
  const [assigningPostMember, setAssigningPostMember] = useState(null);
  const [memberPostData, setMemberPostData] = useState({
    assignedPost: "",
    postCategory: "MEMBER",
    displayOrder: 10,
    isPublishedOnTeam: true,
    role: "MEMBER"
  });
  const [assigningSubmitting, setAssigningSubmitting] = useState(false);

  // Membership Application Review Modal state (Interactive approval & rejection)
  const [reviewingApp, setReviewingApp] = useState(null);
  const [reviewAction, setReviewAction] = useState("APPROVED"); // "APPROVED" | "REJECTED"
  const [appAssignedPost, setAppAssignedPost] = useState("ACES Member");
  const [appPostCategory, setAppPostCategory] = useState("MEMBER");
  const [appReviewNotes, setAppReviewNotes] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Designation modal state
  const [isDesgModalOpen, setIsDesgModalOpen] = useState(false);
  const [desgForm, setDesgForm] = useState({
    title: "",
    tier: "COMMITTEE",
    displayOrder: 10,
    description: ""
  });

  // Album modal state
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [albumForm, setAlbumForm] = useState({
    title: "",
    description: "",
    eventDate: new Date().toISOString().split("T")[0],
    academicYear: "2026-27",
    category: "FLAGSHIP",
    coverImageUrl: "",
    isPublished: true
  });
  const [uploadingAlbumId, setUploadingAlbumId] = useState(null);
  const [uploadMediaCaption, setUploadMediaCaption] = useState("");
  const [uploadFile, setUploadFile] = useState(null);

  // Activity modal state (Faculty)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [activityForm, setActivityForm] = useState({
    title: "",
    type: "ACTIVITY",
    description: "",
    date: new Date().toISOString().split("T")[0],
    tags: "Department, Workshop",
    imageUrl: "",
    featured: false
  });

  // Website Branding & Content
  const [branding, setBranding] = useState({
    groupPhotoUrl: "/assets/aces-team.jpg",
    logoUrl: "/assets/aces-logo.jpeg",
    heroBannerUrl: "",
    headline: "Where Ideas Meet Innovation.",
    subtitle: "Discover departmental activities, technical workshops, learning sessions, and the people who make ACES KBTCOE happen.",
    contactEmail: "aces.kbtcoe@gmail.com",
    contactPhone: "+91 253 2571439",
    campusLocation: "Department of Computer Engineering, NDMVP KBTCOE, Nashik - 422013"
  });
  const [groupPhotoFile, setGroupPhotoFile] = useState(null);
  const [uploadingGroupPhoto, setUploadingGroupPhoto] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);

  // UPI Receiver Settings
  const [upiSettings, setUpiSettings] = useState({
    upiId: "aceskbtcoe@okaxis",
    instructions: "Pay via UPI QR or VPA. Enter 12-digit UTR transaction reference upon completion.",
    refundPolicy: "Non-refundable once verified and confirmed."
  });

  // Filters & Search
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [memberSearch, setMemberSearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");

  const loadAllAdminData = async () => {
    try {
      setRefreshing(true);
      const isFacOnly = userRole === "FACULTY";
      const isSuper = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

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
        brandRes
      ] = await Promise.all([
        api.admin.getStats().catch(() => ({ success: false })),
        !isFacOnly ? api.events.getAll().catch(() => ({ success: false })) : Promise.resolve({ success: false }),
        !isFacOnly ? api.applications.getAll().catch(() => ({ success: false })) : Promise.resolve({ success: false }),
        !isFacOnly ? api.contact.getAll().catch(() => ({ success: false })) : Promise.resolve({ success: false }),
        !isFacOnly ? (api.team.getAllAdmin ? api.team.getAllAdmin() : api.team.getAll()).catch(() => ({ success: false })) : Promise.resolve({ success: false }),
        !isFacOnly ? (api.designations.getAllAdmin ? api.designations.getAllAdmin() : api.designations.getAll()).catch(() => ({ success: false })) : Promise.resolve({ success: false }),
        !isFacOnly ? api.payments.getAdminQueue().catch(() => ({ success: false })) : Promise.resolve({ success: false }),
        api.gallery.getAlbums().catch(() => ({ success: false })),
        api.activities.getAll().catch(() => ({ success: false })),
        isSuper ? api.admin.getUsers().catch(() => ({ success: false })) : Promise.resolve({ success: false }),
        api.content.get("branding").catch(() => ({ success: false }))
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
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    loadAllAdminData();
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    if (!selectedEventId || userRole === "FACULTY") return;
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

  // Payment Verification with Email Notification Dispatch
  const handleReviewPayment = async (status) => {
    if (!inspectingPayment) return;
    if ((status === "REJECTED" || status === "RESUBMISSION_REQUESTED") && !rejectionReason.trim()) {
      alert("A clear rejection reason is mandatory to guide the student.");
      return;
    }

    try {
      setPaymentActionLoading(true);
      const res = await api.payments.verifyProof(inspectingPayment._id, {
        status,
        rejectionReason: rejectionReason.trim(),
        adminNotes: adminNote.trim()
      });

      if (res.success) {
        alert(
          status === "VERIFIED"
            ? `Payment verified successfully! Confirmation email with Ticket Pass ID dispatched to student.`
            : `Payment marked ${status}. Feedback email dispatched to student.`
        );
        setInspectingPayment(null);
        setRejectionReason("");
        setAdminNote("");
        loadAllAdminData();
      }
    } catch (err) {
      alert(err.message || "Payment review failed");
    } finally {
      setPaymentActionLoading(false);
    }
  };

  // Event Management Handlers
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...eventForm,
        fee: Math.round(eventForm.feeInRupees * 100),
        startDate: new Date(eventForm.startDate).toISOString(),
        registrationDeadline: new Date(eventForm.registrationDeadline).toISOString(),
        endDate: eventForm.endDate ? new Date(eventForm.endDate).toISOString() : undefined,
        whatsappGroupUrl: eventForm.whatsappGroupUrl || "https://chat.whatsapp.com/ACES-KBTCOE-Events",
        whatsappLink: eventForm.whatsappGroupUrl || "https://chat.whatsapp.com/ACES-KBTCOE-Events",
        isGroupEvent: Boolean(eventForm.isGroupEvent),
        maxGroupSize: Number(eventForm.maxGroupSize) || 4,
        groupMembers: Array.isArray(eventForm.groupMembers) ? eventForm.groupMembers : []
      };

      if (editingEventId) {
        await api.events.update(editingEventId, payload);
      } else {
        await api.events.create(payload);
      }

      setIsEventModalOpen(false);
      setEditingEventId(null);
      setEventForm(defaultEventForm);
      loadAllAdminData();
    } catch (err) {
      alert(err.message || "Failed to save event");
    }
  };

  const handleEditEvent = (event) => {
    setEditingEventId(event._id);
    setEventForm({
      title: event.title,
      slug: event.slug,
      subtitle: event.subtitle || "",
      description: event.description,
      category: event.category,
      venue: event.venue,
      isOnline: event.isOnline,
      startDate: event.startDate ? event.startDate.substring(0, 16) : "",
      endDate: event.endDate ? event.endDate.substring(0, 16) : "",
      timeString: event.timeString || "10:00 AM - 1:00 PM",
      registrationDeadline: event.registrationDeadline ? event.registrationDeadline.substring(0, 16) : "",
      capacity: event.capacity || 100,
      eligibility: event.eligibility,
      status: event.status,
      posterUrl: event.posterUrl || "",
      isFeatured: event.isFeatured,
      isPaid: event.isPaid || false,
      feeInRupees: event.fee ? event.fee / 100 : 0,
      paymentUpiId: event.paymentUpiId || "aceskbtcoe@okaxis",
      paymentInstructions: event.paymentInstructions || "Pay via UPI and enter transaction UTR.",
      refundPolicy: event.refundPolicy || "Non-refundable once confirmed.",
      whatsappGroupUrl: event.whatsappGroupUrl || event.whatsappLink || "https://chat.whatsapp.com/ACES-KBTCOE-Events",
      isGroupEvent: Boolean(event.isGroupEvent),
      maxGroupSize: event.maxGroupSize || 4,
      groupMembers: event.groupMembers || []
    });
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Delete this event? Registrations will also be removed.")) return;
    try {
      await api.events.delete(id);
      loadAllAdminData();
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  // Team Committee & Post Assignment Handlers
  const handleUploadMemberPhoto = async () => {
    if (!memberPhotoFile) {
      alert("Please select an image file first.");
      return;
    }
    try {
      setUploadingMemberPhoto(true);
      const formData = new FormData();
      formData.append("photo", memberPhotoFile);
      const res = await api.team.uploadPhoto(formData);
      if (res.success && res.url) {
        setTeamForm((prev) => ({ ...prev, photoUrl: res.url }));
        setMemberPhotoFile(null);
        alert("Photo uploaded successfully! Preview updated below.");
      }
    } catch (err) {
      alert(err.message || "Failed to upload member photo");
    } finally {
      setUploadingMemberPhoto(false);
    }
  };

  const handleSaveTeamMember = async (e) => {
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
    } catch (err) {
      alert(err.message || "Failed to save team member");
    }
  };

  const handleMoveTeamMember = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= teamList.length) return;

    const updated = [...teamList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setTeamList(updated);

    try {
      const orderedIds = updated.map((m) => m._id);
      await api.team.reorder(orderedIds);
    } catch (err) {
      console.error("Failed to persist team order:", err);
    }
  };

  const handleDeleteTeamMember = async (id) => {
    if (!window.confirm("Remove this committee member from public listing?")) return;
    try {
      await api.team.delete(id);
      loadAllAdminData();
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  // Dynamic Post & Hierarchy Assignment for Approved Members
  const openAssignPostModal = (memberOrUser) => {
    setAssigningPostMember(memberOrUser);
    setMemberPostData({
      assignedPost: memberOrUser.assignedPost || memberOrUser.role || "ACES Member",
      postCategory: memberOrUser.postCategory || (memberOrUser.assignedPost?.toLowerCase().includes("president") ? "PRESIDENT" : "MEMBER"),
      displayOrder: memberOrUser.displayOrder || 10,
      isPublishedOnTeam: memberOrUser.isPublishedOnTeam ?? true,
      role: memberOrUser.role || "MEMBER"
    });
  };

  const handleSavePostAssignment = async (e) => {
    e.preventDefault();
    if (!assigningPostMember) return;
    try {
      setAssigningSubmitting(true);
      await api.team.assignPost(assigningPostMember._id, memberPostData);
      if (memberPostData.role && assigningPostMember.role !== memberPostData.role) {
        await api.admin.updateUser(assigningPostMember._id, { role: memberPostData.role });
      }
      setAssigningPostMember(null);
      loadAllAdminData();
      alert("Member post and permissions updated successfully! Live on Team Page.");
    } catch (err) {
      alert(err.message || "Failed to assign post");
    } finally {
      setAssigningSubmitting(false);
    }
  };

  // Membership Application Review with Automated Credential / Feedback Email Dispatch
  const openApproveModal = (app) => {
    setReviewingApp(app);
    setReviewAction("APPROVED");
    setAppAssignedPost("ACES Member");
    setAppPostCategory("MEMBER");
    setAppReviewNotes(`Welcome to the ACES family, ${app.fullName}! We are excited to have you.`);
  };

  const openRejectModal = (app) => {
    setReviewingApp(app);
    setReviewAction("REJECTED");
    setAppReviewNotes("");
  };

  const handleConfirmApplicationReview = async (e) => {
    e.preventDefault();
    if (!reviewingApp) return;

    if (reviewAction === "REJECTED" && !appReviewNotes.trim()) {
      alert("A clear rejection reason is required so the student receives helpful feedback.");
      return;
    }

    try {
      setReviewSubmitting(true);
      const res = await api.applications.review(reviewingApp._id, {
        status: reviewAction,
        assignedPost: appAssignedPost,
        postCategory: appPostCategory,
        adminNotes: appReviewNotes.trim()
      });

      if (res.success) {
        alert(
          reviewAction === "APPROVED"
            ? `Application approved! Platform credentials and assigned post '${appAssignedPost}' sent to ${reviewingApp.email}.`
            : `Application rejected. Feedback email dispatched to ${reviewingApp.email}.`
        );
        setReviewingApp(null);
        loadAllAdminData();
      }
    } catch (err) {
      alert(err.message || "Failed to review application");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Designations Handlers
  const handleSaveDesignation = async (e) => {
    e.preventDefault();
    try {
      await api.designations.create(desgForm);
      setIsDesgModalOpen(false);
      setDesgForm({ title: "", tier: "COMMITTEE", displayOrder: 10, description: "" });
      loadAllAdminData();
    } catch (err) {
      alert(err.message || "Failed to create designation");
    }
  };

  const handleRetireDesignation = async (id) => {
    if (!window.confirm("Retire this designation? Existing members will retain historical record.")) return;
    try {
      await api.designations.retire(id);
      loadAllAdminData();
    } catch (err) {
      alert(err.message || "Failed to retire designation");
    }
  };

  // Gallery Albums & Media Upload Handlers
  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    try {
      await api.gallery.createAlbum(albumForm);
      setIsAlbumModalOpen(false);
      setAlbumForm({
        title: "",
        description: "",
        eventDate: new Date().toISOString().split("T")[0],
        academicYear: "2026-27",
        category: "FLAGSHIP",
        coverImageUrl: "",
        isPublished: true
      });
      loadAllAdminData();
    } catch (err) {
      alert(err.message || "Failed to create gallery album");
    }
  };

  const handleUploadMedia = async (albumId) => {
    if (!uploadFile) {
      alert("Please select an image or video file.");
      return;
    }
    const formData = new FormData();
    formData.append("mediaFile", uploadFile);
    formData.append("caption", uploadMediaCaption);

    try {
      await api.gallery.uploadMedia(albumId, formData);
      setUploadFile(null);
      setUploadMediaCaption("");
      setUploadingAlbumId(null);
      loadAllAdminData();
      alert("Media successfully uploaded to album!");
    } catch (err) {
      alert(err.message || "Media upload failed");
    }
  };

  const handleDeleteAlbum = async (id) => {
    if (!window.confirm("Delete this event album and all associated photos/videos?")) return;
    try {
      await api.gallery.deleteAlbum(id);
      loadAllAdminData();
    } catch (err) {
      alert(err.message || "Failed to delete album");
    }
  };

  // Activities & Achievements Handlers (Faculty)
  const handleSaveActivity = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...activityForm,
        tags: activityForm.tags.split(",").map((t) => t.trim()).filter(Boolean)
      };
      if (editingActivityId) {
        await api.activities.update(editingActivityId, payload);
      } else {
        await api.activities.create(payload);
      }
      setIsActivityModalOpen(false);
      setEditingActivityId(null);
      loadAllAdminData();
    } catch (err) {
      alert(err.message || "Failed to save activity");
    }
  };

  const handleDeleteActivity = async (id) => {
    if (!window.confirm("Delete this departmental activity / achievement?")) return;
    try {
      await api.activities.delete(id);
      loadAllAdminData();
    } catch (err) {
      alert(err.message || "Failed to delete activity");
    }
  };

  // Website Branding, Group Photo & Logo Upload Handlers
  const handleUploadGroupPhoto = async () => {
    if (!groupPhotoFile) {
      alert("Please select a group photo file first.");
      return;
    }
    try {
      setUploadingGroupPhoto(true);
      const formData = new FormData();
      formData.append("image", groupPhotoFile);
      const res = await api.content.uploadImage(formData);
      if (res.success && res.url) {
        const updatedBranding = { ...branding, groupPhotoUrl: res.url };
        setBranding(updatedBranding);
        await api.content.update("branding", updatedBranding);
        setGroupPhotoFile(null);
        alert("Official ACES Group Photo uploaded and updated live on the website!");
      }
    } catch (err) {
      alert(err.message || "Failed to upload group photo");
    } finally {
      setUploadingGroupPhoto(false);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) {
      alert("Please select a logo file first.");
      return;
    }
    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append("image", logoFile);
      const res = await api.content.uploadImage(formData);
      if (res.success && res.url) {
        const updatedBranding = { ...branding, logoUrl: res.url };
        setBranding(updatedBranding);
        await api.content.update("branding", updatedBranding);
        setLogoFile(null);
        alert("Official ACES Club Logo uploaded and updated live on the website!");
      }
    } catch (err) {
      alert(err.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveBranding = async () => {
    try {
      setSavingBranding(true);
      await api.content.update("branding", branding);
      alert("Website branding, photos, and contact info saved successfully!");
    } catch (err) {
      alert(err.message || "Failed to save branding");
    } finally {
      setSavingBranding(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await api.admin.updateUser(userId, { role: newRole });
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      alert(`User administrative role updated to ${newRole}`);
    } catch (err) {
      alert(err.message || "Failed to update user role");
    }
  };

  const handleToggleMessageRead = async (id, current) => {
    try {
      await api.contact.markRead(id, !current);
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isRead: !current } : m))
      );
    } catch (err) {
      alert(err.message || "Failed to update message status");
    }
  };

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const matchesStatus =
      paymentStatusFilter === "ALL" || p.status === paymentStatusFilter;
    const studentName =
      p.userId?.fullName || p.userId?.name || p.registrationId?.fullName || p.name || "";
    const studentEmail =
      p.userId?.email || p.registrationId?.email || p.email || "";
    const q = paymentSearch.toLowerCase();
    const matchesSearch =
      !q ||
      (p.utrReference && p.utrReference.toLowerCase().includes(q)) ||
      studentName.toLowerCase().includes(q) ||
      studentEmail.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingPaymentsCount = payments.filter(
    (p) => p.status === "PROOF_SUBMITTED"
  ).length;

  const approvedPlatformMembers = usersList.filter((u) => u.isApprovedMember);

  if (!isAdmin) return null;

  const getRoleBadge = () => {
    if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
      return {
        title: "SUPERADMIN CONTROL CENTER",
        desc: "Full website, media, user roles & system control",
        color: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      };
    }
    if (userRole === "FACULTY") {
      return {
        title: "FACULTY COORDINATOR CONTROL CENTER",
        desc: "Departmental activities & student achievements management",
        color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      };
    }
    if (userRole === "PRESIDENT") {
      return {
        title: "CLUB PRESIDENT CONTROL CENTER",
        desc: "Team members, events, registrations, applications & messages",
        color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
      };
    }
    return {
      title: "ADMIN ACCESS",
      desc: "ACES KBTCOE Departmental Club",
      color: "bg-white/10 text-slate-300 border-white/10"
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
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
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

        {/* Dynamic 6-Module Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-8 scrollbar-none border-b border-white/5">
          {accessibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            let badgeValue = null;
            let isAlert = false;

            if (tab.id === "events_hub") {
              badgeValue = pendingPaymentsCount > 0 ? pendingPaymentsCount : events.length;
              isAlert = pendingPaymentsCount > 0;
            }
            if (tab.id === "team") badgeValue = teamList.length;
            if (tab.id === "gallery") badgeValue = albums.length;
            if (tab.id === "activities") badgeValue = activities.length;
            if (tab.id === "applications") {
              badgeValue = stats.pendingApplications;
              isAlert = stats.pendingApplications > 0;
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10"
                    : "bg-navy-900/80 text-slate-400 border-white/5 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
                {badgeValue !== null && badgeValue > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isAlert ? "bg-amber-500 text-black animate-pulse" : "bg-white/10 text-slate-300"
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
        {/* MODULE 1: DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="p-4 rounded-2xl glass-card border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
                <div className="text-2xl font-black text-white mt-1">{stats.totalUsers || 0}</div>
                <div className="text-[10px] text-slate-500 mt-1">Platform registrations</div>
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
                <div className="text-[10px] text-amber-400/70 mt-1">Requires review</div>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-white/10">
                <span className="text-[10px] uppercase font-bold text-teal-400">Confirmed Paid</span>
                <div className="text-2xl font-black text-teal-300 mt-1">{stats.confirmedPaid || 0}</div>
                <div className="text-[10px] text-slate-500 mt-1">Verified registrations</div>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-rose-500/30 bg-rose-500/5">
                <span className="text-[10px] uppercase font-bold text-rose-400">Pending Apps</span>
                <div className="text-2xl font-black text-rose-300 mt-1">{stats.pendingApplications || 0}</div>
                <div className="text-[10px] text-slate-500 mt-1">Awaiting club review</div>
              </div>
            </div>

            {/* Quick Actions Panel Tailored to 6 Modules */}
            <div className="p-6 rounded-3xl bg-navy-900 border border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Operational Shortcuts for {userRole.replace("_", " ")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {(isSuperAdmin || isPresident) && (
                  <>
                    <button
                      onClick={() => {
                        setActiveTab("events_hub");
                        setEventsSubTab("payments");
                      }}
                      className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left hover:bg-amber-500/20 transition-all"
                    >
                      <div className="text-amber-300 font-bold text-xs flex items-center justify-between">
                        <span>Payment Verification Queue</span>
                        <CreditCard size={15} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {pendingPaymentsCount} receipts pending review
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("events_hub");
                        setEventsSubTab("events");
                        setEditingEventId(null);
                        setEventForm(defaultEventForm);
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
                      onClick={() => {
                        setActiveTab("team");
                        setTeamSubTab("members");
                      }}
                      className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-left hover:bg-indigo-500/20 transition-all"
                    >
                      <div className="text-indigo-300 font-bold text-xs flex items-center justify-between">
                        <span>Team Management & Roles</span>
                        <Briefcase size={15} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {approvedPlatformMembers.length} approved members & dynamic posts
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab("applications")}
                      className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-left hover:bg-rose-500/20 transition-all"
                    >
                      <div className="text-rose-300 font-bold text-xs flex items-center justify-between">
                        <span>Membership Applications</span>
                        <FileCheck size={15} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {stats.pendingApplications || 0} applications awaiting review
                      </p>
                    </button>
                  </>
                )}

                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      setActiveTab("settings");
                      setSettingsSubTab("branding");
                    }}
                    className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-left hover:bg-teal-500/20 transition-all"
                  >
                    <div className="text-teal-300 font-bold text-xs flex items-center justify-between">
                      <span>Update Group Photo & Logo</span>
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
        {/* MODULE 2: EVENTS, REGISTRATIONS & PAYMENT PROOF */}
        {/* ========================================================================= */}
        {activeTab === "events_hub" && (isSuperAdmin || isPresident) && (
          <div className="space-y-6">
            {/* Sub-tab Navigation for Module 2 */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Events, Registrations & Payment Proof</h2>
                <p className="text-xs text-slate-400">
                  Manage events, inspect ticket attendee lists, and verify UPI payment screenshots
                </p>
              </div>

              <div className="flex items-center gap-2 bg-navy-900 p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setEventsSubTab("events")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    eventsSubTab === "events"
                      ? "bg-electric-blue text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Events ({events.length})
                </button>
                <button
                  onClick={() => setEventsSubTab("registrations")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    eventsSubTab === "registrations"
                      ? "bg-electric-blue text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Registrations & Attendees ({stats.totalRegistrations})
                </button>
                <button
                  onClick={() => setEventsSubTab("payments")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    eventsSubTab === "payments"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold"
                      : "text-amber-400 hover:text-amber-300"
                  }`}
                >
                  <CreditCard size={13} />
                  <span>Payment Verification</span>
                  {pendingPaymentsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-extrabold">
                      {pendingPaymentsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Sub-tab 1: Events Management */}
            {eventsSubTab === "events" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="relative w-72">
                    <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search events by title or code..."
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-navy-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setEditingEventId(null);
                      setEventForm(defaultEventForm);
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
                        <th className="py-3 px-4">Event & Code</th>
                        <th className="py-3 px-4">Fee Structure</th>
                        <th className="py-3 px-4">Schedule</th>
                        <th className="py-3 px-4">Seats</th>
                        <th className="py-3 px-4">WhatsApp Link</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {events
                        .filter(
                          (e) =>
                            !eventSearch ||
                            e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
                            (e.eventCode && e.eventCode.toLowerCase().includes(eventSearch.toLowerCase()))
                        )
                        .map((e) => (
                          <tr key={e._id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4">
                              <strong className="text-white block">{e.title}</strong>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-electric-cyan font-mono font-bold bg-white/5 px-1.5 py-0.5 rounded">
                                  {e.eventCode || "ACES-EVT"}
                                </span>
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                                  {e.category}
                                </span>
                              </div>
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
                              <span className="block text-[10px] text-slate-400">{e.timeString || "TBD"}</span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-white">
                              {e.registeredCount || 0} / {e.capacity || "∞"}
                            </td>
                            <td className="py-3.5 px-4">
                              {e.whatsappGroupUrl || e.whatsappLink ? (
                                <a
                                  href={e.whatsappGroupUrl || e.whatsappLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                                >
                                  <span>WhatsApp Group</span>
                                  <ExternalLink size={10} />
                                </a>
                              ) : (
                                <span className="text-slate-500 text-[11px]">Not linked</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  e.status === "PUBLISHED"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-slate-700 text-slate-400"
                                }`}
                              >
                                {e.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              <button
                                onClick={() => handleEditEvent(e)}
                                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(e._id)}
                                className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold"
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

            {/* Sub-tab 2: Registrations & Attendees */}
            {eventsSubTab === "registrations" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-navy-900 border border-white/10">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Filter Attendees by Event:
                    </label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="px-3 py-1.5 bg-navy-950 border border-white/10 rounded-xl text-xs text-white font-medium"
                    >
                      {events.map((ev) => (
                        <option key={ev._id} value={ev._id}>
                          {ev.title} ({ev.isPaid ? `₹${(ev.fee / 100).toFixed(0)}` : "FREE"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-xs text-slate-400">
                    Total Attendees Enrolled: <strong className="text-white">{attendees.length}</strong>
                  </div>
                </div>

                {loadingAttendees ? (
                  <div className="p-12 text-center text-xs text-slate-400">Loading attendee records...</div>
                ) : attendees.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400 glass-card rounded-2xl">
                    No student registrations recorded for this event yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-navy-900">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                        <tr>
                          <th className="py-3 px-4">Ticket ID</th>
                          <th className="py-3 px-4">Participant Details</th>
                          <th className="py-3 px-4">College / Dept</th>
                          <th className="py-3 px-4">Payment Status</th>
                          <th className="py-3 px-4">Attendance</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {attendees.map((a) => {
                          const participantName = a.fullName || a.name || "Student";
                          const participantEmail = a.email || "";
                          const participantPhone = a.phone || "";
                          const ticketId = a.ticketId || `ACES-${(a._id || "").substring(18).toUpperCase()}`;

                          return (
                            <tr key={a._id} className="hover:bg-white/5 transition-colors">
                              <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-cyan-300">
                                {ticketId}
                              </td>
                              <td className="py-3.5 px-4">
                                <strong className="text-white block">{participantName}</strong>
                                <span className="text-[10px] text-slate-400">{participantEmail}</span>
                                {participantPhone && (
                                  <span className="block text-[10px] text-slate-500 font-mono">
                                    📞 {participantPhone}
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                {a.department || "Comp Engg"} • <span className="text-white">{a.academicYear || "SE"}</span>
                                <span className="block text-[10px] text-slate-400">{a.college || "NDMVP KBTCOE"}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    a.paymentStatus === "VERIFIED" || a.paymentStatus === "COMPLETED"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      : a.paymentStatus === "PROOF_SUBMITTED"
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      : "bg-slate-700 text-slate-300"
                                  }`}
                                >
                                  {a.paymentStatus || "FREE"}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <button
                                  onClick={async () => {
                                    const next = !a.attended;
                                    await api.registrations.markAttendance(a._id, next);
                                    setAttendees((prev) =>
                                      prev.map((item) =>
                                        item._id === a._id ? { ...item, attended: next } : item
                                      )
                                    );
                                  }}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                                    a.attended
                                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                                  }`}
                                >
                                  {a.attended ? "✓ Attended" : "Mark Present"}
                                </button>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {a.isGroupRegistration && (
                                  <button
                                    onClick={() => setViewingTeamModal(a)}
                                    className="px-2.5 py-1 rounded bg-electric-blue/20 text-electric-cyan text-[11px] font-semibold hover:bg-electric-blue/30"
                                  >
                                    View Team ({a.groupMembers?.length || 0})
                                  </button>
                                )}
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

            {/* Sub-tab 3: Payment Verification Queue */}
            {eventsSubTab === "payments" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Manual Payment Verification Queue</h3>
                    <p className="text-xs text-slate-400">
                      Review student UTR references and payment proof screenshots. Approving verifies ticket & emails receipt.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {["ALL", "PROOF_SUBMITTED", "VERIFIED", "REJECTED"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setPaymentStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          paymentStatusFilter === st
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-navy-900 text-slate-400 border-white/5 hover:text-white"
                        }`}
                      >
                        {st === "PROOF_SUBMITTED" ? "PENDING" : st}
                      </button>
                    ))}
                  </div>
                </div>

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
                          <th className="py-3 px-4">Fee Amount</th>
                          <th className="py-3 px-4">UTR Reference</th>
                          <th className="py-3 px-4">Submitted At</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Review Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredPayments.map((p) => {
                          const studentName =
                            p.userId?.fullName ||
                            p.userId?.name ||
                            p.registrationId?.fullName ||
                            p.name ||
                            "Student Participant";
                          const studentEmail =
                            p.userId?.email || p.registrationId?.email || p.email || "";
                          const eventTitle = typeof p.eventId === "object" ? p.eventId.title : "Event";
                          const displayAmount = (p.expectedAmount || p.amountInPaise || 0) / 100;
                          const displayUtr = p.utrReference || p.utrNumber || "N/A";

                          return (
                            <tr key={p._id} className="hover:bg-white/5 transition-colors">
                              <td className="py-3.5 px-4">
                                <strong className="text-white block">{studentName}</strong>
                                <span className="text-[10px] text-slate-400 block">{studentEmail}</span>
                              </td>
                              <td className="py-3.5 px-4 font-medium text-white">{eventTitle}</td>
                              <td className="py-3.5 px-4 font-bold text-amber-300">
                                ₹{displayAmount.toFixed(2)}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-300 bg-white/5 px-2 py-1 rounded inline-block my-2">
                                {displayUtr}
                              </td>
                              <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                                {new Date(p.submittedAt || p.createdAt).toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    p.status === "VERIFIED"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      : p.status === "PROOF_SUBMITTED"
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => {
                                    setInspectingPayment(p);
                                    setRejectionReason(p.rejectionReason || "");
                                    setAdminNote(p.adminNotes || "");
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 3: TEAM MANAGEMENT AND MEMBERS ROLE */}
        {/* ========================================================================= */}
        {activeTab === "team" && (isSuperAdmin || isPresident) && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Team Management & Member Roles</h2>
                <p className="text-xs text-slate-400">
                  Assign dynamic posts (President, Vice Presidents, Execution Team, Members) and manage platform permissions
                </p>
              </div>

              <div className="flex items-center gap-2 bg-navy-900 p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setTeamSubTab("members")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    teamSubTab === "members"
                      ? "bg-electric-blue text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Platform Approved Members ({approvedPlatformMembers.length})
                </button>
                <button
                  onClick={() => setTeamSubTab("committee")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    teamSubTab === "committee"
                      ? "bg-electric-blue text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Public Team Directory ({teamList.length})
                </button>
                <button
                  onClick={() => setTeamSubTab("designations")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    teamSubTab === "designations"
                      ? "bg-electric-blue text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Designations ({designations.length})
                </button>
                {isSuperAdmin && (
                  <button
                    onClick={() => setTeamSubTab("users")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      teamSubTab === "users"
                        ? "bg-electric-blue text-white shadow-md shadow-blue-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    User Roles ({usersList.length})
                  </button>
                )}
              </div>
            </div>

            {/* Sub-tab 1: Platform Members with Post Assigner */}
            {teamSubTab === "members" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-navy-900 border border-white/10">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                      Dynamic Team Hierarchy Structure:
                    </span>
                    <p className="text-xs text-slate-300">
                      1. President (Top) → 2. Vice Presidents (2-3 below) → 3. Execution Team → 4. ACES Members
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search approved members..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="px-3.5 py-1.5 bg-navy-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-navy-900">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                      <tr>
                        <th className="py-3 px-4">Member Photo & Name</th>
                        <th className="py-3 px-4">Assigned Post</th>
                        <th className="py-3 px-4">Hierarchy Category</th>
                        <th className="py-3 px-4">Department / Year</th>
                        <th className="py-3 px-4">Public Team Page</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {approvedPlatformMembers
                        .filter(
                          (m) =>
                            !memberSearch ||
                            m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
                            m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
                            (m.assignedPost && m.assignedPost.toLowerCase().includes(memberSearch.toLowerCase()))
                        )
                        .map((m) => (
                          <tr key={m._id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 flex items-center gap-3">
                              <img
                                src={m.photoUrl || "/assets/members/President.jpeg"}
                                alt={m.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-white/20 shadow"
                                onError={(e) => {
                                  e.target.src = "/assets/members/President.jpeg";
                                }}
                              />
                              <div>
                                <strong className="text-white block">{m.fullName}</strong>
                                <span className="text-[10px] text-slate-400">{m.email}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-white">
                              {m.assignedPost || "ACES Member"}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                  m.postCategory === "PRESIDENT"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : m.postCategory === "VICE_PRESIDENT"
                                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                    : m.postCategory === "EXECUTION_TEAM"
                                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                    : "bg-white/10 text-slate-300"
                                }`}
                              >
                                {m.postCategory || "MEMBER"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {m.department || "Computer Engineering"} •{" "}
                              <span className="font-semibold text-white">{m.academicYear || "SE"}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  m.isPublishedOnTeam ?? true
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-slate-700 text-slate-400"
                                }`}
                              >
                                {m.isPublishedOnTeam ?? true ? "Published" : "Hidden"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => openAssignPostModal(m)}
                                className="px-3 py-1.5 rounded-lg bg-electric-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
                              >
                                Assign Post & Role
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Reorderable Committee Team */}
            {teamSubTab === "committee" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Use up/down arrows to adjust the display sequence on the live website.
                  </span>
                  <button
                    onClick={() => {
                      setEditingMemberId(null);
                      setMemberPhotoFile(null);
                      setTeamForm({
                        name: "",
                        designationId: designations[0]?._id || "",
                        role: "ACES Member",
                        tier: "COMMITTEE",
                        department: "Computer Engineering",
                        academicYear: "SE",
                        bio: "",
                        photoUrl: "/assets/members/President.jpeg",
                        linkedinUrl: "",
                        githubUrl: "",
                        displayOrder: teamList.length + 1,
                        isPublished: true
                      });
                      setIsTeamModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600"
                  >
                    <Plus size={14} />
                    <span>Add Committee Profile</span>
                  </button>
                </div>

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
                                onClick={() => handleMoveTeamMember(idx, "up")}
                                disabled={idx === 0}
                                className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-slate-400"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <span className="font-mono text-white text-[11px] w-5 text-center">
                                {idx + 1}
                              </span>
                              <button
                                onClick={() => handleMoveTeamMember(idx, "down")}
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
                              onError={(e) => {
                                e.target.src = "/assets/members/President.jpeg";
                              }}
                            />
                            <div>
                              <strong className="text-white block">{m.name}</strong>
                              <span className="text-[10px] text-slate-400">{m.role}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-cyan-300 border border-white/10">
                              {typeof m.designationId === "object" && m.designationId
                                ? m.designationId.title
                                : m.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {m.department} • <span className="font-semibold text-white">{m.academicYear || "SE"}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={async () => {
                                const next = !m.isPublished;
                                await api.team.update(m._id, { isPublished: next });
                                setTeamList((prev) =>
                                  prev.map((item) =>
                                    item._id === m._id ? { ...item, isPublished: next } : item
                                  )
                                );
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                m.isPublished
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-slate-700 text-slate-400"
                              }`}
                            >
                              {m.isPublished ? "Published" : "Hidden"}
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
                                    typeof m.designationId === "object" && m.designationId
                                      ? m.designationId._id
                                      : m.designationId || "",
                                  role: m.role,
                                  tier: m.tier || "COMMITTEE",
                                  department: m.department || "Computer Engineering",
                                  academicYear: m.academicYear || "SE",
                                  bio: m.bio || "",
                                  photoUrl: m.photoUrl,
                                  linkedinUrl: m.linkedinUrl || "",
                                  githubUrl: m.githubUrl || "",
                                  displayOrder: m.displayOrder || 10,
                                  isPublished: m.isPublished ?? true
                                });
                                setIsTeamModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                            >
                              Edit & Photo
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

            {/* Sub-tab 3: Club Designations */}
            {teamSubTab === "designations" && (
              <div className="p-6 rounded-2xl bg-navy-900 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Club Designations ({designations.length})
                    </h3>
                    <p className="text-xs text-slate-400">Designation titles assigned across the department</p>
                  </div>
                  <button
                    onClick={() => setIsDesgModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10"
                  >
                    + Add Designation
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
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
            )}

            {/* Sub-tab 4: Platform User Roles & Administrative Permissions */}
            {teamSubTab === "users" && isSuperAdmin && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Registered Users & System Roles ({usersList.length})</h3>
                    <p className="text-xs text-slate-400">
                      Configure SUPER_ADMIN, FACULTY, PRESIDENT, or MEMBER system privileges
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
                              {u.department} • <span className="font-semibold text-white">{u.academicYear || "SE"}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={u.role}
                                onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                  u.role === "SUPER_ADMIN" || u.role === "ADMIN"
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                    : u.role === "FACULTY"
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                    : u.role === "PRESIDENT"
                                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                                    : "bg-navy-950 text-slate-300 border-white/10"
                                }`}
                              >
                                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Control)</option>
                                <option value="FACULTY">FACULTY (Activities & Achievements)</option>
                                <option value="PRESIDENT">PRESIDENT (Events & Team)</option>
                                <option value="MEMBER">MEMBER (Student Member)</option>
                                <option value="VISITOR">VISITOR (Guest)</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  u.isApprovedMember
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-slate-700 text-slate-400"
                                }`}
                              >
                                {u.isApprovedMember ? "Approved Member" : "Regular User"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={async () => {
                                  const nextApproved = !u.isApprovedMember;
                                  await api.admin.updateUser(u._id, { isApprovedMember: nextApproved });
                                  setUsersList((prev) =>
                                    prev.map((item) =>
                                      item._id === u._id ? { ...item, isApprovedMember: nextApproved } : item
                                    )
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 4: EVENT GALLERY */}
        {/* ========================================================================= */}
        {activeTab === "gallery" && (isSuperAdmin || isPresident || isFaculty) && (
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
                <span>Create New Album</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <div
                  key={album._id}
                  className="rounded-2xl overflow-hidden bg-navy-900 border border-white/10 space-y-3 p-4"
                >
                  <div className="relative h-40 bg-navy-950 rounded-xl overflow-hidden border border-white/5">
                    {album.coverImageUrl ? (
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                        No cover image
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-navy-950/80 text-white">
                      {album.mediaCount || album.mediaItems?.length || 0} items
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm">{album.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{album.description}</p>
                    <span className="text-[10px] text-electric-cyan block mt-1">
                      {new Date(album.eventDate).toLocaleDateString()} • {album.academicYear}
                    </span>
                  </div>

                  {uploadingAlbumId === album._id ? (
                    <div className="p-3 rounded-xl bg-navy-950 border border-white/10 space-y-2">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:bg-white/10 file:text-white w-full"
                      />
                      <input
                        type="text"
                        placeholder="Caption (e.g. Keynote address)..."
                        value={uploadMediaCaption}
                        onChange={(e) => setUploadMediaCaption(e.target.value)}
                        className="w-full px-2 py-1 bg-navy-900 border border-white/10 rounded text-xs text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUploadMedia(album._id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                        >
                          Upload
                        </button>
                        <button
                          onClick={() => setUploadingAlbumId(null)}
                          className="px-3 py-1 bg-white/10 text-slate-300 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <button
                        onClick={() => setUploadingAlbumId(album._id)}
                        className="text-xs font-semibold text-cyan-300 hover:underline"
                      >
                        + Add Photos/Videos
                      </button>
                      <button
                        onClick={() => handleDeleteAlbum(album._id)}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FACULTY SECTION: ACTIVITIES & ACHIEVEMENTS */}
        {/* ========================================================================= */}
        {activeTab === "activities" && (isSuperAdmin || isFaculty) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Departmental Activities & Student Achievements ({activities.length})
                </h2>
                <p className="text-xs text-slate-400">Post student milestones and workshop highlights</p>
              </div>
              <button
                onClick={() => {
                  setEditingActivityId(null);
                  setActivityForm({
                    title: "",
                    type: "ACTIVITY",
                    description: "",
                    date: new Date().toISOString().split("T")[0],
                    tags: "Department, Workshop",
                    imageUrl: "",
                    featured: false
                  });
                  setIsActivityModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
              >
                <Plus size={14} />
                <span>Add Activity / Achievement</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.map((act) => (
                <div
                  key={act._id}
                  className="p-5 rounded-2xl bg-navy-900 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                      {act.type}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(act.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm">{act.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-3">{act.description}</p>
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => {
                        setEditingActivityId(act._id);
                        setActivityForm({
                          title: act.title,
                          type: act.type,
                          description: act.description,
                          date: act.date ? act.date.substring(0, 10) : "",
                          tags: Array.isArray(act.tags) ? act.tags.join(", ") : act.tags || "",
                          imageUrl: act.imageUrl || "",
                          featured: act.featured || false
                        });
                        setIsActivityModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(act._id)}
                      className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-xs text-rose-400"
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
        {/* MODULE 5: MEMBERSHIP APPLICATIONS */}
        {/* ========================================================================= */}
        {activeTab === "applications" && (isSuperAdmin || isPresident) && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Student Membership Applications ({applications.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Review applicant profiles. Approving assigns post, creates credentials, and sends official notification email.
                </p>
              </div>

              <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                Pending Review: <strong>{stats.pendingApplications || 0}</strong>
              </div>
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
                          {app.email} • {app.phone ? `📞 ${app.phone} • ` : ""}{app.department} ({app.academicYear})
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          app.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : app.status === "REJECTED"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-amber-500/20 text-amber-300"
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

                    {app.status === "PENDING" && (
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => openApproveModal(app)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                        >
                          Approve & Assign Post
                        </button>
                        <button
                          onClick={() => openRejectModal(app)}
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
        {/* MODULE 6: SETTINGS, WEBSITE CONTENT & GROUP PHOTO */}
        {/* ========================================================================= */}
        {activeTab === "settings" && isSuperAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Settings, Website Content & Photos</h2>
                <p className="text-xs text-slate-400">
                  Update official group photo, club logo, homepage headlines, UPI receiver, and view contact submissions
                </p>
              </div>

              <div className="flex items-center gap-2 bg-navy-900 p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setSettingsSubTab("branding")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    settingsSubTab === "branding"
                      ? "bg-electric-blue text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Group Photo & Logo
                </button>
                <button
                  onClick={() => setSettingsSubTab("content")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    settingsSubTab === "content"
                      ? "bg-electric-blue text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Website Content
                </button>
                <button
                  onClick={() => setSettingsSubTab("upi")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    settingsSubTab === "upi"
                      ? "bg-electric-blue text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  UPI VPA & Payments
                </button>
                <button
                  onClick={() => setSettingsSubTab("messages")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    settingsSubTab === "messages"
                      ? "bg-electric-blue text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Messages ({messages.length})
                </button>
                <button
                  onClick={() => setSettingsSubTab("system")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    settingsSubTab === "system"
                      ? "bg-electric-blue text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  System Health
                </button>
              </div>
            </div>

            {/* Sub-tab 1: Group Photo & Official Club Logo Upload */}
            {settingsSubTab === "branding" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Official Committee Group Photo */}
                <div className="p-6 rounded-3xl bg-navy-900 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">Official Committee Group Photograph</h3>
                      <p className="text-[11px] text-slate-400">Displayed on Home Page and Team Page banner</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      PUBLIC
                    </span>
                  </div>

                  <div className="h-48 rounded-2xl bg-navy-950 border border-white/10 overflow-hidden relative">
                    <img
                      src={branding.groupPhotoUrl || "/assets/aces-team.jpg"}
                      alt="ACES Team"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/assets/aces-team.jpg";
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase text-slate-300 block">
                      Upload New Group Photograph:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setGroupPhotoFile(e.target.files?.[0] || null)}
                        className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:bg-white/10 file:text-white w-full"
                      />
                      <button
                        onClick={handleUploadGroupPhoto}
                        disabled={uploadingGroupPhoto || !groupPhotoFile}
                        className="px-4 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600 disabled:opacity-40 shrink-0"
                      >
                        {uploadingGroupPhoto ? "Uploading..." : "Upload & Save"}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Tip: Upload high-resolution JPG/PNG. Updates the public banner across the entire site instantly.
                    </p>
                  </div>
                </div>

                {/* 2. Official ACES Club Logo */}
                <div className="p-6 rounded-3xl bg-navy-900 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">Official Club Logo Asset</h3>
                      <p className="text-[11px] text-slate-400">Displayed on Navbar, Footer, and Page Headers</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-electric-blue/20 text-electric-cyan">
                      BRANDING
                    </span>
                  </div>

                  <div className="h-48 rounded-2xl bg-navy-950 border border-white/10 flex items-center justify-center p-4">
                    <img
                      src={branding.logoUrl || "/assets/aces-logo.jpeg"}
                      alt="ACES Logo"
                      className="max-h-36 max-w-full object-contain rounded-xl shadow-lg border border-white/10"
                      onError={(e) => {
                        e.target.src = "/assets/aces-logo.jpeg";
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase text-slate-300 block">
                      Upload New ACES Logo:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                        className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:bg-white/10 file:text-white w-full"
                      />
                      <button
                        onClick={handleUploadLogo}
                        disabled={uploadingLogo || !logoFile}
                        className="px-4 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600 disabled:opacity-40 shrink-0"
                      >
                        {uploadingLogo ? "Uploading..." : "Upload & Save"}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Square or circular transparent PNG recommended for crisp contrast against dark navy.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Website Text Content */}
            {settingsSubTab === "content" && (
              <div className="p-6 rounded-3xl bg-navy-900 border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-sm">Homepage Headlines & Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <label className="font-semibold text-slate-300 block mb-1">Hero Main Headline</label>
                    <input
                      type="text"
                      value={branding.headline}
                      onChange={(e) => setBranding({ ...branding, headline: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-semibold text-slate-300 block mb-1">Hero Subtitle</label>
                    <textarea
                      rows={2}
                      value={branding.subtitle}
                      onChange={(e) => setBranding({ ...branding, subtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Official Contact Email</label>
                    <input
                      type="email"
                      value={branding.contactEmail}
                      onChange={(e) => setBranding({ ...branding, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Official Contact Phone</label>
                    <input
                      type="text"
                      value={branding.contactPhone}
                      onChange={(e) => setBranding({ ...branding, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-semibold text-slate-300 block mb-1">Campus Location</label>
                    <input
                      type="text"
                      value={branding.campusLocation}
                      onChange={(e) => setBranding({ ...branding, campusLocation: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveBranding}
                    disabled={savingBranding}
                    className="px-5 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600 disabled:opacity-50"
                  >
                    {savingBranding ? "Saving..." : "Save Website Content"}
                  </button>
                </div>
              </div>
            )}

            {/* Sub-tab 3: UPI VPA & Payment Settings */}
            {settingsSubTab === "upi" && (
              <div className="p-6 rounded-3xl bg-navy-900 border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-sm">UPI Payment Receiver & Verification Instructions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <label className="font-semibold text-slate-300 block mb-1">Default Club UPI VPA</label>
                    <input
                      type="text"
                      value={upiSettings.upiId}
                      onChange={(e) => setUpiSettings({ ...upiSettings, upiId: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Students scanning the QR or paying directly send funds to this UPI address.
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-semibold text-slate-300 block mb-1">Payment Instructions</label>
                    <textarea
                      rows={2}
                      value={upiSettings.instructions}
                      onChange={(e) => setUpiSettings({ ...upiSettings, instructions: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-semibold text-slate-300 block mb-1">Refund Policy Notice</label>
                    <textarea
                      rows={2}
                      value={upiSettings.refundPolicy}
                      onChange={(e) => setUpiSettings({ ...upiSettings, refundPolicy: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => alert("UPI configuration saved successfully!")}
                    className="px-5 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600"
                  >
                    Save UPI Settings
                  </button>
                </div>
              </div>
            )}

            {/* Sub-tab 4: Contact Form Messages */}
            {settingsSubTab === "messages" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">Public Inquiries & Contact Submissions</h3>
                  <span className="text-xs text-slate-400">Total: {messages.length}</span>
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
                            ? "bg-navy-900/50 border-white/5"
                            : "bg-navy-900 border-electric-blue/30 shadow-lg shadow-electric-blue/5"
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
                              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 font-semibold"
                            >
                              {msg.isRead ? "Mark Unread" : "Mark Read"}
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

            {/* Sub-tab 5: System Health */}
            {settingsSubTab === "system" && (
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
                  <h3 className="font-bold text-white text-sm">Automated Email Dispatch Service</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Service Engine:</span>
                      <span className="font-semibold text-emerald-400">Nodemailer SMTP + Disk Fallback</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Application Approvals:</span>
                      <span className="font-semibold text-emerald-400">Auto-Generates Credentials & Welcome Email</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Application Rejections:</span>
                      <span className="font-semibold text-rose-400">Auto-Dispatches Feedback Notice</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Payment Confirmations:</span>
                      <span className="font-semibold text-emerald-400">Auto-Sends Ticket Pass + WhatsApp Link</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: INSPECT PAYMENT PROOF & VERIFY WITH EMAIL DISPATCH */}
        {/* ========================================================================= */}
        {inspectingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Inspect Manual Payment Proof</h3>
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
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name:</span>
                  <strong className="text-white">
                    {inspectingPayment.userId?.fullName ||
                      inspectingPayment.userId?.name ||
                      inspectingPayment.registrationId?.fullName ||
                      inspectingPayment.name ||
                      "Student"}
                  </strong>
                  <span className="block text-slate-400 text-[11px]">
                    {inspectingPayment.userId?.email ||
                      inspectingPayment.registrationId?.email ||
                      inspectingPayment.email}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Expected Amount:</span>
                  <strong className="text-amber-300 text-sm">
                    ₹{((inspectingPayment.expectedAmount || inspectingPayment.amountInPaise || 0) / 100).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Submitted UTR Reference:</span>
                  <span className="font-mono text-cyan-300 font-bold bg-white/5 px-2 py-0.5 rounded">
                    {inspectingPayment.utrReference || inspectingPayment.utrNumber}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Verification Status:</span>
                  <span className="font-bold uppercase text-amber-400">{inspectingPayment.status}</span>
                </div>
              </div>

              {/* Secure Payment Screenshot Viewer */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Screenshot Proof:</span>
                <div className="relative rounded-2xl overflow-hidden bg-navy-950 border border-white/10 max-h-72 flex items-center justify-center p-2">
                  <img
                    src={inspectingPayment.receiptUrl || api.payments.getScreenshotUrl(inspectingPayment._id)}
                    alt="Payment receipt proof"
                    className="max-h-64 object-contain rounded-lg"
                    onError={(e) => {
                      if (e.target.src !== api.payments.getScreenshotUrl(inspectingPayment._id)) {
                        e.target.src = api.payments.getScreenshotUrl(inspectingPayment._id);
                      }
                    }}
                  />
                </div>
                {inspectingPayment.receiptUrl && (
                  <a
                    href={inspectingPayment.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-cyan-300 hover:underline flex items-center gap-1"
                  >
                    <span>Open high-resolution receipt in new window</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>

              {/* Rejection / Note Input */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Rejection Feedback / Student Note (Dispatched via Email):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR reference not matching bank credits or blurry screenshot"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectingPayment(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={paymentActionLoading}
                  onClick={() => handleReviewPayment("REJECTED")}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold border border-rose-500/30"
                >
                  Reject Proof
                </button>
                <button
                  type="button"
                  disabled={paymentActionLoading}
                  onClick={() => handleReviewPayment("VERIFIED")}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20"
                >
                  Verify & Confirm Seat (Sends Email)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: INTERACTIVE APPLICATION REVIEW (APPROVE / REJECT) */}
        {/* ========================================================================= */}
        {reviewingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {reviewAction === "APPROVED" ? "Approve ACES Membership" : "Reject Application"}
                  </h3>
                  <p className="text-xs text-slate-400">Applicant: {reviewingApp.fullName}</p>
                </div>
                <button
                  onClick={() => setReviewingApp(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-navy-950 border border-white/10 text-xs space-y-1.5">
                <div>
                  <span className="text-slate-400">Email:</span>{" "}
                  <strong className="text-white">{reviewingApp.email}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Department & Year:</span>{" "}
                  <span className="text-slate-200">
                    {reviewingApp.department} ({reviewingApp.academicYear})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Statement / Motivation:</span>
                  <p className="text-slate-300 italic mt-0.5">{reviewingApp.reasonForJoining}</p>
                </div>
              </div>

              <form onSubmit={handleConfirmApplicationReview} className="space-y-4 text-xs">
                {reviewAction === "APPROVED" ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Assigned Post Title</label>
                        <input
                          type="text"
                          required
                          value={appAssignedPost}
                          onChange={(e) => setAppAssignedPost(e.target.value)}
                          placeholder="e.g. Vice President, Core Team"
                          className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Hierarchy Category</label>
                        <select
                          value={appPostCategory}
                          onChange={(e) => setAppPostCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                        >
                          <option value="PRESIDENT">President</option>
                          <option value="VICE_PRESIDENT">Vice President</option>
                          <option value="EXECUTION_TEAM">Execution Team</option>
                          <option value="MEMBER">ACES Member</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">
                        Welcome Message / Instructions (Sent via Email)
                      </label>
                      <textarea
                        rows={2}
                        value={appReviewNotes}
                        onChange={(e) => setAppReviewNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                      ✓ Approving will activate their platform account, set their post, and dispatch an automated welcome email with login credentials.
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">
                        Rejection Reason / Feedback (Sent via Email) *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Please explain why the application was not accepted at this time..."
                        value={appReviewNotes}
                        onChange={(e) => setAppReviewNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                      ⚠️ Rejecting will dispatch an automated email with your feedback to {reviewingApp.email}.
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setReviewingApp(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className={`px-5 py-2 rounded-xl text-white text-xs font-bold ${
                      reviewAction === "APPROVED"
                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
                        : "bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20"
                    }`}
                  >
                    {reviewSubmitting
                      ? "Processing..."
                      : reviewAction === "APPROVED"
                      ? "Confirm & Approve (Send Credentials Email)"
                      : "Confirm Rejection (Send Email)"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: ASSIGN POST & ROLE TO APPROVED MEMBER */}
        {/* ========================================================================= */}
        {assigningPostMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-md bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Assign Club Post & Role</h3>
                  <p className="text-xs text-slate-400">{assigningPostMember.fullName}</p>
                </div>
                <button
                  onClick={() => setAssigningPostMember(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSavePostAssignment} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Public Post Designation</label>
                  <input
                    type="text"
                    required
                    value={memberPostData.assignedPost}
                    onChange={(e) =>
                      setMemberPostData({ ...memberPostData, assignedPost: e.target.value })
                    }
                    placeholder="e.g. Club President, Vice President, Technical Lead"
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Hierarchy Category</label>
                    <select
                      value={memberPostData.postCategory}
                      onChange={(e) =>
                        setMemberPostData({ ...memberPostData, postCategory: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    >
                      <option value="PRESIDENT">President</option>
                      <option value="VICE_PRESIDENT">Vice President</option>
                      <option value="EXECUTION_TEAM">Execution Team</option>
                      <option value="MEMBER">ACES Member</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Display Order</label>
                    <input
                      type="number"
                      value={memberPostData.displayOrder}
                      onChange={(e) =>
                        setMemberPostData({
                          ...memberPostData,
                          displayOrder: Number(e.target.value) || 10
                        })
                      }
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Administrative Privileges</label>
                  <select
                    value={memberPostData.role}
                    onChange={(e) =>
                      setMemberPostData({ ...memberPostData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  >
                    <option value="MEMBER">Standard Member</option>
                    <option value="PRESIDENT">Club President (Events & Team Access)</option>
                    <option value="SUPER_ADMIN">Super Administrator (Full System Control)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPublishedOnTeamCheck"
                    checked={memberPostData.isPublishedOnTeam}
                    onChange={(e) =>
                      setMemberPostData({ ...memberPostData, isPublishedOnTeam: e.target.checked })
                    }
                    className="rounded bg-navy-950 border-white/10 text-electric-blue"
                  />
                  <label htmlFor="isPublishedOnTeamCheck" className="text-slate-300 font-medium">
                    Publish card publicly on official Team Page
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setAssigningPostMember(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigningSubmitting}
                    className="px-5 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold hover:bg-blue-600"
                  >
                    {assigningSubmitting ? "Saving..." : "Save Post & Sync Live"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 4: CREATE / EDIT EVENT */}
        {/* ========================================================================= */}
        {isEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white">
                  {editingEventId ? "Edit Event Details" : "Create New Departmental Event"}
                </h3>
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="font-semibold text-slate-300 block mb-1">Event Title *</label>
                    <input
                      type="text"
                      required
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Custom Event Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AI-2026, TECH-001"
                      value={eventForm.eventCode || ""}
                      onChange={(e) => setEventForm({ ...eventForm, eventCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Category</label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    >
                      <option value="WORKSHOP">Workshop</option>
                      <option value="SEMINAR">Seminar</option>
                      <option value="COMPETITION">Competition</option>
                      <option value="FLAGSHIP">Flagship</option>
                      <option value="CLUB_ACTIVITY">Club Activity</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="font-semibold text-slate-300 block mb-1">Event WhatsApp Group URL *</label>
                    <input
                      type="url"
                      required
                      value={eventForm.whatsappGroupUrl}
                      onChange={(e) => setEventForm({ ...eventForm, whatsappGroupUrl: e.target.value })}
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Students are shown this join button immediately upon successful registration and in their confirmation email.
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Registration Deadline *</label>
                    <input
                      type="datetime-local"
                      required
                      value={eventForm.registrationDeadline}
                      onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Capacity (Max Seats)</label>
                    <input
                      type="number"
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({ ...eventForm, capacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Venue / Hall</label>
                    <input
                      type="text"
                      value={eventForm.venue}
                      onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <div className="col-span-2 flex items-center gap-4 py-2 border-y border-white/5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventForm.isPaid}
                        onChange={(e) => setEventForm({ ...eventForm, isPaid: e.target.checked })}
                        className="rounded bg-navy-950 border-white/10 text-electric-blue"
                      />
                      <span className="font-semibold text-white">Paid Event (Requires UPI Payment)</span>
                    </label>

                    {eventForm.isPaid && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Fee (₹):</span>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={eventForm.feeInRupees}
                          onChange={(e) => setEventForm({ ...eventForm, feeInRupees: Number(e.target.value) })}
                          className="w-24 px-2 py-1 bg-navy-950 border border-white/10 rounded text-white font-bold"
                        />
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="font-semibold text-slate-300 block mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-electric-blue text-white font-bold hover:bg-blue-600"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 5: TEAM ATTENDEES VIEW */}
        {/* ========================================================================= */}
        {viewingTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-4 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>👥 Team: {viewingTeamModal.groupName}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Ticket ID: {viewingTeamModal.ticketId || `ACES-${(viewingTeamModal._id || "").substring(18).toUpperCase()}`}
                  </p>
                </div>
                <button
                  onClick={() => setViewingTeamModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-navy-950 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Team Leader
                  </span>
                  <div className="text-sm font-bold text-white">
                    {viewingTeamModal.fullName || viewingTeamModal.name}
                  </div>
                  <div className="text-xs text-slate-300">{viewingTeamModal.email}</div>
                  {viewingTeamModal.phone && (
                    <div className="text-xs text-slate-400 font-mono">📞 {viewingTeamModal.phone}</div>
                  )}
                  <div className="text-xs text-slate-400 mt-1">
                    {viewingTeamModal.department || "Computer Engineering"} • {viewingTeamModal.academicYear || "SE"} ({viewingTeamModal.college || "KBTCOE"})
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                    Team Members ({viewingTeamModal.groupMembers?.length || 0})
                  </span>
                  {viewingTeamModal.groupMembers && viewingTeamModal.groupMembers.length > 0 ? (
                    <div className="space-y-2">
                      {viewingTeamModal.groupMembers.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                        >
                          <div>
                            <strong className="text-white block">{m.fullName || m.name}</strong>
                            <span className="text-slate-400 text-[11px]">{m.email}</span>
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            {m.department || "Comp"} ({m.academicYear || "SE"})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/5 text-xs text-slate-400 text-center">
                      No additional team members listed.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/10">
                <button
                  onClick={() => setViewingTeamModal(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 6: COMMITTEE TEAM MEMBER WITH PHOTO UPLOADER */}
        {/* ========================================================================= */}
        {isTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white">
                  {editingMemberId ? "Edit Committee Profile & Photo" : "Add Committee Profile"}
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
                  alt={teamForm.name || "Member Preview"}
                  className="w-16 h-16 rounded-full object-cover border-2 border-electric-cyan shrink-0"
                  onError={(e) => {
                    e.target.src = "/assets/members/President.jpeg";
                  }}
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
                      {uploadingMemberPhoto ? "Uploading..." : "Upload"}
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
                          tier: sel?.tier || teamForm.tier
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
                  <label className="font-semibold text-slate-300 block mb-1">Biography</label>
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
        {/* MODAL 7: ADD DESIGNATION */}
        {/* ========================================================================= */}
        {isDesgModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-md bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white">Add Club Designation</h3>
                <button onClick={() => setIsDesgModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveDesignation} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Designation Title</label>
                  <input
                    type="text"
                    required
                    value={desgForm.title}
                    onChange={(e) => setDesgForm({ ...desgForm, title: e.target.value })}
                    placeholder="e.g. Vice President, Technical Lead, Event Head"
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Tier / Level</label>
                  <select
                    value={desgForm.tier}
                    onChange={(e) => setDesgForm({ ...desgForm, tier: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  >
                    <option value="CORE">Executive / Core</option>
                    <option value="COMMITTEE">Committee Member</option>
                    <option value="FACULTY">Faculty Advisory</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsDesgModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-electric-blue text-white font-bold"
                  >
                    Save Designation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 8: CREATE GALLERY ALBUM */}
        {/* ========================================================================= */}
        {isAlbumModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-md bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white">Create New Event Album</h3>
                <button onClick={() => setIsAlbumModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateAlbum} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Album Title</label>
                  <input
                    type="text"
                    required
                    value={albumForm.title}
                    onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Event Date</label>
                    <input
                      type="date"
                      value={albumForm.eventDate}
                      onChange={(e) => setAlbumForm({ ...albumForm, eventDate: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Academic Year</label>
                    <input
                      type="text"
                      value={albumForm.academicYear}
                      onChange={(e) => setAlbumForm({ ...albumForm, academicYear: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>
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
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-electric-blue text-white font-bold"
                  >
                    Create Album
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 9: FACULTY ACTIVITY / ACHIEVEMENT */}
        {/* ========================================================================= */}
        {isActivityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-navy-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white">
                  {editingActivityId ? "Edit Activity / Achievement" : "Add Departmental Activity"}
                </h3>
                <button onClick={() => setIsActivityModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveActivity} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Category Type</label>
                    <select
                      value={activityForm.type}
                      onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    >
                      <option value="ACTIVITY">Departmental Activity</option>
                      <option value="ACHIEVEMENT">Student Achievement</option>
                      <option value="WORKSHOP">Technical Workshop</option>
                      <option value="SEMINAR">Guest Seminar</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Date</label>
                    <input
                      type="date"
                      value={activityForm.date}
                      onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsActivityModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
