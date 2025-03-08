const express = require('express');
const dbConnection = require('./db_connection');

const app = express();
const port = 3000;

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log("[${new Date().toISOString()}] ${req.method} ${req.url}");
    next();
});

// Test db Connection
dbConnection.query('SELECT 1')
    .then(() => console.log("MySQL Connected"))
    .catch((err) => console.error("MySQL Connection Error:", err));

// fetch new place get request
app.get('/new_place', async (req, res) => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM new_place');
        res.status(200).json({
          status: 'Success',
          message: 'Data fetch successfully',
          data: rows
      });
        res.json(rows);
    } catch (error) {
      next(error);
    }
});

// add new place post request
app.post('/add_new_place', async (req, res) => {
    try {
        const {placeTitle, placeDes, placeImage} = req.body;
        const [result] = await dbConnection.query('INSERT INTO new_place (placeTitle, placeDes, placeImage) VALUES (?, ?, ?)', [placeTitle, placeDes, placeImage]);
        res.status(200).json({
          status: 'Success',
          message: 'Data added successfully',
          data: { id: result.insertId, placeTitle, placeDes, placeImage}
      });
    } catch (error) {
        next(error);
    }
});


// 404 Middleware
app.use((req, res, next) => {
    res.status(404).json({ error: "Route not found"});
});

// Global Middleware
app.use((err, req, res, next) => {
    console.error("Error: ${err.message}");
    res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// Start the server
app.listen(port, () => {
    console.log("Server is running on http://localhost:${port}");
});
