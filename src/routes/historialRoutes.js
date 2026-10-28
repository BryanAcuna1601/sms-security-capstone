const express = require('express');
const router = express.Router();
const { obtenerHistorial } = require('../controllers/historialController');
const { verificarToken } = require('../middleware/auth');

router.get('/', verificarToken, obtenerHistorial);

module.exports = router;