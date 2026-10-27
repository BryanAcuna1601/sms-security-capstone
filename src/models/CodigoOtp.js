const mongoose = require('mongoose');

const codigoOtpSchema = new mongoose.Schema({
  telefono: {
    type: String,
    required: true
  },
  codigo: {
    type: String,
    required: true
  },
  expiracion: {
    type: Date,
    required: true
  }
});

codigoOtpSchema.index({ expiracion: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('CodigoOtp', codigoOtpSchema);