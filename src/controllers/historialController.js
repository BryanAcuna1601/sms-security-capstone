const HistorialAnalisis = require('../models/HistorialAnalisis');

const obtenerHistorial = async (req, res) => {
  try {
    const historial = await HistorialAnalisis.find({ usuario: req.usuario.id }).sort({ fecha_analisis: -1 });
    res.status(200).json(historial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerHistorial };