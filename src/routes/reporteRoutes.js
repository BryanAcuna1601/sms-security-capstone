const express = require('express');
const router = express.Router();
const { crearReporte, obtenerReportes } = require('../controllers/reporteController');

router.post('/', crearReporte);
router.get('/', obtenerReportes);

module.exports = router;