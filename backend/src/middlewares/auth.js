function attachUser(req, _res, next) {
  // Mock user for auditing while auth is not implemented
  req.user = { id: 1 };
  next();
}

module.exports = { attachUser };
