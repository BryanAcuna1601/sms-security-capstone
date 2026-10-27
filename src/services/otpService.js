const CodigoOtp = require('../models/CodigoOtp');

const TTL_MINUTOS = 5;

function generarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function solicitarOtp(telefono) {
  const codigo = generarCodigo();
  const expiracion = new Date(Date.now() + TTL_MINUTOS * 60 * 1000);

  await CodigoOtp.findOneAndUpdate(
    { telefono },
    { telefono, codigo, expiracion },
    { upsert: true, returnDocument: 'after' }
  );

  return codigo;
}

async function verificarOtp(telefono, codigo) {
  const registro = await CodigoOtp.findOne({ telefono, codigo, expiracion: { $gt: new Date() } });

  if (!registro) {
    return false;
  }

  await CodigoOtp.deleteOne({ _id: registro._id });
  return true;
}

module.exports = { solicitarOtp, verificarOtp };