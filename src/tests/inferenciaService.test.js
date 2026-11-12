
const { inferirCategoriaYEmpresa } = require('../services/inferenciaService');

describe('Pruebas de inferirCategoriaYEmpresa', () => {

  test('Debe identificar Chilexpress como empresa de encomiendas', () => {
    const mensaje = 'Tu paquete de Chilexpress está retenido';
    const resultado = inferirCategoriaYEmpresa(mensaje);

    expect(resultado).toEqual({
      categoria: 'encomiendas',
      empresa_mencionada: 'Chilexpress'
    });
  });

  test('Debe identificar Banco Estado como empresa bancaria', () => {
    const mensaje = 'Banco Estado: verifica tu cuenta rut';
    const resultado = inferirCategoriaYEmpresa(mensaje);

    expect(resultado).toEqual({
      categoria: 'banca',
      empresa_mencionada: 'Banco Estado'
    });
  });

  test('Debe identificar SII como organismo de gobierno', () => {
    const mensaje = 'El SII informa que tienes una devolución pendiente';
    const resultado = inferirCategoriaYEmpresa(mensaje);

    expect(resultado).toEqual({
      categoria: 'gobierno',
      empresa_mencionada: 'SII'
    });
  });

  test('Debe identificar Copec como empresa de retail', () => {
    const mensaje = 'Actualiza tus datos en Copec';
    const resultado = inferirCategoriaYEmpresa(mensaje);

    expect(resultado).toEqual({
      categoria: 'retail',
      empresa_mencionada: 'Copec'
    });
  });

  test('Debe reconocer nombres sin distinguir mayúsculas y minúsculas', () => {
    const mensaje = 'Tienes un mensaje de CHILEXPRESS';
    const resultado = inferirCategoriaYEmpresa(mensaje);

    expect(resultado.empresa_mencionada).toBe('Chilexpress');
  });

  test('Debe reconocer nombres aunque tengan tildes', () => {
    const mensaje = 'Tienes una notificación de Tesorería';
    const resultado = inferirCategoriaYEmpresa(mensaje);

    expect(resultado).toEqual({
      categoria: 'gobierno',
      empresa_mencionada: 'Tesorería General'
    });
  });

  test('Debe retornar sin_clasificar cuando no reconoce una empresa', () => {
    const mensaje = 'Hola, tienes un mensaje importante';
    const resultado = inferirCategoriaYEmpresa(mensaje);

    expect(resultado).toEqual({
      categoria: 'sin_clasificar',
      empresa_mencionada: 'sin_identificar'
    });
  });

  test('Debe retornar sin_clasificar cuando el mensaje está vacío', () => {
    const resultado = inferirCategoriaYEmpresa('');

    expect(resultado).toEqual({
      categoria: 'sin_clasificar',
      empresa_mencionada: 'sin_identificar'
    });
  });

  test('Debe retornar sin_clasificar cuando recibe un valor inválido', () => {
    const resultado = inferirCategoriaYEmpresa(null);

    expect(resultado).toEqual({
      categoria: 'sin_clasificar',
      empresa_mencionada: 'sin_identificar'
    });
  });

});
