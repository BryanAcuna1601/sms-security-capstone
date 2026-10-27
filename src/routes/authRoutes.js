const express = require('express');
const router = express.Router();
const { pedirOtp, confirmarOtp } = require('../controllers/authController');

router.post('/solicitar-otp', pedirOtp);
router.post('/verificar-otp', confirmarOtp);

module.exports = router;