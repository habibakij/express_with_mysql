const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');

router.get('/new_place', placeController.getPlaces);
router.post('/add_new_place', placeController.addPlace);

module.exports = router;
