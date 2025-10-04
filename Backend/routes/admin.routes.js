// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { roleCheck } = require('../middlewares/roleCheck');
const { createUser, changeUserRole, assignManager } = require('../controllers/admin.controller');

// All routes protected & only Admins
router.post('/create-user', protect, roleCheck(['Admin']), createUser);
router.put('/change-role', protect, roleCheck(['Admin']), changeUserRole);
router.put('/assign-manager', protect, roleCheck(['Admin']), assignManager);

module.exports = router;
