import Registration from './registrationModel.js';
import Event from '../events/eventModel.js';
import PaymentProof from '../payments/paymentModel.js';
import { saveUploadedFile } from '../../utils/fileStorage.js';
import { AppError } from '../../utils/AppError.js';
import { sendFreeEventRegistrationEmail } from '../../utils/emailService.js';

export const registerForEvent = async (req, res, next) => {
  const body = req.validatedBody || req.body || {};
  const {
    eventId,
    fullName,
    name,
    email,
    department,
    academicYear,
    prn,
    prnOrRoll,
    phone,
    college,
    notes,
    isGroupRegistration,
    groupName,
    utrNumber,
    utrReference,
    payerUpiId,
  } = body;

  const userId = req.userId || null;

  if (!eventId) {
    return next(new AppError('eventId is required', 400));
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  if (event.status !== 'PUBLISHED') {
    return next(new AppError('Registrations are currently closed for this event', 400));
  }

  // Determine user information
  const regName = fullName || name || req.user?.fullName || req.user?.name;
  const regEmail = (email || req.user?.email || '').trim().toLowerCase();
  const regDept = department || req.user?.department || 'Computer Engineering';
  const regYear = academicYear || req.user?.academicYear || 'SE';
  const regPrn = prnOrRoll || prn || req.user?.prn || '';
  const regPhone = phone || req.user?.phone || '';
  const regCollege = college || "MVPS's K.B.T. College of Engineering, Nashik";

  if (!regName) {
    return next(new AppError('Participant name is required', 400));
  }
  if (!regEmail) {
    return next(new AppError('Email address is required', 400));
  }

  // Parse group members if provided
  let parsedGroupMembers = [];
  if (body.groupMembers) {
    if (typeof body.groupMembers === 'string') {
      try {
        parsedGroupMembers = JSON.parse(body.groupMembers);
      } catch {
        parsedGroupMembers = [];
      }
    } else if (Array.isArray(body.groupMembers)) {
      parsedGroupMembers = body.groupMembers;
    }
  }

  // Check existing registration
  const duplicateQuery = {
    eventId,
    status: { $in: ['REGISTERED', 'WAITLISTED', 'ATTENDED'] },
    $or: [{ email: regEmail }, ...(userId ? [{ userId }] : [])],
  };

  const existing = await Registration.findOne(duplicateQuery);
  if (existing) {
    const whatsappLink = event.whatsappGroupUrl || event.whatsappLink || 'https://chat.whatsapp.com/ACES-KBTCOE-Events';
    return res.status(200).json({
      success: true,
      alreadyRegistered: true,
      message: 'You are already registered for this event.',
      registration: existing,
      ticketId: existing.ticketId,
      whatsappGroupUrl: whatsappLink,
    });
  }

  const isPaid = Boolean(event.isPaid);
  const fee = event.fee || event.feeAmountInPaise || 0;
  const utr = utrReference || utrNumber || '';

  // Generate unique Ticket ID first so screenshot filename embeds event code & registration ticket
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timeSlice = Date.now().toString().slice(-4);
  const ticketId = `ACES-${event.category || 'EVT'}-${randomHex}${timeSlice}`;
  const eventCode = (event.eventCode || event.slug || 'EVT').toUpperCase().replace(/[^A-Z0-9_-]/g, '');

  // Process payment screenshot upload if present with Event custom code and registration ticket ID
  let screenshotUrl = '';
  if (req.file) {
    try {
      const customFilename = `${eventCode}_${ticketId}_receipt`;
      screenshotUrl = await saveUploadedFile(req.file, 'payments', customFilename);
    } catch (err) {
      console.warn('Screenshot upload warning:', err.message);
    }
  }

  // Initial registration status
  let initialStatus = 'REGISTERED';
  let initialPaymentStatus = 'FREE';

  if (isPaid) {
    if (screenshotUrl || utr) {
      initialStatus = 'WAITLISTED';
      initialPaymentStatus = 'PROOF_SUBMITTED';
    } else {
      initialStatus = 'WAITLISTED';
      initialPaymentStatus = 'AWAITING_PAYMENT';
    }
  }

  const registration = await Registration.create({
    ticketId,
    eventId,
    userId,
    fullName: regName,
    name: regName,
    email: regEmail,
    department: regDept,
    academicYear: regYear,
    prn: regPrn,
    prnOrRoll: regPrn,
    phone: regPhone,
    college: regCollege,
    isGroupRegistration: Boolean(isGroupRegistration || parsedGroupMembers.length > 0),
    groupName: groupName || (isGroupRegistration ? `${regName}'s Team` : ''),
    groupMembers: parsedGroupMembers,
    paymentScreenshotUrl: screenshotUrl,
    utrReference: utr,
    status: initialStatus,
    paymentStatus: initialPaymentStatus,
    isPaidEvent: isPaid,
    amountDue: fee,
    notes,
  });

  // If paid proof submitted, also create a PaymentProof entry so admin verification queue catches it
  if (isPaid && (screenshotUrl || utr)) {
    try {
      await PaymentProof.create({
        registrationId: registration._id,
        eventId,
        userId: userId || undefined,
        amountInPaise: fee,
        utrNumber: utr || `UTR-REF-${ticketId}`,
        payerUpiId: payerUpiId || '',
        receiptUrl: screenshotUrl || '',
        verificationStatus: 'PENDING',
      });
    } catch (err) {
      console.warn('PaymentProof log creation warning:', err.message);
    }
  }

  const whatsappGroupUrl = event.whatsappGroupUrl || event.whatsappLink || 'https://chat.whatsapp.com/ACES-KBTCOE-Events';

  if (!isPaid) {
    await Event.findByIdAndUpdate(eventId, {
      $inc: { registrationCount: 1, registeredCount: 1 },
    });

    // Send confirmation pass email immediately for free event registration
    sendFreeEventRegistrationEmail({
      to: regEmail,
      studentName: regName,
      eventTitle: event.title,
      ticketId,
      eventDate: event.startDate
        ? new Date(event.startDate).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : '',
      timeString: event.timeString || '',
      venue: event.venue || 'Seminar Hall, KBTCOE',
      whatsappGroupUrl,
      isGroupRegistration: Boolean(isGroupRegistration || parsedGroupMembers.length > 0),
      groupName: groupName || (isGroupRegistration ? `${regName}'s Team` : ''),
      groupMembers: parsedGroupMembers,
    }).catch((err) => console.error('[FreeEventEmail Error]', err.message));
  }

  res.status(201).json({
    success: true,
    message: isPaid
      ? (screenshotUrl || utr
          ? 'Registration received with payment screenshot! Verification is underway.'
          : 'Registration recorded. Please upload payment proof to confirm your slot.')
      : 'Successfully registered for event!',
    registration,
    ticketId,
    whatsappGroupUrl,
  });
};

export const cancelRegistration = async (req, res, next) => {
  const { id } = req.params;
  const registration = await Registration.findById(id);
  if (!registration) {
    return next(new AppError('Registration not found', 404));
  }

  if (registration.userId.toString() !== req.userId && !['SUPER_ADMIN', 'ADMIN', 'PRESIDENT'].includes(req.user.role)) {
    return next(new AppError('Unauthorized', 403));
  }

  registration.status = 'CANCELLED';
  await registration.save();

  await Event.findByIdAndUpdate(registration.eventId, {
    $inc: { registrationCount: -1, registeredCount: -1 },
  });

  res.status(200).json({
    success: true,
    message: 'Registration cancelled',
  });
};

export const getMyRegistrations = async (req, res) => {
  const registrations = await Registration.find({
    userId: req.userId,
    status: { $ne: 'CANCELLED' },
  })
    .populate('eventId')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: registrations.length,
    registrations,
  });
};

export const getEventAttendees = async (req, res) => {
  const { eventId } = req.params;
  const attendees = await Registration.find({ eventId })
    .populate('userId', 'fullName name email prn department phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: attendees.length,
    attendees,
    registrations: attendees,
  });
};

export const updateAttendance = async (req, res, next) => {
  const { id } = req.params;
  const { status, attended } = req.body;

  const newStatus = status || (attended ? 'ATTENDED' : 'REGISTERED');
  const isAttended = newStatus === 'ATTENDED';

  const registration = await Registration.findByIdAndUpdate(
    id,
    {
      status: newStatus,
      attended: isAttended,
      attendanceMarkedAt: isAttended ? new Date() : null,
    },
    { new: true }
  );

  if (!registration) {
    return next(new AppError('Registration not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Attendance updated successfully',
    registration,
  });
};

export const exportAttendeesCSV = async (req, res, next) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  const attendees = await Registration.find({ eventId }).sort({ createdAt: 1 });

  const headers = 'Name,Email,Department,Academic Year,PRN,Phone,Status,Payment Status,Attended,Registered At\n';
  const rows = attendees
    .map(
      (a) =>
        `"${a.fullName || a.name}","${a.email}","${a.department || ''}","${a.academicYear || ''}","${a.prn || a.prnOrRoll || ''}","${a.phone || ''}","${a.status}","${a.paymentStatus}","${a.attended ? 'Yes' : 'No'}","${a.createdAt.toISOString()}"`
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${event.slug}-attendees.csv"`);
  res.status(200).send(headers + rows);
};
