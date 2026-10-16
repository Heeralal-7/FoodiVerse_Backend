// src/routes/User/foodRoutes.js
const express = require('express');
const router = express.Router();
const { getNearbyFoods } = require('../../controllers/User/foodController');

// POST route (taki user body me lat/long safely bhej sake)
router.post('/nearby', getNearbyFoods);

module.exports = router;