const mongoose = require('mongoose');

const historialAnalisisSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    default: 'sin_clasificar'
  },
  empresa_mencionada: {
    type: String,
    default: 'sin_identificar'
  },
  url: {
    type: String,
    default: ''
  },
  score_riesgo: {
    type: Number,
    default: null
  },
  nivel_riesgo: {
    type: String,
    enum: ['bajo', 'medio', 'alto', null],
    default: null
  },
  fue_reportado: {
    type: Boolean,
    default: false
  },
  fecha_analisis: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HistorialAnalisis', historialAnalisisSchema);