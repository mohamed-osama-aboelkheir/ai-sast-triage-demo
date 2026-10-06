const reportRepository = require('../repositories/reportRepository');

exports.build = async (definition) => {
  const summary = await reportRepository.summary(definition.table);
  return { title: definition.title, ...summary };
};
