const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// sign up route
router.post('/signup', userController.sign_up);

// log in route
router.post('/login', userController.log_in);

// get authenticated user's profile info
router.get('/profile', auth.requireAuth, userController.get_info);

// update authenticated user's profile info
router.put('/edit-profile', auth.requireAuth, userController.edit_info);

// change authenticated user's password
router.put('/change-password', auth.requireAuth, userController.change_password);

// get all users
router.get('/allUsers', auth.requireAdmin, userController.get_users);

// authenticate user
router.post('/authenticate', auth.requireAdmin, userController.authenticate);

// delete a user or ignore authentication
router.delete('/delete', auth.requireAdmin, userController.delete_user);

// log out
router.post('/logout', auth.requireAuth, userController.log_out);

module.exports = router;