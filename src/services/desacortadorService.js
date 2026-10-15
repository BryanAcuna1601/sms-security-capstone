const axios = require('axios');

async function intentarGet(url) {
  return axios.get(url, {
    maxRedirects: 10,
    timeout: 8000,
    validateStatus: () => true
  });
}

async function desacortarUrl(url) {
  const tieneProtocolo = /^https?:\/\//i.test(url);
  const candidatos = tieneProtocolo ? [url] : [`https://${url}`, `http://${url}`];

  for (const candidato of candidatos) {
    try {
      const response = await intentarGet(candidato);
      const urlFinal = response.request.res.responseUrl || candidato;

      return {
        url_original: url,
        url_final: urlFinal,
        fue_acortada: urlFinal !== candidato
      };
    } catch (error) {
      continue;
    }
  }

  console.error(`No se pudo desacortar la URL: ${url}`);
  return {
    url_original: url,
    url_final: tieneProtocolo ? url : `https://${url}`,
    fue_acortada: false,
    error: true
  };
}

module.exports = { desacortarUrl };