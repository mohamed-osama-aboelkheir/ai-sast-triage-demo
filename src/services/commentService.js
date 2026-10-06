const commentRepository = require('../repositories/commentRepository');
const markdown = require('../utils/markdown');

exports.listForDisplay = async () => {
  const comments = await commentRepository.list();
  return comments.map((comment) => ({
    author: comment.username,
    createdAt: comment.created_at,
    html: markdown.render(comment.body),
  }));
};

exports.add = (user, body) => commentRepository.create(user.id, body);
