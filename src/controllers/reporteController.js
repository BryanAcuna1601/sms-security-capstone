const Reporte = require('../models/Reporte');
const { inferirCategoriaYEmpresa } = require('../services/inferenciaService');
const { analizarUrl } = require('../services/virustotalService');
const { consultarAntiguedadDominio } = require('../services/dominioService');
const { calcularScoreRiesgo } = require('../services/scoringService');
const { extraerUrlDelMensaje } = require('../utils/extraerUrl');

// Crear un nuevo reporte
const crearReporte = async (req, res) => {
  try {
    const datos = { ...req.body };

    // Inferencia de categoría y empresa si no vienen en el body
    const inferido = inferirCategoriaYEmpresa(datos.mensaje);
    datos.categoria = datos.categoria || inferido.categoria;
    datos.empresa_mencionada = datos.empresa_mencionada || inferido.empresa_mencionada;

    const coincideConDataset = inferido.categoria !== 'sin_clasificar';

    // Si no vino "url" explícita, intentamos extraerla del mensaje
    const url = datos.url || extraerUrlDelMensaje(datos.mensaje);

    let resultadoVirusTotal = null;
    let resultadoDominio = null;

    if (url) {
      resultadoVirusTotal = await analizarUrl(url);
      resultadoDominio = await consultarAntiguedadDominio(resultadoVirusTotal.url_final);
      datos.url = url;
    }

    const { score_riesgo, detalles } = calcularScoreRiesgo({
      coincideConDataset,
      resultadoVirusTotal,
      resultadoDominio
    });

    datos.score_riesgo = score_riesgo;
    datos.analisis = {
      virustotal_maliciosos: resultadoVirusTotal ? resultadoVirusTotal.maliciosos : null,
      dominio_dias_antiguedad: resultadoDominio ? resultadoDominio.dias_antiguedad : null,
      coincide_patron_dataset: coincideConDataset
    };

    const nuevoReporte = new Reporte(datos);
    const reporteGuardado = await nuevoReporte.save();

    res.status(201).json({
      ...reporteGuardado.toObject(),
      detalles_analisis: detalles
    });
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