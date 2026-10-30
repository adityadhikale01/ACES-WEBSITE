import TeamMember from './teamModel.js';
import Designation from './designationModel.js';
import { AppError } from '../../utils/AppError.js';
import { saveUploadedFile } from '../../utils/fileStorage.js';
import path from 'path';
import fs from 'fs';

export const getAllMembers = async (req, res) => {
  const { isCurrent } = req.query;
  const filter = { isActive: { $ne: false }, isPublished: { $ne: false } };
  if (isCurrent === 'false') {
    filter.isCurrent = false;
  } else if (isCurrent === 'true') {
    filter.isCurrent = { $ne: false };
  }

  const members = await TeamMember.find(filter)
    .populate('designationId')
    .sort({ displayOrder: 1, createdAt: 1 });

  // Map and normalize fields
  const normalized = members.map((m) => {
    const obj = m.toObject();
    if (!obj.tier) {
      const des = (obj.designation || obj.role || '').toUpperCase();
      if (des.includes('PRESIDENT') && !des.includes('VICE')) {
        obj.tier = 'PRESIDENT';
      } else if (des.includes('VICE PRESIDENT') || des.includes('VICE-PRESIDENT') || des.includes('VICEPRESIDENT')) {
        obj.tier = 'VICE_PRESIDENT';
      } else if (des.includes('FACULTY') || obj.category === 'FACULTY') {
        obj.tier = 'FACULTY';
      } else if (des.includes('COMMITTEE') || obj.category === 'COMMITTEE') {
        obj.tier = 'COMMITTEE';
      } else {
        obj.tier = 'EXECUTIVE';
      }
    }
    obj.role = obj.role || obj.designation || (obj.tier === 'COMMITTEE' ? 'Committee Member' : obj.tier);
    obj.designation = obj.designation || obj.role;
    obj.department = obj.department || 'Computer Engineering';
    obj.linkedinUrl = obj.linkedinUrl || obj.linkedin;
    obj.githubUrl = obj.githubUrl || obj.github;
    return obj;
  });

  const presidents = normalized.filter((m) => m.tier === 'PRESIDENT');
  const vicePresidents = normalized.filter((m) => m.tier === 'VICE_PRESIDENT');
  const executives = normalized.filter((m) => m.tier === 'EXECUTIVE');
  const committee = normalized.filter((m) => m.tier === 'COMMITTEE');
  const faculty = normalized.filter((m) => m.tier === 'FACULTY');

  const grouped = {
    president: presidents[0] || null,
    presidents: presidents,
    vicePresident: vicePresidents[0] || null,
    vicePresidents: vicePresidents,
    executives: executives,
    committee: committee,
    faculty: faculty,
    all: normalized,
  };

  res.status(200).json({
    success: true,
    count: normalized.length,
    team: grouped,
    members: normalized,
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
