const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Body Parser Middleware
app.use(express.json());

// Mount Modular Routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/task', require('./routes/taskRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Connect DB & Start Server
const PORT = process.env.PORT || 5000;
const MONGO_URI = 'mongodb://127.0.0.1:27017/creatorOS';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => console.error('Database connection failed:', err.message));