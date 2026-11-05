const express = require('express');
const router = express.Router();
const { obtenerUsuarios, actualizarUsuario, eliminarUsuario } = require('../controllers/usuarioController');
const { verificarToken, requiereAdmin } = require('../middleware/auth');

router.get('/', verificarToken, requiereAdmin, obtenerUsuarios);
router.patch('/:id', verificarToken, requiereAdmin, actualizarUsuario);
router.delete('/:id', verificarToken, requiereAdmin, eliminarUsuario);

module.exports = router;