require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authorRoutes = require('./routes/authorRoutes');
const bookRoutes = require('./routes/bookRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health-check route
app.get('/', (req, res) => {
  res.json({ message: 'ReadMore API is running' });
});

app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);

app.use(notFound);
app.use(errorHandler);

// Only start listening once the database connection succeeds
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};

start();
