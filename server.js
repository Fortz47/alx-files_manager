#!/usr/bin/node

import express from 'express';
import loadRoutes from './routes';

const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());

loadRoutes(app);

app.listen(PORT, () => {
  console.log(`Server running on port localhost:${PORT}`);
});

export default app;
