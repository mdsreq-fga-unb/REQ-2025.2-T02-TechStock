function validate(requiredFields = []) {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: 'Invalid JSON body' });
    }
    const missing = requiredFields.filter((f) => typeof req.body[f] !== 'string' || !req.body[f].trim());
    if (missing.length) {
      return res.status(400).json({ message: 'Validation error', missing });
    }
    return next();
  };
}

module.exports = { validate };
