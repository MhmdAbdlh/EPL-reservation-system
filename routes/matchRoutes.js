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
router.post('/add',  matchController.insert_match);

//edit match
router.put('/edit', matchController.edit_match);

// reserve seat(s)
router.post('/reservation', auth.requireAuth, matchController.reserve);

// cancel a reservation
router.delete('/reservation', auth.requireAuth, matchController.cancelReservation);

module.exports = router;