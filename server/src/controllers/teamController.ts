import { Request, Response } from 'express';
import { z } from 'zod';
import { TeamMember } from '../models/TeamMember.js';

export const teamMemberSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  designationId: z.string().optional(),
  role: z.string().min(2, 'Role is required'),
  tier: z.enum(['FACULTY', 'PRESIDENT', 'VICE_PRESIDENT', 'EXECUTIVE', 'COMMITTEE']).default('COMMITTEE'),
  department: z.string().default('Computer Engineering'),
  academicYear: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().min(1, 'Photo URL is required'),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(true),
});

export const getTeam = async (_req: Request, res: Response): Promise<void> => {
  try {
    const members = await TeamMember.find({ isActive: true, isPublished: { $ne: false } })
      .populate('designationId')
      .sort({ displayOrder: 1, createdAt: 1 });

    const grouped = {
      president: members.find((m) => m.tier === 'PRESIDENT') || null,
      vicePresident: members.find((m) => m.tier === 'VICE_PRESIDENT') || null,
      executives: members.filter((m) => m.tier === 'EXECUTIVE'),
      committee: members.filter((m) => m.tier === 'COMMITTEE'),
      faculty: members.filter((m) => m.tier === 'FACULTY'),
      all: members,
    };

    res.json({ success: true, count: members.length, team: grouped });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTeamAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const members = await TeamMember.find()
      .populate('designationId')
      .sort({ displayOrder: 1, createdAt: 1 });

    res.json({ success: true, count: members.length, members });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const member = await TeamMember.create(req.body);
    res.status(201).json({ success: true, message: 'Team member added successfully', member });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await TeamMember.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: 'Member not found' });
      return;
    }
    res.json({ success: true, message: 'Team member updated', member: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderTeamMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderedIds } = req.body; // array of IDs in new order
    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ success: false, message: 'orderedIds must be an array of IDs' });
      return;
    }

    const updates = orderedIds.map((id, index) =>
      TeamMember.findByIdAndUpdate(id, { displayOrder: index + 1 })
    );
    await Promise.all(updates);

    res.json({ success: true, message: 'Team members reordered successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await TeamMember.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Member not found' });
      return;
    }
    res.json({ success: true, message: 'Team member deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
