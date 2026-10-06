const { marked } = require('marked');
const DOMPurify = require('isomorphic-dompurify');

exports.render = (text) => DOMPurify.sanitize(marked.parse(text));
