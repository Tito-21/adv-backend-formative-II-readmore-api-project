// Handles requests to routes that don't exist.
const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Central error handler. Express 5 automatically forwards errors thrown
// inside async controllers here, so controllers don't need try/catch blocks.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Malformed ObjectId, e.g. GET /authors/123
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // Schema validation failed, e.g. a required field is missing
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
};

module.exports = { notFound, errorHandler };
