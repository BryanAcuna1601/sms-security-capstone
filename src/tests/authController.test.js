
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const otpService = require('../services/otpService');

jest.mock('jsonwebtoken');
jest.mock('../models/Usuario');
jest.mock('../services/otpService');

const {
  pedirOtp,
  confirmarOtp
} = require('../controllers/authController');

describe('Pruebas de pedirOtp', () => {

  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = { body: {} };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('Debe retornar error 400 cuando no recibe teléfono', async () => {
    req.body = {};

    await pedirOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Debes enviar un telefono'
    });

    expect(otpService.solicitarOtp).not.toHaveBeenCalled();
  });

  test('Debe solicitar OTP correctamente', async () => {
    req.body = { telefono: '+56912345678' };

    otpService.solicitarOtp.mockResolvedValue('123456');

    await pedirOtp(req, res);

    expect(otpService.solicitarOtp).toHaveBeenCalledWith(
      '+56912345678'
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Codigo generado (simulado, no se envia SMS real)',
      telefono: '+56912345678',
      codigo: '123456'
    });
  });

  test('Debe retornar error 500 cuando falla solicitarOtp', async () => {
    req.body = { telefono: '+56912345678' };

    otpService.solicitarOtp.mockRejectedValue(
      new Error('Error al generar OTP')
    );

    await pedirOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error al generar OTP'
    });
  });

});

describe('Pruebas de confirmarOtp', () => {

  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = { body: {} };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    process.env.JWT_SECRET = 'secreto-de-prueba';
  });

  test('Debe retornar error 400 cuando faltan datos', async () => {
    req.body = { telefono: '+56912345678' };

    await confirmarOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Debes enviar telefono y codigo'
    });
  });

  test('Debe retornar error 401 cuando el código OTP es inválido', async () => {
    req.body = {
      telefono: '+56912345678',
      codigo: '999999'
    };

    otpService.verificarOtp.mockResolvedValue(false);

    await confirmarOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Codigo invalido o expirado'
    });

    expect(Usuario.findOne).not.toHaveBeenCalled();
  });

  test('Debe iniciar sesión cuando el usuario ya existe', async () => {
    const usuarioMock = {
      _id: 'usuario123',
      telefono: '+56912345678',
      rol: 'usuario'
    };

    req.body = {
      telefono: '+56912345678',
      codigo: '123456'
    };

    otpService.verificarOtp.mockResolvedValue(true);
    Usuario.findOne.mockResolvedValue(usuarioMock);
    jwt.sign.mockReturnValue('token-de-prueba');

    await confirmarOtp(req, res);

    expect(Usuario.findOne).toHaveBeenCalledWith({
      telefono: '+56912345678'
    });

    expect(Usuario.create).not.toHaveBeenCalled();

    expect(jwt.sign).toHaveBeenCalledWith(
      {
        id: 'usuario123',
        telefono: '+56912345678',
        rol: 'usuario'
      },
      'secreto-de-prueba'
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: 'token-de-prueba',
      usuario: usuarioMock
    });
  });

  test('Debe crear un usuario cuando no existe', async () => {
    const usuarioNuevo = {
      _id: 'usuario456',
      telefono: '+56912345678',
      rol: 'usuario'
    };

    req.body = {
      telefono: '+56912345678',
      codigo: '123456'
    };

    otpService.verificarOtp.mockResolvedValue(true);
    Usuario.findOne.mockResolvedValue(null);
    Usuario.create.mockResolvedValue(usuarioNuevo);
    jwt.sign.mockReturnValue('token-nuevo');

    await confirmarOtp(req, res);

    expect(Usuario.create).toHaveBeenCalledWith({
      telefono: '+56912345678'
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: 'token-nuevo',
      usuario: usuarioNuevo
    });
  });

  test('Debe retornar error 500 cuando ocurre un error interno', async () => {
    req.body = {
      telefono: '+56912345678',
      codigo: '123456'
    };

    otpService.verificarOtp.mockRejectedValue(
      new Error('Error interno')
    );

    await confirmarOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error interno'
    });
  });

});
