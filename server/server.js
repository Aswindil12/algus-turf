const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// API Routes
app.post('/api/bookings', (req, res) => {
    // Handle booking creation
    res.json({ success: true, message: 'Booking created' });
});

app.get('/api/bookings', (req, res) => {
    // Get all bookings
    res.json({ success: true, bookings: [] });
});

app.post('/api/auth/login', (req, res) => {
    // Handle login
    res.json({ success: true, message: 'Login successful' });
});

app.post('/api/auth/register', (req, res) => {
    // Handle registration
    res.json({ success: true, message: 'Registration successful' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});