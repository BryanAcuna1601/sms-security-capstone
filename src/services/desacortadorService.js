const axios = require('axios');

// Sigue las redirecciones de un link acortado y devuelve la URL final real
async function desacortarUrl(url) {
  try {
    const response = await axios.get(url, {
      maxRedirects: 10,        // sigue hasta 10 redirecciones en cadena
      timeout: 8000,           // 8 segundos máximo de espera
      validateStatus: () => true // no lance error aunque el status no sea 200
    });

    // axios sigue las redirecciones automáticamente y expone la URL final aquí:
    const urlFinal = response.request.res.responseUrl || url;

    return {
      url_original: url,
      url_final: urlFinal,
      fue_acortada: urlFinal !== url
    };
  } catch (error) {
    console.error('Error al desacortar URL:', error.message);
    return {
      url_original: url,
      url_final: url, // si falla, usamos la original como respaldo
      fue_acortada: false,
      error: true
    };
  }
}

module.exports = { desacortarUrl };