import Activity from './activityModel.js';
import { AppError } from '../../utils/AppError.js';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const getAllActivities = async (req, res) => {
  const { type, isFeatured } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

  const items = await Activity.find(filter).sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: items.length,
    items,
  });
};

export const createActivity = async (req, res, next) => {
  const data = req.validatedBody || req.body;
  const slug = data.slug || `${slugify(data.title)}-${Date.now()}`;

  const item = await Activity.create({
    ...data,
    slug,
  });

  res.status(201).json({
    success: true,
    message: `${item.type === 'ACHIEVEMENT' ? 'Achievement' : 'Activity'} created successfully`,
    item,
  });
};

export const updateActivity = async (req, res, next) => {
  const { id } = req.params;
  const data = req.validatedBody || req.body;

  const item = await Activity.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!item) {
    return next(new AppError('Record not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Updated successfully',
    item,
  });
};

export const deleteActivity = async (req, res, next) => {
  const { id } = req.params;
  const item = await Activity.findByIdAndDelete(id);
  if (!item) {
    return next(new AppError('Record not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Deleted successfully',
  });
};
