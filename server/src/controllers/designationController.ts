import { Request, Response } from 'express';
import { z } from 'zod';
import { Designation } from '../models/Designation.js';

export const designationSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  tier: z
    .enum(['FACULTY', 'PRESIDENT', 'VICE_PRESIDENT', 'EXECUTIVE', 'CORE_OFFICER', 'COMMITTEE', 'OTHER'])
    .default('COMMITTEE'),
  displayOrder: z.number().default(0),
  isRetired: z.boolean().default(false),
  description: z.string().optional(),
});

export const getDesignations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const designations = await Designation.find({ isRetired: false }).sort({ displayOrder: 1 });
    res.json({ success: true, count: designations.length, designations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllDesignationsAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const designations = await Designation.find().sort({ displayOrder: 1 });
    res.json({ success: true, count: designations.length, designations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDesignation = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await Designation.findOne({ title: req.body.title.trim() });
    if (existing) {
      res.status(409).json({ success: false, message: 'A designation with this title already exists.' });
      return;
    }
    const designation = await Designation.create(req.body);
    res.status(201).json({ success: true, message: 'Designation created', designation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDesignation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await Designation.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: 'Designation not found' });
      return;
    }
    res.json({ success: true, message: 'Designation updated', designation: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const retireDesignation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const designation = await Designation.findById(id);
    if (!designation) {
      res.status(404).json({ success: false, message: 'Designation not found' });
      return;
    }
    designation.isRetired = true;
    await designation.save();
    res.json({ success: true, message: 'Designation retired safely. Historical references preserved.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
