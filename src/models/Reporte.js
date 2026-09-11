const mongoose = require('mongoose');

const reporteSchema = new mongoose.Schema({
  mensaje: {
    type: String,
    required: true
  },
  remitente_tecnico: {
    type: String,
    default: 'desconocido'
  },
  empresa_mencionada: {
    type: String,
    default: 'sin_identificar'
  },
  url: {
    type: String,
    default: ''
  },
  categoria: {
    type: String,
    default: 'sin_clasificar'
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmado_smishing', 'falso_positivo'],
    default: 'pendiente'
  },
  score_riesgo: {
    type: Number,
    default: null
  },
  analisis: {
    virustotal_maliciosos: { type: Number, default: null },
    dominio_dias_antiguedad: { type: Number, default: null },
    coincide_patron_dataset: { type: Boolean, default: false }
  },
  fecha_reporte: {
    type: Date,
    default: Date.now
  },
  reportado_por: {
    type: String,
    default: 'usuario_anonimo'
  }
});

module.exports = mongoose.model('Reporte', reporteSchema);