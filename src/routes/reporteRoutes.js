const express = require('express');
const router = express.Router();
const { crearReporte, obtenerReportes, actualizarReporte, eliminarReporte } = require('../controllers/reporteController');
const { verificarToken, requiereAdmin } = require('../middleware/auth');

router.post('/', verificarToken, crearReporte);
router.get('/', obtenerReportes);
router.patch('/:id', verificarToken, requiereAdmin, actualizarReporte);
router.delete('/:id', verificarToken, requiereAdmin, eliminarReporte);

module.exports = router;