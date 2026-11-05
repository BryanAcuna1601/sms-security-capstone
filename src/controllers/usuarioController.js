const Usuario = require('../models/Usuario');

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ fecha_registro: -1 });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(usuarioActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuarioEliminado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerUsuarios, actualizarUsuario, eliminarUsuario };