const orderRepository = require('../repositories/orderRepository');

exports.search = (filters, user) =>
  orderRepository.find(user.id, filters.status, filters.orderColumn || 'created_at');
