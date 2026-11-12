
const CacheDominio = require('../models/CacheDominio');

jest.mock('../models/CacheDominio');

const {
  buscarEnCache,
  guardarEnCache
} = require('../services/cacheDominioService');

describe('Pruebas de buscarEnCache', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Debe buscar un dominio en la caché', async () => {
    const resultadoMock = {
      dominio: 'bancoestado.cl',
      resultado_virustotal: { maliciosos: 0 },
      dias_antiguedad: 300
    };

    CacheDominio.findOne.mockResolvedValue(resultadoMock);

    const resultado = await buscarEnCache('bancoestado.cl');

    expect(CacheDominio.findOne).toHaveBeenCalledWith({
      dominio: 'bancoestado.cl'
    });

    expect(resultado).toEqual(resultadoMock);
  });

  test('Debe retornar null cuando no recibe un dominio', async () => {
    const resultado = await buscarEnCache('');

    expect(resultado).toBeNull();
    expect(CacheDominio.findOne).not.toHaveBeenCalled();
  });

  test('Debe retornar null cuando el dominio no existe en caché', async () => {
    CacheDominio.findOne.mockResolvedValue(null);

    const resultado = await buscarEnCache('dominioinexistente.cl');

    expect(resultado).toBeNull();
  });

});

describe('Pruebas de guardarEnCache', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Debe guardar los resultados correctamente', async () => {
    const resultadoVirusTotal = {
      maliciosos: 2,
      sospechosos: 1,
      inofensivos: 5,
      encontrado: true
    };

    CacheDominio.findOneAndUpdate.mockResolvedValue({});

    await guardarEnCache(
      'bancoestado.cl',
      resultadoVirusTotal,
      300
    );

    expect(CacheDominio.findOneAndUpdate).toHaveBeenCalledTimes(1);

    const [filtro, datos, opciones] =
      CacheDominio.findOneAndUpdate.mock.calls[0];

    expect(filtro).toEqual({
      dominio: 'bancoestado.cl'
    });

    expect(datos.dominio).toBe('bancoestado.cl');
    expect(datos.resultado_virustotal).toEqual(resultadoVirusTotal);
    expect(datos.dias_antiguedad).toBe(300);
    expect(datos.fecha_consulta).toBeInstanceOf(Date);
    expect(datos.expiracion).toBeInstanceOf(Date);

    expect(opciones).toEqual({
      upsert: true,
      returnDocument: 'after'
    });
  });

  test('Debe establecer una expiración de 24 horas', async () => {
    CacheDominio.findOneAndUpdate.mockResolvedValue({});

    const antes = Date.now();

    await guardarEnCache(
      'bancoestado.cl',
      { maliciosos: 0 },
      300
    );

    const despues = Date.now();

    const [, datos] = CacheDominio.findOneAndUpdate.mock.calls[0];

    const duracion =
      datos.expiracion.getTime() - datos.fecha_consulta.getTime();

    expect(duracion).toBe(24 * 60 * 60 * 1000);
    expect(datos.fecha_consulta.getTime()).toBeGreaterThanOrEqual(antes);
    expect(datos.fecha_consulta.getTime()).toBeLessThanOrEqual(despues);
  });

  test('No debe guardar si no recibe un dominio', async () => {
    await guardarEnCache(
      '',
      { maliciosos: 0 },
      300
    );

    expect(CacheDominio.findOneAndUpdate).not.toHaveBeenCalled();
  });

});
