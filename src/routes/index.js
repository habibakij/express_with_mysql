const express = require('express');
const router = express.Router();
const placeRoutes = require('./placeRoutes');

router.use('/places', placeRoutes);

module.exports = router;
