// This file is the main entry point for the URL shortener backend service  

import express, { json } from 'express';
import logger from './logger.js';
import urlRoutes from './routes/urlRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const PORT = 3001;

// Add a root route for friendly status
app.get('/', (req, res) => {
  res.send('URL Shortener Backend is running.');
});

app.use(json());
app.use(logger);
app.use(urlRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
