import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const emailLogFile = path.resolve(projectRoot, 'backend/uploads/emails.log');

// Ensure email log directory exists
try {
  const dir = path.dirname(emailLogFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
} catch (e) {
  // Ignore directory creation error
}

let dynamicEmailConfig = null;

export const clearTransporterCache = () => {
  dynamicEmailConfig = null;
};

export const getEmailConfig = async () => {
  if (dynamicEmailConfig) return dynamicEmailConfig;

  let host = process.env.SMTP_HOST || '';
  let user = process.env.SMTP_USER || '';
  let pass = process.env.SMTP_PASS || '';
  let port = parseInt(process.env.SMTP_PORT, 10) || 587;
  let from = process.env.EMAIL_FROM || '"ACES KBTCOE" <aces.kbtcoe@gmail.com>';
  let replyTo = process.env.REPLY_TO || 'aces.kbtcoe@gmail.com';
  let headerTitle = 'ACES KBTCOE';
  let headerSubtitle = "Association of Computer Engineering Students • MVPS KBTCOE Nashik";
  let footerDisclaimer = "ACES KBTCOE • Department of Computer Engineering • MVPS's K.B.T. College of Engineering, Udoji Maratha Boarding Campus, Gangapur Road, Nashik - 422013";
  let eventNotes = 'Please bring your college ID card and reach the venue 15 minutes before the start time.';
  let membershipNotes = 'Welcome to the official ACES Committee network. Please log in to complete your profile.';

  try {
    const SiteContent = (await import('../features/content/contentModel.js')).default;
    const content = await SiteContent.findOne({ key: 'email_settings' });
    if (content?.data) {
      const d = content.data;
      if (d.smtpHost) host = d.smtpHost;
      if (d.smtpUser) user = d.smtpUser;
      if (d.smtpPass) pass = d.smtpPass;
      if (d.smtpPort) port = parseInt(d.smtpPort, 10) || port;
      if (d.emailFrom) from = d.emailFrom;
      if (d.replyTo) replyTo = d.replyTo;
      if (d.headerTitle) headerTitle = d.headerTitle;
      if (d.headerSubtitle) headerSubtitle = d.headerSubtitle;
      if (d.footerDisclaimer) footerDisclaimer = d.footerDisclaimer;
      if (d.eventNotes) eventNotes = d.eventNotes;
      if (d.membershipNotes) membershipNotes = d.membershipNotes;
    }
  } catch (err) {
    // If DB is not yet available, fallback to env
  }

  dynamicEmailConfig = {
    host,
    user,
    pass,
    port,
    from,
    replyTo,
    headerTitle,
    headerSubtitle,
    footerDisclaimer,
    eventNotes,
    membershipNotes,
  };

  return dynamicEmailConfig;
};

// Create Nodemailer Transporter dynamically
const getTransporter = async () => {
  const cfg = await getEmailConfig();

  if (cfg.host && cfg.user && cfg.pass) {
    const isGmail = cfg.host.toLowerCase().includes('gmail');
    const transportConfig = isGmail
      ? {
          service: 'gmail',
          auth: { user: cfg.user, pass: cfg.pass },
        }
      : {
          host: cfg.host,
          port: cfg.port,
          secure: cfg.port === 465,
          auth: { user: cfg.user, pass: cfg.pass },
        };
    return nodemailer.createTransport(transportConfig);
  }

  // Development / fallback logger transporter
  return {
    sendMail: async (mailOptions) => {
      const logEntry = `
================================================================================
📧 [ACES EMAIL SERVICE] Outgoing Email (${new Date().toISOString()})
To: ${mailOptions.to}
From: ${mailOptions.from || cfg.from}
Subject: ${mailOptions.subject}
--------------------------------------------------------------------------------
${mailOptions.text || '(HTML Email)'}
--------------------------------------------------------------------------------
HTML Preview:
${mailOptions.html ? mailOptions.html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').substring(0, 300) + '...' : ''}
================================================================================
`;
      console.log(logEntry);

      try {
        fs.appendFileSync(emailLogFile, logEntry);
      } catch (err) {
        // ignore log write failure
      }

      return {
        messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        response: 'Logged to console and emails.log',
      };
    },
  };
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const cfg = await getEmailConfig();
    const mailer = await getTransporter();
    const from = cfg.from || '"ACES KBTCOE" <aces.kbtcoe@gmail.com>';
    const replyTo = cfg.replyTo || undefined;

    const info = await mailer.sendMail({
      from,
      replyTo,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    });

    return { success: true, info };
  } catch (error) {
    console.error('[EmailService Error] Failed to send email to', to, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 1. Membership Application Status Email
 */
export const sendMembershipStatusEmail = async ({
  to,
  fullName,
  status,
  reviewerNotes = '',
  credentials = null,
  assignedPost = 'ACES Member',
}) => {
  const cfg = await getEmailConfig();
  const isApproved = status === 'APPROVED' || status === 'ACCEPTED';
  const subject = isApproved
    ? '🎉 Congratulations! Your ACES KBTCOE Membership Application is Approved'
    : 'Update on Your ACES KBTCOE Membership Application';

  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
  const loginUrl = `${clientUrl}/login`;
  const profileUrl = `${clientUrl}/dashboard`;

  const html = isApproved
    ? `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1d; color: #f1f5f9; padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">${cfg.headerTitle || 'ACES KBTCOE'}</h1>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">${cfg.headerSubtitle || 'Association of Computer Engineering Students • MVPS KBTCOE Nashik'}</p>
      </div>

      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 20px;">
        <h2 style="color: #34d399; margin: 0 0 6px 0; font-size: 18px;">Application Status: Approved!</h2>
        <p style="color: #e2e8f0; margin: 0; font-size: 14px;">Welcome to the official ACES Committee & Member Network.</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
        Dear <strong>${fullName}</strong>,<br><br>
        Congratulations! The ACES Superadmin and Faculty Advisory Committee have reviewed and approved your application. You have been appointed as:
      </p>

      <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 14px; margin: 16px 0; text-align: center;">
        <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; display: block;">Assigned Post / Designation</span>
        <strong style="color: #38bdf8; font-size: 18px;">${assignedPost}</strong>
      </div>

      ${
        credentials
          ? `
      <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <h3 style="color: #f8fafc; font-size: 14px; margin: 0 0 10px 0;">Your ACES Platform Login Credentials:</h3>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><strong>Email:</strong> ${credentials.email}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><strong>Temporary Password:</strong> <code style="background: #1e293b; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${credentials.password}</code></p>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #94a3b8;">${cfg.membershipNotes || 'Please login immediately and update your password, profile photo, phone number, LinkedIn, and GitHub links in your member dashboard.'}</p>
      </div>
      `
          : ''
      }

      ${
        reviewerNotes
          ? `
      <div style="border-left: 3px solid #38bdf8; padding-left: 12px; margin: 16px 0;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0 0 2px 0; text-transform: uppercase;">Reviewer Notes:</p>
        <p style="color: #e2e8f0; font-size: 13px; margin: 0; font-style: italic;">"${reviewerNotes}"</p>
      </div>
      `
          : ''
      }

      <div style="text-align: center; margin: 26px 0;">
        <a href="${loginUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 14px;">
          Login to ACES Platform →
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
        ${cfg.footerDisclaimer || "ACES KBTCOE • Department of Computer Engineering • MVPS's K.B.T. College of Engineering, Udoji Maratha Boarding Campus, Gangapur Road, Nashik"}
      </p>
    </div>
    `
    : `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1d; color: #f1f5f9; padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">${cfg.headerTitle || 'ACES KBTCOE'}</h1>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">${cfg.headerSubtitle || 'Association of Computer Engineering Students • MVPS KBTCOE Nashik'}</p>
      </div>

      <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 20px;">
        <h2 style="color: #fb7185; margin: 0 0 6px 0; font-size: 18px;">Application Status: Not Selected</h2>
        <p style="color: #e2e8f0; margin: 0; font-size: 14px;">Thank you for your interest in joining the ACES Committee.</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
        Dear <strong>${fullName}</strong>,<br><br>
        Thank you for submitting your application to the Association of Computer Engineering Students (ACES). After careful consideration, we regret to inform you that we are unable to offer you a committee appointment for the current cycle.
      </p>

      ${
        reviewerNotes
          ? `
      <div style="background: #111827; border-left: 3px solid #fb7185; padding: 14px; margin: 18px 0; border-radius: 0 8px 8px 0;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0 0 4px 0; text-transform: uppercase;">Review Committee Feedback:</p>
        <p style="color: #e2e8f0; font-size: 13px; margin: 0; font-style: italic;">"${reviewerNotes}"</p>
      </div>
      `
          : ''
      }

      <p style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
        You are still warmly welcomed to participate as an active student attendee in all departmental events, hackathons, and technical workshops organized by ACES throughout the academic year.
      </p>

      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
        ${cfg.footerDisclaimer || "ACES KBTCOE • Department of Computer Engineering • MVPS's K.B.T. College of Engineering, Nashik"}
      </p>
    </div>
    `;

  return sendEmail({ to, subject, html });
};

/**
 * 2. Payment Verified Email with Pass and WhatsApp Group Link
 */
export const sendPaymentVerifiedEmail = async ({
  to,
  studentName,
  eventTitle,
  ticketId,
  amountPaid = 0,
  utrNumber = '',
  whatsappGroupUrl = 'https://chat.whatsapp.com/ACES-KBTCOE-Events',
  eventDate = '',
  venue = 'Seminar Hall, KBTCOE',
}) => {
  const cfg = await getEmailConfig();
  const subject = `🎟️ Payment Verified! Your Pass for ${eventTitle} (${ticketId})`;
  const formattedFee = (amountPaid / 100).toFixed(2);

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1d; color: #f1f5f9; padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">${cfg.headerTitle || 'ACES KBTCOE'}</h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">${cfg.headerSubtitle || 'Official Departmental Event Registration Confirmation'}</p>
    </div>

    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 20px;">
      <h2 style="color: #34d399; margin: 0 0 6px 0; font-size: 18px;">✓ Payment Verified & Seat Confirmed!</h2>
      <p style="color: #e2e8f0; margin: 0; font-size: 14px;">Your registration for <strong>${eventTitle}</strong> is active.</p>
    </div>

    <!-- Pass Ticket Box -->
    <div style="background: #111827; border: 2px dashed #0284c7; border-radius: 14px; padding: 20px; text-align: center; margin: 20px 0;">
      <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; display: block;">Official Ticket Pass ID</span>
      <strong style="color: #38bdf8; font-size: 24px; font-family: monospace; letter-spacing: 2px; display: block; margin: 6px 0;">${ticketId}</strong>
      <span style="color: #64748b; font-size: 12px;">Participant: ${studentName}</span>
    </div>

    <div style="background: #0f172a; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px;">
      <p style="margin: 6px 0; color: #cbd5e1;"><strong>Event:</strong> ${eventTitle}</p>
      ${eventDate ? `<p style="margin: 6px 0; color: #cbd5e1;"><strong>Date & Time:</strong> ${eventDate}</p>` : ''}
      <p style="margin: 6px 0; color: #cbd5e1;"><strong>Venue:</strong> ${venue}</p>
      <p style="margin: 6px 0; color: #cbd5e1;"><strong>Amount Verified:</strong> ₹${formattedFee}</p>
      <p style="margin: 6px 0; color: #cbd5e1;"><strong>UTR / Reference:</strong> <span style="font-family: monospace; color: #38bdf8;">${utrNumber}</span></p>
    </div>

    <!-- Official WhatsApp Group CTA -->
    <div style="background: rgba(37, 211, 102, 0.12); border: 1px solid rgba(37, 211, 102, 0.35); border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0;">
      <h3 style="color: #25d366; margin: 0 0 6px 0; font-size: 16px;">📲 Join the Official Event WhatsApp Group</h3>
      <p style="color: #cbd5e1; font-size: 13px; margin: 0 0 16px 0;">Stay informed about event schedules, resources, team groupings, and urgent announcements.</p>
      <a href="${whatsappGroupUrl}" style="background: #25d366; color: #042f1a; padding: 12px 28px; border-radius: 10px; font-weight: 800; text-decoration: none; display: inline-block; font-size: 14px; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);">
        Join Event WhatsApp Group →
      </a>
    </div>

    <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; margin-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
      ℹ️ ${cfg.eventNotes || 'Please keep this ticket pass handy on the day of the event.'}
    </div>

    <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
      ${cfg.footerDisclaimer || "ACES KBTCOE • Department of Computer Engineering • MVPS's K.B.T. College of Engineering, Nashik"}
    </p>
  </div>
  `;

  return sendEmail({ to, subject, html });
};

/**
 * 3. Free Event Registration Confirmation Email
 */
export const sendFreeEventRegistrationEmail = async ({
  to,
  studentName,
  eventTitle,
  ticketId,
  eventDate = '',
  timeString = '',
  venue = 'Seminar Hall, KBTCOE',
  whatsappGroupUrl = 'https://chat.whatsapp.com/ACES-KBTCOE-Events',
  isGroupRegistration = false,
  groupName = '',
  groupMembers = [],
}) => {
  const cfg = await getEmailConfig();
  const subject = `🎟️ Registration Confirmed! Your Pass for ${eventTitle} (${ticketId})`;

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1d; color: #f1f5f9; padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">${cfg.headerTitle || 'ACES KBTCOE'}</h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">${cfg.headerSubtitle || 'Official Departmental Event Registration Confirmation'}</p>
    </div>

    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 20px;">
      <h2 style="color: #34d399; margin: 0 0 6px 0; font-size: 18px;">✓ Seat Confirmed (Free Event)!</h2>
      <p style="color: #e2e8f0; margin: 0; font-size: 14px;">Your registration for <strong>${eventTitle}</strong> is active and confirmed.</p>
    </div>

    <!-- Pass Ticket Box -->
    <div style="background: #111827; border: 2px dashed #0284c7; border-radius: 14px; padding: 20px; text-align: center; margin: 20px 0;">
      <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; display: block;">Official Ticket Pass ID</span>
      <strong style="color: #38bdf8; font-size: 24px; font-family: monospace; letter-spacing: 2px; display: block; margin: 6px 0;">${ticketId}</strong>
      <span style="color: #64748b; font-size: 12px;">Participant: ${studentName}</span>
      ${isGroupRegistration && groupName ? `<span style="display: block; color: #38bdf8; font-size: 12px; margin-top: 4px;">Team: ${groupName}</span>` : ''}
    </div>

    <div style="background: #0f172a; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px;">
      <p style="margin: 6px 0; color: #cbd5e1;"><strong>Event:</strong> ${eventTitle}</p>
      ${eventDate ? `<p style="margin: 6px 0; color: #cbd5e1;"><strong>Date & Time:</strong> ${eventDate} ${timeString ? `(${timeString})` : ''}</p>` : ''}
      <p style="margin: 6px 0; color: #cbd5e1;"><strong>Venue:</strong> ${venue}</p>
      <p style="margin: 6px 0; color: #cbd5e1;"><strong>Registration Fee:</strong> <span style="color: #34d399; font-weight: bold;">FREE</span></p>
    </div>

    ${
      groupMembers && groupMembers.length > 0
        ? `
    <div style="background: #111827; border-radius: 12px; padding: 14px; margin: 16px 0; font-size: 12px;">
      <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 8px;">Registered Teammates:</span>
      ${groupMembers.map((m) => `<div style="color: #cbd5e1; margin: 4px 0;">• ${m.name || m.fullName} (${m.email})</div>`).join('')}
    </div>
    `
        : ''
    }

    <!-- Official WhatsApp Group CTA -->
    <div style="background: rgba(37, 211, 102, 0.12); border: 1px solid rgba(37, 211, 102, 0.35); border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0;">
      <h3 style="color: #25d366; margin: 0 0 6px 0; font-size: 16px;">📲 Join the Official Event WhatsApp Group</h3>
      <p style="color: #cbd5e1; font-size: 13px; margin: 0 0 16px 0;">Stay informed about event schedules, resources, team groupings, and urgent announcements.</p>
      <a href="${whatsappGroupUrl}" style="background: #25d366; color: #042f1a; padding: 12px 28px; border-radius: 10px; font-weight: 800; text-decoration: none; display: inline-block; font-size: 14px; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);">
        Join Event WhatsApp Group →
      </a>
    </div>

    <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; margin-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
      ℹ️ ${cfg.eventNotes || 'Please show this ticket pass ID on arrival at the registration desk.'}
    </div>

    <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
      ${cfg.footerDisclaimer || "ACES KBTCOE • Department of Computer Engineering • MVPS's K.B.T. College of Engineering, Nashik"}
    </p>
  </div>
  `;

  return sendEmail({ to, subject, html });
};

/**
 * 4. Payment Rejected Email
 */
export const sendPaymentRejectedEmail = async ({
  to,
  studentName,
  eventTitle,
  ticketId,
  rejectionReason = 'Transaction UTR was not verified or payment screenshot was unclear.',
  utrNumber = '',
}) => {
  const cfg = await getEmailConfig();
  const subject = `⚠️ Action Required: Payment Proof Status for ${eventTitle}`;

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1d; color: #f1f5f9; padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">${cfg.headerTitle || 'ACES KBTCOE'}</h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">${cfg.headerSubtitle || 'Official Departmental Event Desk'}</p>
    </div>

    <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 20px;">
      <h2 style="color: #fb7185; margin: 0 0 6px 0; font-size: 18px;">Payment Proof Could Not Be Verified</h2>
      <p style="color: #e2e8f0; margin: 0; font-size: 14px;">Event: <strong>${eventTitle}</strong> (Ticket ID: ${ticketId})</p>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
      Dear <strong>${studentName}</strong>,<br><br>
      Your payment submission for <strong>${eventTitle}</strong> was reviewed by the ACES verification desk. Unfortunately, the verification could not be completed for the following reason:
    </p>

    <div style="background: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 14px; margin: 16px 0;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0 0 4px 0; text-transform: uppercase;">Verification Desk Feedback:</p>
      <p style="color: #fb7185; font-size: 14px; font-weight: bold; margin: 0;">"${rejectionReason}"</p>
      ${utrNumber ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">Submitted UTR: <span style="font-family: monospace;">${utrNumber}</span></p>` : ''}
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1;">
      If you feel this is in error or you have a clear transaction statement, please contact the ACES student coordinators or reply to this email with your valid UTR and bank receipt.
    </p>

    <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
      ${cfg.footerDisclaimer || "ACES KBTCOE • Department of Computer Engineering • MVPS's K.B.T. College of Engineering, Nashik"}
    </p>
  </div>
  `;

  return sendEmail({ to, subject, html });
};

/**
 * 5. Membership Application Email Verification OTP
 */
export const sendOtpEmail = async ({ to, otp, purpose = 'membership_application' }) => {
  const cfg = await getEmailConfig();
  const subject = `🔐 ACES KBTCOE - Email Verification Code: ${otp}`;
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; background: #0a0f1d; color: #f1f5f9; padding: 30px; border-radius: 16px; border: 1px solid rgba(56, 189, 248, 0.3);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">${cfg.headerTitle || 'ACES KBTCOE'}</h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">${cfg.headerSubtitle || 'Association of Computer Engineering Students • MVPS KBTCOE Nashik'}</p>
    </div>

    <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
      <h2 style="color: #38bdf8; margin: 0 0 8px 0; font-size: 18px;">Email Verification Code</h2>
      <p style="color: #e2e8f0; margin: 0; font-size: 13px;">Use this 6-digit code to verify your email address for your ACES Membership application.</p>
    </div>

    <!-- OTP Code Display -->
    <div style="background: #111827; border: 2px dashed #38bdf8; border-radius: 14px; padding: 24px; text-align: center; margin: 24px 0;">
      <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 2px; display: block;">One-Time Password (OTP)</span>
      <strong style="color: #38bdf8; font-size: 36px; font-family: monospace; letter-spacing: 8px; display: block; margin: 10px 0;">${otp}</strong>
      <span style="color: #f59e0b; font-size: 12px; font-weight: 600;">⏱️ Valid for 10 minutes</span>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1; text-align: center;">
      Please enter this code on the application page to complete your email verification. Do not share this code with anyone.
    </p>

    <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
      ℹ️ If you did not request this verification code, please ignore this email.
    </div>

    <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
      ${cfg.footerDisclaimer || "ACES KBTCOE • Department of Computer Engineering • MVPS's K.B.T. College of Engineering, Nashik"}
    </p>
  </div>
  `;

  return sendEmail({ to, subject, html });
};

/**
 * 6. Diagnostic Test Email
 */
export const sendTestEmail = async ({ to, customSubject, customMessage }) => {
  const cfg = await getEmailConfig();
  const subject = customSubject || '🧪 ACES KBTCOE - SMTP Test Email';
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; background: #0a0f1d; color: #f1f5f9; padding: 26px; border-radius: 14px; border: 1px solid #38bdf8;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #38bdf8; margin: 0;">${cfg.headerTitle || 'ACES KBTCOE'}</h2>
      <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">${cfg.headerSubtitle || 'Email Delivery Diagnostic Test'}</p>
    </div>

    <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 16px; margin: 16px 0;">
      <p style="color: #38bdf8; font-weight: bold; margin: 0 0 8px 0; font-size: 14px;">✓ SMTP Connection Verified Live!</p>
      <p style="color: #cbd5e1; font-size: 13px; margin: 0;">
        ${customMessage || 'Your email configuration is working properly and ready to deliver real emails to students and participants.'}
      </p>
    </div>

    <div style="background: #111827; border-radius: 8px; padding: 12px; margin-top: 14px; font-size: 12px; color: #94a3b8;">
      <p style="margin: 2px 0;"><strong>Active Sender:</strong> ${cfg.from}</p>
      <p style="margin: 2px 0;"><strong>Target Recipient:</strong> ${to}</p>
      <p style="margin: 2px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
    </div>

    <p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 20px;">
      ${cfg.footerDisclaimer || 'ACES KBTCOE Departmental Club Platform'}
    </p>
  </div>
  `;

  return sendEmail({ to, subject, html });
};

/**
 * Verify SMTP connection health
 */
export const verifyEmailService = async () => {
  const mailer = await getTransporter();
  if (mailer && typeof mailer.verify === 'function') {
    try {
      await mailer.verify();
      console.log('✅ [Email Service] Real SMTP connection verified and ready to deliver emails.');
      return { connected: true };
    } catch (err) {
      console.error('❌ [Email Service] SMTP verification failed:', err.message);
      return { connected: false, error: err.message };
    }
  } else {
    console.log('ℹ️ [Email Service] No SMTP credentials provided in .env or settings. Running in development logger mode (outputs to console and uploads/emails.log).');
    return { connected: false, mode: 'logger' };
  }
};
