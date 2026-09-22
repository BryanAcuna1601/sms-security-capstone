const Reporte = require('../models/Reporte');
const { inferirCategoriaYEmpresa } = require('../services/inferenciaService');

// Crear un nuevo reporte
const crearReporte = async (req, res) => {
  try {
    const datos = { ...req.body };

    // Si no vienen categoria o empresa_mencionada, se infieren automáticamente
    if (!datos.categoria || !datos.empresa_mencionada) {
      const inferido = inferirCategoriaYEmpresa(datos.mensaje);
      datos.categoria = datos.categoria || inferido.categoria;
      datos.empresa_mencionada = datos.empresa_mencionada || inferido.empresa_mencionada;
    }
    
    const nuevoReporte = new Reporte(datos);
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

// Actualizar un reporte
const actualizarReporte = async (req, res) => {
  try {
    const reporteActualizado = await Reporte.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!reporteActualizado) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    res.status(200).json(reporteActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un reporte
const eliminarReporte = async (req, res) => {
  try {
    const reporteEliminado = await Reporte.findByIdAndDelete(req.params.id);
    if (!reporteEliminado) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    res.status(200).json({ mensaje: 'Reporte eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { crearReporte, obtenerReportes, actualizarReporte, eliminarReporte };