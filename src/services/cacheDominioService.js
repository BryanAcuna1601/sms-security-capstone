const CacheDominio = require('../models/CacheDominio');

const TTL_HORAS = 24;

async function buscarEnCache(dominio) {
  if (!dominio) return null;
  return CacheDominio.findOne({ dominio });
}

async function guardarEnCache(dominio, resultadoVirustotal, diasAntiguedad) {
  if (!dominio) return;

  const ahora = new Date();
  const expiracion = new Date(ahora.getTime() + TTL_HORAS * 60 * 60 * 1000);

  await CacheDominio.findOneAndUpdate(
    { dominio },
    { dominio, resultado_virustotal: resultadoVirustotal, dias_antiguedad: diasAntiguedad, fecha_consulta: ahora, expiracion },
    { upsert: true, returnDocument: 'after' }
  );
}

module.exports = { buscarEnCache, guardarEnCache };