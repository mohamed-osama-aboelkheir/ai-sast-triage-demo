const userRepository = require('../repositories/userRepository');

exports.authenticate = (token) => userRepository.findByToken(token);
