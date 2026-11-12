
const axios = require('axios');
const { desacortarUrl } = require('../services/desacortadorService');

jest.mock('axios');

describe('Pruebas de desacortarUrl', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Debe procesar correctamente un enlace acortado de 2h.ae', async () => {
    const url = 'https://2h.ae/JOVi';

    axios.get.mockResolvedValue({
      request: {
        res: {
          responseUrl: 'https://destino-simulado.cl/pago'
        }
      }
    });

    const resultado = await desacortarUrl(url);

    expect(resultado).toEqual({
      url_original: url,
      url_final: 'https://destino-simulado.cl/pago',
      fue_acortada: true
    });
  });

  test('Debe procesar correctamente un enlace acortado de Bitly', async () => {
    const url = 'https://bit.ly/4bPEqZH';

    axios.get.mockResolvedValue({
      request: {
        res: {
          responseUrl: 'https://destino-simulado.cl/paquete'
        }
      }
    });

    const resultado = await desacortarUrl(url);

    expect(resultado).toEqual({
      url_original: url,
      url_final: 'https://destino-simulado.cl/paquete',
      fue_acortada: true
    });
  });

  test('Debe indicar que la URL no fue acortada cuando mantiene el mismo dominio', async () => {
    const url = 'https://2h.ae/JOVi';

    axios.get.mockResolvedValue({
      request: {
        res: {
          responseUrl: 'https://2h.ae/JOVi'
        }
      }
    });

    const resultado = await desacortarUrl(url);

    expect(resultado).toEqual({
      url_original: url,
      url_final: url,
      fue_acortada: false
    });
  });

  test('Debe intentar HTTPS cuando la URL no tiene protocolo', async () => {
    const url = '2h.ae/JOVi';

    axios.get.mockResolvedValue({
      request: {
        res: {
          responseUrl: 'https://destino-simulado.cl/pago'
        }
      }
    });

    const resultado = await desacortarUrl(url);

    expect(axios.get).toHaveBeenCalledWith(
      'https://2h.ae/JOVi',
      expect.any(Object)
    );

    expect(resultado.url_original).toBe(url);
    expect(resultado.fue_acortada).toBe(true);
  });

  test('Debe retornar error cuando no puede acceder al enlace', async () => {
    const url = 'https://2h.ae/JOVi';

    axios.get.mockRejectedValue(new Error('Error de conexión'));

    const resultado = await desacortarUrl(url);

    expect(resultado).toEqual({
      url_original: url,
      url_final: url,
      fue_acortada: false,
      error: true
    });
  });

  test('Debe intentar HTTP si HTTPS falla en una URL sin protocolo', async () => {
    const url = '2h.ae/JOVi';

    axios.get
      .mockRejectedValueOnce(new Error('Error HTTPS'))
      .mockResolvedValueOnce({
        request: {
          res: {
            responseUrl: 'http://2h.ae/JOVi'
          }
        }
      });

    const resultado = await desacortarUrl(url);

    expect(axios.get).toHaveBeenCalledTimes(2);

    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      'https://2h.ae/JOVi',
      expect.any(Object)
    );

    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      'http://2h.ae/JOVi',
      expect.any(Object)
    );

    expect(resultado.url_final).toBe('http://2h.ae/JOVi');
    expect(resultado.fue_acortada).toBe(false);
  });

});
