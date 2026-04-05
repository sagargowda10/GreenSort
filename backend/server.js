// --- MUST BE FIRST ---
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const cookieParser = require('cookie-parser');
const locationRoutes = require('./routes/locationRoutes');
const identificationRoutes = require('./routes/identificationRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const communityRoutes = require('./routes/communityRoutes');
const path = require('path');
const cors = require('cors');

// Connect to MongoDB
connectDB();

// Create express app
const app = express();

// --- CORS (VERY IMPORTANT) ---
app.use(cors({
  origin: "https://69d2012fce2a58a5a45c930c--lucent-sorbet-eba23c.netlify.app",
  credentials: true
}));

// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- API ROUTES ---

// Test route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the GreenSort API!' });
});

// Route groups
app.use('/api/auth', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/identify', identificationRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/community', communityRoutes);

// --- STATIC FILES (IMAGES) ---
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- ERROR HANDLERS ---
app.use(notFound);
app.use(errorHandler);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});