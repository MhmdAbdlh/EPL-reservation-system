const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// sign up route
router.post('/signup', userController.sign_up);

//log in route
router.post('/login', userController.log_in);

// get authenticated user's profile info
router.get('/profile', auth.requireAuth, userController.get_info);

module.exports = router;