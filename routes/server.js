const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 5000;

// Configure your PostgreSQL connection
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE,
    password: process.env.DATABASE_PASS,
    port: process.env.DATABASE_PORT,
});

app.use(express.json());

// Endpoint to handle Shrimp Production Input data
app.post('/views/shrimp-production', async (req, res) => {
    try {
        const data = req.body;

        const query = `
            INSERT INTO shrimp_production (female_count, male_count, developed_per_day)
            VALUES ($1, $2, $3)
        `;

        const values = [
            data.femaleCount,
            data.maleCount,
            data.developedPerDay,
        ];

        await pool.query(query, values);

        res.json({ success: true, message: 'Shrimp production data saved successfully.' });
    } catch (error) {
        console.error('Error saving shrimp production data:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Endpoint to handle Shrimp Analysis data
app.post('/views/shrimp-analysis', async (req, res) => {
    try {
        const data = req.body;

        const query = `
            INSERT INTO shrimp_analysis (broodstock_count, temperature, total_production, maintenance_score)
            VALUES ($1, $2, $3, $4)
        `;

        const values = [
            data.broodstockCount,
            data.temperature,
            data.totalProduction,
            data.maintenanceScore,
        ];

        await pool.query(query, values);

        res.json({ success: true, message: 'Shrimp analysis data saved successfully.' });
    } catch (error) {
        console.error('Error saving shrimp analysis data:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
