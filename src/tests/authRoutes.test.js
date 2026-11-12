
jest.mock('../controllers/authController', () => ({
  pedirOtp: jest.fn((req, res) => {
    res.status(200).json({
      mensaje: 'Código OTP enviado correctamente'
    });
  }),

  confirmarOtp: jest.fn((req, res) => {
    res.status(200).json({
      mensaje: 'Código OTP verificado correctamente'
    });
  })
}));

const express = require('express');
const request = require('supertest');

const {
  pedirOtp,
  confirmarOtp
} = require('../controllers/authController');

const authRoutes = require('../routes/authRoutes');

describe('authRoutes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  test('POST /solicitar-otp debe invocar pedirOtp', async () => {
    const respuesta = await request(app)
      .post('/api/auth/solicitar-otp')
      .send({ telefono: '+56912345678' });

    expect(pedirOtp).toHaveBeenCalledTimes(1);
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({
      mensaje: 'Código OTP enviado correctamente'
    });
  });

  test('POST /verificar-otp debe invocar confirmarOtp', async () => {
    const respuesta = await request(app)
      .post('/api/auth/verificar-otp')
      .send({
        telefono: '+56912345678',
        codigo: '123456'
      });

    expect(confirmarOtp).toHaveBeenCalledTimes(1);
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({
      mensaje: 'Código OTP verificado correctamente'
    });
  });

  test('GET en una ruta no definida debe responder 404', async () => {
    const respuesta = await request(app)
      .get('/api/auth/ruta-inexistente');

    expect(respuesta.status).toBe(404);
  });
});
