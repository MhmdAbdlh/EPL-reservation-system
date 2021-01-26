const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const auth = require('../middleware/authMiddleware');

// list all teams
router.get('/all', teamController.allTeams);

module.exports = router;