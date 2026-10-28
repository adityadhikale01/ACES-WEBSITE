import Registration from './registrationModel.js';
import Event from '../events/eventModel.js';
import { AppError } from '../../utils/AppError.js';

export const registerForEvent = async (req, res, next) => {
  const { eventId, name, email, department, academicYear, prn, phone } = req.validatedBody || req.body;
  const userId = req.userId;

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  if (event.status !== 'PUBLISHED') {
    return next(new AppError('Registrations are currently closed for this event', 400));
  }

  const existing = await Registration.findOne({ eventId, userId });
  if (existing) {
    return next(new AppError('You are already registered for this event', 409));
  }

  const initialStatus = event.isPaid ? 'WAITLISTED' : 'REGISTERED';
  const initialPaymentStatus = event.isPaid ? 'AWAITING_PAYMENT' : 'NOT_APPLICABLE';

  const registration = await Registration.create({
    eventId,
    userId,
    name: name || req.user.name,
    email: email || req.user.email,
    department: department || req.user.department,
    academicYear: academicYear || req.user.academicYear,
    prn: prn || req.user.prn,
    phone: phone || req.user.phone,
    status: initialStatus,
    paymentStatus: initialPaymentStatus,
  });

  if (!event.isPaid) {
    await Event.findByIdAndUpdate(eventId, { $inc: { registrationCount: 1 } });
  }

  res.status(201).json({
    success: true,
    message: event.isPaid
      ? 'Registration initiated. Please submit payment proof to confirm your slot.'
      : 'Successfully registered for event!',
    registration,
  });
};

export const getMyRegistrations = async (req, res) => {
  const registrations = await Registration.find({ userId: req.userId })
    .populate('eventId')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: registrations.length,
    registrations,
  });
};

export const getEventAttendees = async (req, res, next) => {
  const { eventId } = req.params;
  const attendees = await Registration.find({ eventId })
    .populate('userId', 'name email prn department phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: attendees.length,
    attendees,
  });
};

export const updateAttendance = async (req, res, next) => {
  const { id } = req.params;
  const { attended } = req.validatedBody || req.body;

  const registration = await Registration.findByIdAndUpdate(
    id,
    {
      attended,
      status: attended ? 'ATTENDED' : 'REGISTERED',
      attendanceMarkedAt: attended ? new Date() : null,
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
        `"${a.name}","${a.email}","${a.department || ''}","${a.academicYear || ''}","${a.prn || ''}","${a.phone || ''}","${a.status}","${a.paymentStatus}","${a.attended ? 'Yes' : 'No'}","${a.createdAt.toISOString()}"`
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${event.slug}-attendees.csv"`);
  res.status(200).send(headers + rows);
};
