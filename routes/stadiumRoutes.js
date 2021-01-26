const express = require('express');
const router = express.Router();
const stadiumController = require('../controllers/stadiumController');
const auth = require('../middleware/authMiddleware');

// list all stadiums route
router.get('/all', stadiumController.allStadiums);

// insert stadium
router.post('/add', auth.requireManager, stadiumController.insert_stadium);

module.exports = router;