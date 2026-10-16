const mongoose = require('mongoose');

const cacheDominioSchema = new mongoose.Schema({
  dominio: {
    type: String,
    required: true,
    unique: true
  },
  resultado_virustotal: {
    type: Object,
    default: null
  },
  dias_antiguedad: {
    type: Number,
    default: null
  },
  fecha_consulta: {
    type: Date,
    default: Date.now
  },
  expiracion: {
    type: Date,
    required: true
  }
});

cacheDominioSchema.index({ expiracion: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('CacheDominio', cacheDominioSchema);