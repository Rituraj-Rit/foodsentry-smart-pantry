export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} was not found.` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status || (error.code === 11000 ? 409 : error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500);
  const message = status >= 500 && process.env.NODE_ENV === 'production'
    ? 'Something went wrong. Please try again.'
    : error.message || 'Something went wrong.';
  res.status(status).json({ success: false, message });
}
