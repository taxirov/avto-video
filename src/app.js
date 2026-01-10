const path = require('path');
const express = require('express');
const audioTextRoutes = require('./routes/audioText.route');

const createApp = () => {
  const app = express();

  app.use(express.json({ limit: '2mb' }));
  app.use('/files', express.static(path.join(process.cwd(), 'storage')));

  app.use('/api', audioTextRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint topilmadi' });
  });

  return app;
};

module.exports = { createApp };
