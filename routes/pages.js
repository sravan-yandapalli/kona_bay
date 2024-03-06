const express = require("express");
const router = express.Router();
const userController = require("../controllers/users");
const { Pool } = require("pg");
const RandomForestRegression = require('ml-random-forest').RandomForestRegression;

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE,
  password: process.env.DATABASE_PASS,
  port: process.env.DATABASE_PORT,
  ssl: true
});

// Placeholder regression model (replace with your actual model)
const regressionModel = new RandomForestRegression();

const X_train = [[1], [10], [20], [25], [100]];
const y_train = [100, 1000, 25000, 30000, 100000];


// Train the regression model
regressionModel.train(X_train, y_train);

// Existing routes
router.get("/", userController.isLoggedIn, async (req, res) => {
  try {
    if (req.user) {
      const result = await pool.query("SELECT * FROM vizag WHERE id = $1", [req.user.id]);
      const user = result.rows[0];
      res.render("index", { user });
    } else {
      res.redirect("/login");
    }

  } catch (error) {
    console.error("Error fetching user data from PostgreSQL:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post('/views/server', async (req, res) => {
  try {
    


    const data = req.body;

    const query = `
      INSERT INTO shrimp_data (broodstock_count,  temperature, total_production, maintenance_score)
      VALUES ($1, $2, $3, $4)
    `;

    const values = [
      data.broodstockCount,
      data.temperature,

      data.totalProduction,
      data.maintenanceScore,
    ];

    await pool.query(query, values);

    res.json({ success: true, message: 'Data saved successfully.' });


  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/server", (req, res) => {
  res.render("server");
});

router.get('/predict', (req, res) => {
  // Add logic for handling GET requests to /predict, if needed
  res.render('spawn');
});

// New route for predicting the number of eggs
router.post('/predict', async (req, res) => {
  try {
    const numShrimps = parseFloat(req.body.numShrimps);
    

    if (isNaN(numShrimps)) {
      return res.status(400).json({ success: false, message: 'Invalid input for numShrimps' });
    }
    // Predict the number of eggs using the trained regression model
    const predictedEggs = regressionModel.predict([[numShrimps]])[0];

    // Store data in PostgreSQL
    const currentDate = new Date().toISOString().split('T')[0];
    const query = {
      text: 'INSERT INTO spawn_data (date, num_shrimps, predicted_eggs) VALUES ($1, $2, $3)',
      values: [currentDate, numShrimps, predictedEggs],
    };

    await pool.query(query);
    const responseHTML = `
    <div style="text-align: center; padding: 20px; background-color: #f0f0f0; border-radius: 10px;">
      <h2 style="color: #4CAF50;">Prediction Result</h2>
      <p>Predicted number of eggs after 12-14 days: ${predictedEggs}</p>
    </div>
  `;
    res.send(responseHTML);
  } catch (error) {
    console.error('Error predicting eggs:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;



