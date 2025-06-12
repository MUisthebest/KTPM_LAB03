// app.js
const express = require('express');
const app = express();
const port = 8080;
require('dotenv').config();
const path = require('path');
const router = require('./routes');

// Cấu hình view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

// Public folder cho CSS/JS
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', router);

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
