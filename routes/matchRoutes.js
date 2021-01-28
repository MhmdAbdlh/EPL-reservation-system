const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const auth = require('../middleware/authMiddleware');

// all matches
router.get('/all', matchController.allMatches);

// authenticated user's matches
router.get('/my-matches', auth.requireAuth, matchController.myMatches);

// match grid given authenticated user
router.get('/grid', auth.requireAuth, matchController.get_grid);

// add match
router.post('/add', auth.requireManager, matchController.insert_match);

//edit match
router.put('/edit', auth.requireManager, matchController.edit_match);

module.exports = router;