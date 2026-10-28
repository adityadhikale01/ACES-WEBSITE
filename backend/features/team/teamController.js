import TeamMember from './teamModel.js';
import Designation from './designationModel.js';
import { AppError } from '../../utils/AppError.js';
import path from 'path';
import fs from 'fs';

export const getAllMembers = async (req, res) => {
  const { isCurrent = 'true' } = req.query;
  const filter = {};
  if (isCurrent !== 'all') {
    filter.isCurrent = isCurrent === 'true';
  }

  const members = await TeamMember.find(filter).sort({ displayOrder: 1, createdAt: 1 });

  res.status(200).json({
    success: true,
    count: members.length,
    members,
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
  const { orders } = req.body; // Array of { id, displayOrder }
  if (Array.isArray(orders)) {
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
  if (!req.file) {
    return next(new AppError('No photo uploaded', 400));
  }

  let photoUrl = '';
  if (req.file.path && req.file.path.startsWith('http')) {
    photoUrl = req.file.path;
  } else if (req.file.buffer) {
    // If memory storage, write to public uploads directory
    const uploadDir = path.resolve(process.cwd(), 'uploads/public/team');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filename = `team-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(req.file.originalname || '.jpg')}`;
    fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
    photoUrl = `/uploads/public/team/${filename}`;
  } else if (req.file.filename) {
    photoUrl = `/uploads/public/media/${req.file.filename}`;
  }

  res.status(200).json({
    success: true,
    message: 'Team member photo uploaded successfully',
    photoUrl,
    url: photoUrl,
  });
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
