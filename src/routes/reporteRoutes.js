const express = require('express');
const router = express.Router();
const { crearReporte, obtenerReportes, actualizarReporte, eliminarReporte } = require('../controllers/reporteController');
const { verificarTokenOpcional } = require('../middleware/authOpcional');
const { verificarToken, requiereAdmin } = require('../middleware/auth');

router.post('/', verificarTokenOpcional, crearReporte);
router.get('/', obtenerReportes);
router.patch('/:id', verificarToken, requiereAdmin, actualizarReporte);
router.delete('/:id', verificarToken, requiereAdmin, eliminarReporte);

module.exports = router;