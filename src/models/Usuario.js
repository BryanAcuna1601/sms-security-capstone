const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  telefono: {
    type: String,
    required: true,
    unique: true
  },
  rol: {
    type: String,
    enum: ['admin', 'usuario_movil'],
    default: 'usuario_movil'
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);