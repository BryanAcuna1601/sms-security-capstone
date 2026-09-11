const Reporte = require('../models/Reporte');

// Crear un nuevo reporte
const crearReporte = async (req, res) => {
  try {
    const nuevoReporte = new Reporte(req.body);
    const reporteGuardado = await nuevoReporte.save();
    res.status(201).json(reporteGuardado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los reportes
const obtenerReportes = async (req, res) => {
  try {
    const reportes = await Reporte.find();
    res.status(200).json(reportes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { crearReporte, obtenerReportes };