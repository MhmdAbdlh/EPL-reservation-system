const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const auth = require('../middleware/authMiddleware');

// all matches
router.get('/all', matchController.allMatches);

// add match
router.post('/add', auth.requireManager, matchController.insert_match);

module.exports = router;