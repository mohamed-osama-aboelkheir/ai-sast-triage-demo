const commentService = require('../services/commentService');

exports.index = async (req, res) => {
  const comments = await commentService.listForDisplay();
  res.render('comments', { comments });
};

exports.create = async (req, res) => {
  const body = (req.body.body || '').trim();
  if (!body) return res.status(400).json({ error: 'empty comment' });

  await commentService.add(req.user, body);
  res.status(201).json({ ok: true });
};
