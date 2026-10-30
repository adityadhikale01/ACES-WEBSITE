import TeamMember from './teamModel.js';
import Designation from './designationModel.js';
import User from '../auth/userModel.js';
import { AppError } from '../../utils/AppError.js';
import { saveUploadedFile } from '../../utils/fileStorage.js';
import path from 'path';
import fs from 'fs';

export const getAllMembers = async (req, res) => {
  // 1. Fetch approved platform users who are published on the team
  const approvedUsers = await User.find({
    isApprovedMember: true,
    isPublishedOnTeam: { $ne: false },
    isActive: { $ne: false },
  }).sort({ displayOrder: 1, createdAt: 1 });

  // 2. Fetch TeamMember collection records
  const teamMembers = await TeamMember.find({
    isActive: { $ne: false },
    isPublished: { $ne: false },
    isCurrent: { $ne: false },
  }).sort({ displayOrder: 1, createdAt: 1 });

  // 3. Merge seamlessly, giving priority to approved User profile data
  const mapByEmail = new Map();

  // First add teamMembers
  for (const m of teamMembers) {
    const obj = m.toObject();
    const key = (obj.email || obj.name).toLowerCase().trim();
    mapByEmail.set(key, {
      ...obj,
      source: 'team_model',
    });
  }

  // Next overlay / insert approved platform users
  for (const u of approvedUsers) {
    const key = (u.email || u.name).toLowerCase().trim();
    const existing = mapByEmail.get(key) || {};

    const cat =
      u.postCategory ||
      (u.assignedPost?.toUpperCase().includes('PRESIDENT') && !u.assignedPost?.toUpperCase().includes('VICE')
        ? 'PRESIDENT'
        : u.assignedPost?.toUpperCase().includes('VICE')
        ? 'VICE_PRESIDENT'
        : existing.tier === 'EXECUTIVE'
        ? 'EXECUTION_TEAM'
        : 'MEMBER');

    const merged = {
      ...existing,
      _id: u._id,
      userId: u._id,
      name: u.fullName || u.name,
      fullName: u.fullName || u.name,
      email: u.email,
      phone: u.phone || existing.phone,
      department: u.department || existing.department || 'Computer Engineering',
      academicYear: u.academicYear || existing.academicYear || 'TE',
      photoUrl: u.photoUrl || existing.photoUrl || '/assets/aces-team.jpg',
      bio: u.bio || existing.bio || '',
      linkedinUrl: u.linkedinUrl || existing.linkedinUrl || '',
      githubUrl: u.githubUrl || existing.githubUrl || '',
      role: u.assignedPost || existing.role || (cat === 'PRESIDENT' ? 'President' : 'Committee Member'),
      designation: u.assignedPost || existing.designation || (cat === 'PRESIDENT' ? 'President' : 'Committee Member'),
      tier: cat === 'EXECUTION_TEAM' ? 'EXECUTIVE' : cat === 'MEMBER' ? 'COMMITTEE' : cat,
      category:
        cat === 'PRESIDENT' || cat === 'VICE_PRESIDENT'
          ? 'LEADERSHIP'
          : cat === 'EXECUTION_TEAM'
          ? 'OPERATIONS'
          : 'COMMITTEE',
      postCategory: cat,
      displayOrder: u.displayOrder || existing.displayOrder || 100,
      isApprovedMember: true,
      source: 'platform_user',
    };

    mapByEmail.set(key, merged);
  }

  const allMembers = Array.from(mapByEmail.values()).sort(
    (a, b) => (a.displayOrder || 100) - (b.displayOrder || 100)
  );

  const presidents = allMembers.filter((m) => m.tier === 'PRESIDENT' || m.postCategory === 'PRESIDENT');
  const vicePresidents = allMembers.filter((m) => m.tier === 'VICE_PRESIDENT' || m.postCategory === 'VICE_PRESIDENT');
  const executives = allMembers.filter((m) => m.tier === 'EXECUTIVE' || m.postCategory === 'EXECUTION_TEAM');
  const committee = allMembers.filter(
    (m) =>
      !['PRESIDENT', 'VICE_PRESIDENT', 'EXECUTIVE', 'FACULTY'].includes(m.tier) &&
      !['PRESIDENT', 'VICE_PRESIDENT', 'EXECUTION_TEAM', 'FACULTY'].includes(m.postCategory)
  );
  const faculty = allMembers.filter((m) => m.tier === 'FACULTY' || m.postCategory === 'FACULTY');

  const grouped = {
    president: presidents[0] || null,
    presidents,
    vicePresident: vicePresidents[0] || null,
    vicePresidents,
    executives,
    committee,
    faculty,
    all: allMembers,
  };

  res.status(200).json({
    success: true,
    count: allMembers.length,
    team: grouped,
    members: allMembers,
  });
};

export const createMember = async (req, res) => {
  const data = req.validatedBody || req.body;
  const member = await TeamMember.create(data);

  res.status(201).json({
    success: true,
    message: 'Team member added successfully',
    member,
  });
};

export const updateMember = async (req, res, next) => {
  const { id } = req.params;
  const data = req.validatedBody || req.body;

  const member = await TeamMember.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!member) {
    return next(new AppError('Team member not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Team member updated successfully',
    member,
  });
};

export const deleteMember = async (req, res, next) => {
  const { id } = req.params;
  const member = await TeamMember.findByIdAndDelete(id);
  if (!member) {
    return next(new AppError('Team member not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Team member deleted successfully',
  });
};

export const reorderMembers = async (req, res) => {
  const { orders, orderedIds } = req.body;
  if (Array.isArray(orderedIds)) {
    const promises = orderedIds.map((id, index) =>
      TeamMember.findByIdAndUpdate(id, { displayOrder: index + 1 })
    );
    await Promise.all(promises);
  } else if (Array.isArray(orders)) {
    const promises = orders.map(({ id, displayOrder }) =>
      TeamMember.findByIdAndUpdate(id, { displayOrder })
    );
    await Promise.all(promises);
  }

  res.status(200).json({
    success: true,
    message: 'Members reordered successfully',
  });
};

export const uploadTeamPhoto = async (req, res, next) => {
  const file = req.file || (req.files && req.files[0]);
  if (!file) {
    return next(new AppError('No photo uploaded. Please select a photo file to upload.', 400));
  }

  try {
    const photoUrl = await saveUploadedFile(file, 'team');
    res.status(200).json({
      success: true,
      message: 'Team member photo uploaded successfully',
      photoUrl,
      url: photoUrl,
    });
  } catch (err) {
    next(err);
  }
};

// Designations
export const getAllDesignations = async (req, res) => {
  const designations = await Designation.find().sort({ displayOrder: 1, title: 1 });
  res.status(200).json({
    success: true,
    count: designations.length,
    designations,
  });
};

export const createDesignation = async (req, res, next) => {
  const data = req.validatedBody || req.body;
  const existing = await Designation.findOne({ title: data.title });
  if (existing) {
    return next(new AppError('Designation already exists', 409));
  }
  const designation = await Designation.create(data);
  res.status(201).json({
    success: true,
    message: 'Designation created successfully',
    designation,
  });
};

export const updateDesignation = async (req, res, next) => {
  const { id } = req.params;
  const data = req.validatedBody || req.body;
  const designation = await Designation.findByIdAndUpdate(id, data, { new: true });
  if (!designation) {
    return next(new AppError('Designation not found', 404));
  }
  res.status(200).json({
    success: true,
    message: 'Designation updated',
    designation,
  });
};

export const deleteDesignation = async (req, res, next) => {
  const { id } = req.params;
  const designation = await Designation.findByIdAndDelete(id);
  if (!designation) {
    return next(new AppError('Designation not found', 404));
  }
  res.status(200).json({
    success: true,
    message: 'Designation deleted',
  });
};

export const assignMemberPost = async (req, res, next) => {
  const { id } = req.params;
  const { assignedPost, postCategory, displayOrder, isPublishedOnTeam, photoUrl, bio, linkedinUrl, githubUrl } = req.body;

  let user = null;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    user = await User.findById(id);
  }
  if (!user) {
    user = await User.findOne({ email: id.toLowerCase() });
  }

  if (!user) {
    return next(new AppError('Member user not found', 404));
  }

  if (assignedPost !== undefined) user.assignedPost = assignedPost;
  if (postCategory !== undefined) {
    user.postCategory = postCategory;
    if (postCategory === 'PRESIDENT') {
      user.role = 'PRESIDENT';
    } else if (postCategory === 'FACULTY') {
      user.role = 'FACULTY';
    }
  }
  if (displayOrder !== undefined) user.displayOrder = Number(displayOrder);
  if (isPublishedOnTeam !== undefined) user.isPublishedOnTeam = Boolean(isPublishedOnTeam);
  if (photoUrl) user.photoUrl = photoUrl;
  if (bio !== undefined) user.bio = bio;
  if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
  if (githubUrl !== undefined) user.githubUrl = githubUrl;
  user.isApprovedMember = true;

  await user.save();

  // Sync to TeamMember
  await TeamMember.findOneAndUpdate(
    { email: user.email.toLowerCase() },
    {
      name: user.name,
      email: user.email.toLowerCase(),
      role: user.assignedPost,
      designation: user.assignedPost,
      tier:
        user.postCategory === 'EXECUTION_TEAM'
          ? 'EXECUTIVE'
          : user.postCategory === 'MEMBER'
          ? 'COMMITTEE'
          : user.postCategory,
      displayOrder: user.displayOrder,
      photoUrl: user.photoUrl,
      bio: user.bio,
      linkedinUrl: user.linkedinUrl,
      githubUrl: user.githubUrl,
      isPublished: user.isPublishedOnTeam,
      isActive: true,
      isCurrent: true,
    },
    { upsert: true }
  );

  res.status(200).json({
    success: true,
    message: `Post "${user.assignedPost}" assigned to ${user.name}`,
    member: user.toSafeObject(),
    user: user.toSafeObject(),
  });
};
