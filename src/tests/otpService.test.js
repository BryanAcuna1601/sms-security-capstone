
const CodigoOtp = require('../models/CodigoOtp');

jest.mock('../models/CodigoOtp');

const {
  solicitarOtp,
  verificarOtp
} = require('../services/otpService');

describe('Pruebas de solicitarOtp', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Debe generar un código OTP de 6 dígitos', async () => {
    CodigoOtp.findOneAndUpdate.mockResolvedValue({});

    const codigo = await solicitarOtp('+56912345678');

    expect(codigo).toMatch(/^\d{6}$/);
  });

  test('Debe guardar el código asociado al teléfono', async () => {
    CodigoOtp.findOneAndUpdate.mockResolvedValue({});

    const codigo = await solicitarOtp('+56912345678');

    expect(CodigoOtp.findOneAndUpdate).toHaveBeenCalledTimes(1);

    const [filtro, datos, opciones] =
      CodigoOtp.findOneAndUpdate.mock.calls[0];

    expect(filtro).toEqual({
      telefono: '+56912345678'
    });

    expect(datos.telefono).toBe('+56912345678');
    expect(datos.codigo).toBe(codigo);
    expect(datos.expiracion).toBeInstanceOf(Date);

    expect(opciones).toEqual({
      upsert: true,
      returnDocument: 'after'
    });
  });

  test('Debe establecer una expiración de 5 minutos', async () => {
    CodigoOtp.findOneAndUpdate.mockResolvedValue({});

    const antes = Date.now();

    await solicitarOtp('+56912345678');

    const despues = Date.now();

    const [, datos] = CodigoOtp.findOneAndUpdate.mock.calls[0];

    const duracion =
      datos.expiracion.getTime() - antes;

    expect(duracion).toBeGreaterThanOrEqual(5 * 60 * 1000);
    expect(datos.expiracion.getTime()).toBeLessThanOrEqual(
      despues + 5 * 60 * 1000
    );
  });

});

describe('Pruebas de verificarOtp', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Debe retornar true cuando el código es válido', async () => {
    const registroMock = {
      _id: '12345',
      telefono: '+56912345678',
      codigo: '123456'
    };

    CodigoOtp.findOne.mockResolvedValue(registroMock);
    CodigoOtp.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const resultado = await verificarOtp(
      '+56912345678',
      '123456'
    );

    expect(CodigoOtp.findOne).toHaveBeenCalledWith({
      telefono: '+56912345678',
      codigo: '123456',
      expiracion: {
        $gt: expect.any(Date)
      }
    });

    expect(CodigoOtp.deleteOne).toHaveBeenCalledWith({
      _id: '12345'
    });

    expect(resultado).toBe(true);
  });

  test('Debe retornar false cuando el código es incorrecto o no existe', async () => {
    CodigoOtp.findOne.mockResolvedValue(null);

    const resultado = await verificarOtp(
      '+56912345678',
      '999999'
    );

    expect(resultado).toBe(false);
    expect(CodigoOtp.deleteOne).not.toHaveBeenCalled();
  });

  test('Debe retornar false cuando el código está expirado', async () => {
    CodigoOtp.findOne.mockResolvedValue(null);

    const resultado = await verificarOtp(
      '+56912345678',
      '123456'
    );

    const [filtro] = CodigoOtp.findOne.mock.calls[0];

    expect(filtro.expiracion.$gt).toBeInstanceOf(Date);
    expect(resultado).toBe(false);
    expect(CodigoOtp.deleteOne).not.toHaveBeenCalled();
  });

});
