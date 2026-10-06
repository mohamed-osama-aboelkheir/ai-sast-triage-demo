const userService = require('../services/userService');

module.exports = async function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });

  const user = await userService.authenticate(token);
  if (!user) return res.status(401).json({ error: 'invalid token' });

  req.user = user;
  next();
};
