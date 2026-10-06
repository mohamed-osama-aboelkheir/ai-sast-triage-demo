const path = require('path');
const express = require('express');
const config = require('./config');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(require('./routes/orders'));
app.use(require('./routes/reports'));
app.use(require('./routes/exports'));
app.use(require('./routes/comments'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});

app.listen(config.port, () => console.log(`listening on http://localhost:${config.port}`));
