const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the www directory
app.use(express.static(path.join(__dirname, 'www')));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'www', 'auth.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} in your browser`);
    console.log(`🔐 Authentication page: http://localhost:${PORT}/auth.html`);
    console.log(`⚙️  Account settings: http://localhost:${PORT}/index.html`);
});
