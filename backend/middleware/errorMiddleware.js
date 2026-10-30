export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Uploaded file is too large. Maximum size allowed is 50MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Unexpected upload field: "${err.field}". Please ensure you select an image file.`;
    } else {
      message = `File upload failed: ${err.message}`;
    }
  } else if (!statusCode) {
    statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  }

  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error('[Error Details]:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
};
