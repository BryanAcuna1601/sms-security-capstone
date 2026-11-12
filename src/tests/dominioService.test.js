
const axios = require('axios');
const net = require('net');

jest.mock('axios');
jest.mock('net');

const {
  consultarAntiguedadDominio,
  extraerDominio
} = require('../services/dominioService');

describe('Pruebas de extraerDominio', () => {

  test('Debe extraer el dominio de una URL HTTPS', () => {
    const resultado = extraerDominio('https://www.bancoestado.cl/pago');

    expect(resultado).toBe('bancoestado.cl');
  });

  test('Debe extraer el dominio cuando no tiene protocolo', () => {
    const resultado = extraerDominio('2h.ae/JOVi');

    expect(resultado).toBe('2h.ae');
  });

  test('Debe extraer el dominio de una URL con HTTP', () => {
    const resultado = extraerDominio('http://bit.ly/4bPEqZH');

    expect(resultado).toBe('bit.ly');
  });

  test('Debe retornar null cuando recibe una URL inválida', () => {
    const resultado = extraerDominio('esto no es una url');

    expect(resultado).toBeNull();
  });

  test('Debe retornar null cuando recibe un valor vacío', () => {
    const resultado = extraerDominio('');

    expect(resultado).toBeNull();
  });

});

describe('Pruebas de consultarAntiguedadDominio', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Debe consultar RDAP para dominios que no terminan en .cl', async () => {
    const fechaRegistro = new Date();
    fechaRegistro.setDate(fechaRegistro.getDate() - 45);

    axios.get.mockResolvedValue({
      data: {
        events: [
          {
            eventAction: 'registration',
            eventDate: fechaRegistro.toISOString()
          }
        ]
      }
    });

    const resultado = await consultarAntiguedadDominio('https://2h.ae/JOVi');

    expect(resultado.dominio).toBe('2h.ae');
    expect(resultado.dias_antiguedad).toBe(45);
    expect(resultado.encontrado).toBe(true);

    expect(axios.get).toHaveBeenCalledWith(
      'https://rdap.org/domain/2h.ae',
      { timeout: 6000 }
    );
  });


test('Debe consultar WHOIS de NIC Chile para dominios .cl', async () => {
  const fechaRegistro = new Date();
  fechaRegistro.setDate(fechaRegistro.getDate() - 30);

  const fecha = fechaRegistro.toISOString().slice(0, 10);

  const manejadores = {};

  const socket = {
    on: jest.fn((evento, callback) => {
      manejadores[evento] = callback;
      return socket;
    }),
    write: jest.fn(),
    setTimeout: jest.fn(),
    destroy: jest.fn()
  };

  net.createConnection.mockReturnValue(socket);

  const resultadoPromise = consultarAntiguedadDominio(
    'https://bancoestado.cl'
  );

  // Simulamos la conexión con el servidor WHOIS.
  manejadores.connect();

  // Simulamos la respuesta de NIC Chile.
  manejadores.data(
    Buffer.from(`Creation date: ${fecha}`)
  );

  // Simulamos el cierre de la conexión.
  manejadores.end();

  const resultado = await resultadoPromise;

  expect(net.createConnection).toHaveBeenCalledWith(
    43,
    'whois.nic.cl'
  );

  expect(socket.write).toHaveBeenCalledWith(
    'bancoestado.cl\r\n'
  );

  expect(resultado.dominio).toBe('bancoestado.cl');
  expect(resultado.dias_antiguedad).toBe(30);
  expect(resultado.encontrado).toBe(true);
});


  test('Debe retornar encontrado false cuando RDAP no tiene fecha de registro', async () => {
    axios.get.mockResolvedValue({
      data: {
        events: []
      }
    });

    const resultado = await consultarAntiguedadDominio(
      'https://2h.ae/JOVi'
    );

    expect(resultado).toEqual({
      dominio: '2h.ae',
      dias_antiguedad: null,
      encontrado: false
    });
  });

  test('Debe manejar errores de consulta RDAP', async () => {
    axios.get.mockRejectedValue(new Error('Error de conexión'));

    const resultado = await consultarAntiguedadDominio(
      'https://2h.ae/JOVi'
    );

    expect(resultado).toEqual({
      dominio: '2h.ae',
      dias_antiguedad: null,
      encontrado: false
    });
  });

});
