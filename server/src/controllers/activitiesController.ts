import { Request, Response } from 'express';
import { z } from 'zod';
import { Activity } from '../models/Activity.js';

export const activitySchema = z.object({
  title: z.string().min(2, 'Title is required'),
  type: z.enum(['ACTIVITY', 'ACHIEVEMENT']).default('ACTIVITY'),
  description: z.string().min(5, 'Description is required'),
  date: z.string().or(z.date()).optional(),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
  displayOrder: z.number().default(0),
  featured: z.boolean().default(false),
});

export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.query;
    const filter: any = {};
    if (type) {
      filter.type = type;
    }
    const items = await Activity.find(filter).sort({ date: -1, displayOrder: 1 });
    res.json({ success: true, count: items.length, items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Activity.create(req.body);
    res.status(201).json({ success: true, message: 'Item created successfully', item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await Activity.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: 'Record not found' });
      return;
    }
    res.json({ success: true, message: 'Record updated', item: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Activity.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Record not found' });
      return;
    }
    res.json({ success: true, message: 'Record deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
