
const { extraerUrlDelMensaje } = require('../utils/extraerUrl');

describe('Pruebas de extraerUrlDelMensaje', () => {

  test('Debe extraer una URL de un mensaje SMS', () => {
    const mensaje = 'Tu paquete está retenido, ingresa a https://ejemplo.cl';

    const resultado = extraerUrlDelMensaje(mensaje);

    expect(resultado).toBe('https://ejemplo.cl');
  });

  test('Debe retornar null cuando el mensaje no contiene URL', () => {
    const mensaje = 'Tu cuenta fue actualizada correctamente';

    const resultado = extraerUrlDelMensaje(mensaje);

    expect(resultado).toBeNull();
  });

  test('Debe retornar null cuando el mensaje está vacío', () => {
    const resultado = extraerUrlDelMensaje('');

    expect(resultado).toBeNull();
  });

  test('Debe extraer una URL sin protocolo HTTP o HTTPS', () => {
    const mensaje = 'Visita nuestra página www.ejemplo.cl';

    const resultado = extraerUrlDelMensaje(mensaje);

    expect(resultado).toBe('www.ejemplo.cl');
  });

  test('Debe extraer el enlace acortado de Bitly', () => {
    const mensaje = 'Revisa tu paquete aquí: https://bit.ly/4bPEqZH';

    const resultado = extraerUrlDelMensaje(mensaje);

    expect(resultado).toBe('https://bit.ly/4bPEqZH');
  });

  test('Debe extraer un dominio con ruta de pago', () => {
    const mensaje = 'Ingresa aquí para pagar: wq24.online/pago';

    const resultado = extraerUrlDelMensaje(mensaje);

    expect(resultado).toBe('wq24.online/pago');
  });

});
