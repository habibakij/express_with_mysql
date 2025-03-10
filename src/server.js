const app = require('./app');
const dbConnection = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

dbConnection.query('SELECT 1')
    .then(() => console.log('MySQL Connected'))
    .catch(err => console.error('MySQL Connection Error:', err));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
