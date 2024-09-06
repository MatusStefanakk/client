require('dotenv').config(); // Load environment variables from .env file
const path = require('path');
const express = require('express');
const { Pool } = require('pg'); // PostgreSQL client
const bodyParser = require('body-parser');

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// PostgreSQL connection configuration using environment variables
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

// Serve the main page
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the dashboard page
app.get('https://fivem-clientrado.onrender.com/auth/discord', (request, response) => {
    response.sendFile(path.join(__dirname, 'dashboard.html'));
});
 
// Handle requests to /dashboard
app.get('/dashboard', (request, response) => {
    response.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Handle POST requests to submit data to the database
app.post('/submit-data', async (req, res) => {
    const { ticket_creator, ticket_topic, ticket_text, ticket_state } = req.body;

    try {
        const query = 'INSERT INTO tickets (ticket_creator, ticket_topic, ticket_text, ticket_state) VALUES ($1, $2, $3, $4) RETURNING id;';
        await pool.query(query, [ticket_creator, ticket_topic, ticket_text, ticket_state]);
        res.status(200).send('Data inserted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error inserting data');
    }
});

// Handle GET requests to retrieve tickets for the current user
app.get('/get-tickets', async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).send('Username is required');
    }

    try {
        const query = 'SELECT * FROM tickets WHERE ticket_creator = $1;';
        const result = await pool.query(query, [username]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving data');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
