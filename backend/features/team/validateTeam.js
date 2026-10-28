import { teamMemberSchema, updateTeamMemberSchema, designationSchema } from './teamSchema.js';

export const validateCreateMember = (req, res, next) => {
  const { error, value } = teamMemberSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(', '),
      errors: error.details,
    });
  }
  req.validatedBody = value;
  next();
};

export const validateUpdateMember = (req, res, next) => {
  const { error, value } = updateTeamMemberSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(', '),
      errors: error.details,
    });
  }
  req.validatedBody = value;
  next();
};

export const validateDesignation = (req, res, next) => {
  const { error, value } = designationSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(', '),
      errors: error.details,
    });
  }
  req.validatedBody = value;
  next();
};
