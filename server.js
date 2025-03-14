const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// In-memory storage for URL mappings
const urlDatabase = {};

// Middleware to log IP addresses for all requests
app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const logEntry = `IP: ${ip}, Timestamp: ${new Date().toISOString()}, Path: ${req.path}\n`;

    // Append the IP address to a log file
    fs.appendFile(path.join(__dirname, 'ip_log.txt'), logEntry, (err) => {
        if (err) console.error('Error logging IP:', err);
    });

    next();
});

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to create a short URL
app.post('/shorten', express.urlencoded({ extended: true }), (req, res) => {
    const originalUrl = req.body.url;
    if (!originalUrl) {
        return res.status(400).send('URL is required');
    }

    // Generate a short code (e.g., a random 6-character string)
    const shortCode = Math.random().toString(36).substring(2, 8);
    urlDatabase[shortCode] = originalUrl;

    // Send the short URL back to the user
    const shortUrl = `http://localhost:${PORT}/${shortCode}`;
    res.send(`Short URL: <a href="${shortUrl}">${shortUrl}</a>`);
});

// Redirect to the original URL when the short code is visited
app.get('/:shortCode', (req, res) => {
    const shortCode = req.params.shortCode;
    const originalUrl = urlDatabase[shortCode];

    if (originalUrl) {
        res.redirect(originalUrl);
    } else {
        res.status(404).send('Short URL not found');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});