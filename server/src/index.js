// src/index.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerSetup = require('./swagger');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile')); // Profile route

// Swagger
swaggerSetup(app);

// src/index.js
app.use(cors({
    origin: 'http://localhost:5173', // Adjust the port based on your frontend setup
    credentials: true
}));


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
