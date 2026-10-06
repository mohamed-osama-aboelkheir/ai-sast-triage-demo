const orderService = require('../services/orderService');

const ALLOWED_STATUSES = ['open', 'shipped', 'cancelled'];

exports.list = async (req, res) => {
  const { status, sort } = req.query;
  if (status && !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }

  const orders = await orderService.search({ status, orderColumn: sort }, req.user);
  res.json(orders);
};
