const axios = require('axios');

async function desacortarUrl(url) {
  try {
    const response = await axios.get(url, {
      maxRedirects: 10,        
      timeout: 8000,
      validateStatus: () => true
    });

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