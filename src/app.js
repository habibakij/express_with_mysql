const express = require('express');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const app = express();

app.use(express.json());
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
