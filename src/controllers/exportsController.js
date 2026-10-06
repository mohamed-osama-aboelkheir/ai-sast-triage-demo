const fs = require('fs');
const path = require('path');
const exportService = require('../services/exportService');

exports.download = (req, res) => {
  if (!req.query.file) return res.status(400).json({ error: 'missing file' });

  const filePath = exportService.getPath(req.query.file);
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => res.status(404).json({ error: 'export not found' }));
  stream.on('open', () => {
    res.attachment(path.basename(filePath));
    stream.pipe(res);
  });
};
