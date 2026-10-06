const reports = require('../config/reports');
const reportService = require('../services/reportService');

exports.show = async (req, res) => {
  const definition = reports[req.params.reportId];
  if (!definition) return res.status(404).json({ error: 'unknown report' });

  res.json(await reportService.build(definition));
};
