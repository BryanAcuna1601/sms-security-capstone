const axios = require('axios');
const net = require('net');

function extraerDominio(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return null;
  }
}

async function consultarRDAP(dominio) {
  try {
    const response = await axios.get(`https://rdap.org/domain/${dominio}`, { timeout: 6000 });
    const eventos = response.data.events || [];
    const registro = eventos.find(e => e.eventAction === 'registration');

    if (!registro) return { dias_antiguedad: null, encontrado: false };

    const fechaRegistro = new Date(registro.eventDate);
    const diasAntiguedad = Math.floor((Date.now() - fechaRegistro) / (1000 * 60 * 60 * 24));

    return { dias_antiguedad: diasAntiguedad, encontrado: true };
  } catch (error) {
    return { dias_antiguedad: null, encontrado: false };
  }
}

function consultarWhoisCL(dominio) {
  return new Promise((resolve) => {
    const socket = net.createConnection(43, 'whois.nic.cl');
    let data = '';

    socket.on('connect', () => socket.write(dominio + '\r\n'));
    socket.on('data', (chunk) => (data += chunk.toString()));
    socket.on('end', () => {
      const match = data.match(/Creation date:\s*(\d{4}-\d{2}-\d{2})/);
      if (!match) return resolve({ dias_antiguedad: null, encontrado: false });

      const fechaRegistro = new Date(match[1]);
      const diasAntiguedad = Math.floor((Date.now() - fechaRegistro.getTime()) / (1000 * 60 * 60 * 24));
      resolve({ dias_antiguedad: diasAntiguedad, encontrado: true });
    });
    socket.on('error', () => resolve({ dias_antiguedad: null, encontrado: false }));
    socket.setTimeout(6000, () => {
      socket.destroy();
      resolve({ dias_antiguedad: null, encontrado: false });
    });
  });
}

// El proposito de esta función es poder elegir entre RDAP o WHOIS (dependiendo del dominio)
async function consultarAntiguedadDominio(url) {
  const dominio = extraerDominio(url);
  if (!dominio) return { dominio: null, dias_antiguedad: null, encontrado: false };

  const resultado = dominio.endsWith('.cl')
    ? await consultarWhoisCL(dominio)
    : await consultarRDAP(dominio);

  return { dominio, ...resultado };
}

module.exports = { consultarAntiguedadDominio };