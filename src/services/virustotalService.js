const axios = require('axios');
const { desacortarUrl } = require('./desacortadorService');

const VT_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const VT_BASE_URL = 'https://www.virustotal.com/api/v3';

function codificarUrl(url) {
  return Buffer.from(url).toString('base64').replace(/=+$/, '');
}

// Consulta el análisis de una URL específica en VirusTotal
async function consultarUrl(url) {
  try {
    const urlId = codificarUrl(url);

    const response = await axios.get(`${VT_BASE_URL}/urls/${urlId}`, {
      headers: { 'x-apikey': VT_API_KEY }
    });

    const stats = response.data.data.attributes.last_analysis_stats;

    return {
      maliciosos: stats.malicious,
      sospechosos: stats.suspicious,
      inofensivos: stats.harmless,
      encontrado: true
    };
  } catch (error) {
    // Si la URL nunca fue analizada antes, VirusTotal devuelve 404
    if (error.response && error.response.status === 404) {
      return { maliciosos: 0, sospechosos: 0, inofensivos: 0, encontrado: false };
    }
    console.error('Error al consultar VirusTotal:', error.message);
    return { maliciosos: null, sospechosos: null, inofensivos: null, encontrado: false, error: true };
  }
}

// Función principal: desacorta la URL (si aplica) y luego la analiza en VirusTotal
async function analizarUrl(urlOriginal) {
  const { url_final, fue_acortada } = await desacortarUrl(urlOriginal);

  const resultadoVT = await consultarUrl(url_final);

  return {
    url_original: urlOriginal,
    url_final,
    fue_acortada,
    ...resultadoVT
  };
}

module.exports = { consultarUrl, analizarUrl };