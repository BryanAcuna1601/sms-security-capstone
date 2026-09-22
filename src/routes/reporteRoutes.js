const express = require('express');
const router = express.Router();
const { crearReporte, obtenerReportes, actualizarReporte, eliminarReporte } = require('../controllers/reporteController');

router.post('/', crearReporte);
router.get('/', obtenerReportes);
router.patch('/:id', actualizarReporte);
router.delete('/:id', eliminarReporte);

module.exports = router;