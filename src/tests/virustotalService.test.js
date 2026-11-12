
const axios = require('axios');

jest.mock('axios');

jest.mock('../services/desacortadorService', () => ({
  desacortarUrl: jest.fn()
}));

const { desacortarUrl } = require('../services/desacortadorService');
const {
  consultarUrl,
  analizarUrl
} = require('../services/virustotalService');

describe('Pruebas de consultarUrl', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Debe devolver las estadísticas cuando VirusTotal encuentra la URL', async () => {
    axios.get.mockResolvedValue({
      data: {
        data: {
          attributes: {
            last_analysis_stats: {
              malicious: 5,
              suspicious: 2,
              harmless: 60
            }
          }
        }
      }
    });

    const resultado = await consultarUrl('https://2h.ae/JOVi');

    expect(resultado).toEqual({
      maliciosos: 5,
      sospechosos: 2,
      inofensivos: 60,
      encontrado: true
    });
  });

  test('Debe devolver cero detecciones cuando VirusTotal responde 404', async () => {
    axios.get.mockRejectedValue({
      response: {
        status: 404
      }
    });

    const resultado = await consultarUrl('https://2h.ae/JOVi');

    expect(resultado).toEqual({
      maliciosos: 0,
      sospechosos: 0,
      inofensivos: 0,
      encontrado: false
    });
  });

  test('Debe manejar errores de conexión con VirusTotal', async () => {
    axios.get.mockRejectedValue(new Error('Error de conexión'));

    const resultado = await consultarUrl('https://2h.ae/JOVi');

    expect(resultado).toEqual({
      maliciosos: null,
      sospechosos: null,
      inofensivos: null,
      encontrado: false,
      error: true
    });
  });

  test('Debe codificar correctamente la URL enviada a VirusTotal', async () => {
    axios.get.mockResolvedValue({
      data: {
        data: {
          attributes: {
            last_analysis_stats: {
              malicious: 1,
              suspicious: 0,
              harmless: 70
            }
          }
        }
      }
    });

    const url = 'https://2h.ae/JOVi';

    await consultarUrl(url);

    const urlCodificada = Buffer.from(url)
      .toString('base64')
      .replace(/=+$/, '');

    expect(axios.get).toHaveBeenCalledWith(
      `https://www.virustotal.com/api/v3/urls/${urlCodificada}`,
      expect.objectContaining({
        headers: {
          'x-apikey': process.env.VIRUSTOTAL_API_KEY
        }
      })
    );
  });

});

describe('Pruebas de analizarUrl', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Debe desacortar y analizar correctamente un enlace', async () => {
    desacortarUrl.mockResolvedValue({
      url_original: 'https://2h.ae/JOVi',
      url_final: 'https://destino-simulado.cl/pago',
      fue_acortada: true
    });

    axios.get.mockResolvedValue({
      data: {
        data: {
          attributes: {
            last_analysis_stats: {
              malicious: 3,
              suspicious: 1,
              harmless: 65
            }
          }
        }
      }
    });

    const resultado = await analizarUrl('https://2h.ae/JOVi');

    expect(resultado).toEqual({
      url_original: 'https://2h.ae/JOVi',
      url_final: 'https://destino-simulado.cl/pago',
      fue_acortada: true,
      maliciosos: 3,
      sospechosos: 1,
      inofensivos: 65,
      encontrado: true
    });

    expect(desacortarUrl).toHaveBeenCalledWith('https://2h.ae/JOVi');
  });

  test('Debe conservar la URL original cuando el enlace no fue acortado', async () => {
    desacortarUrl.mockResolvedValue({
      url_original: 'https://2h.ae/JOVi',
      url_final: 'https://2h.ae/JOVi',
      fue_acortada: false
    });

    axios.get.mockResolvedValue({
      data: {
        data: {
          attributes: {
            last_analysis_stats: {
              malicious: 0,
              suspicious: 0,
              harmless: 70
            }
          }
        }
      }
    });

    const resultado = await analizarUrl('https://2h.ae/JOVi');

    expect(resultado.url_original).toBe('https://2h.ae/JOVi');
    expect(resultado.url_final).toBe('https://2h.ae/JOVi');
    expect(resultado.fue_acortada).toBe(false);
    expect(resultado.encontrado).toBe(true);
  });

});
