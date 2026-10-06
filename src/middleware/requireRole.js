module.exports = (role) => function requireRole(req, res, next) {
  if (!req.user || req.user.role !== role) return res.status(403).json({ error: 'forbidden' });
  next();
};
