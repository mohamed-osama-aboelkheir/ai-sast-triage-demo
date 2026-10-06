const path = require('path');
const config = require('../config');

exports.getPath = (file) => path.join(config.exportDir, file);
