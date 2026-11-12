
process.env.JWT_SECRET = 'secreto-pruebas-jest';

jest.mock('../controllers/usuarioController', () => ({
  obtenerUsuarios: jest.fn((req, res) => {
    res.status(200).json({
      mensaje: 'Lista de usuarios'
    });
  }),

  actualizarUsuario: jest.fn((req, res) => {
    res.status(200).json({
      mensaje: 'Usuario actualizado',
      id: req.params.id
    });
  }),

  eliminarUsuario: jest.fn((req, res) => {
    res.status(200).json({
      mensaje: 'Usuario eliminado',
      id: req.params.id
    });
  })
}));

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const {
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario
} = require('../controllers/usuarioController');

const usuarioRoutes = require('../routes/usuarioRoutes');

describe('usuarioRoutes', () => {
  let app;

  const generarToken = (rol = 'admin') => {
    return jwt.sign(
      {
        id: 'usuario123',
        rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use('/api/usuarios', usuarioRoutes);
  });

  describe('Rutas con administrador autenticado', () => {
    test('GET / debe invocar obtenerUsuarios', async () => {
      const token = generarToken();

      const respuesta = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${token}`);

      expect(obtenerUsuarios).toHaveBeenCalledTimes(1);
      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        mensaje: 'Lista de usuarios'
      });
    });

    test('PATCH /:id debe invocar actualizarUsuario', async () => {
      const token = generarToken();

      const respuesta = await request(app)
        .patch('/api/usuarios/usuario456')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Usuario actualizado' });

      expect(actualizarUsuario).toHaveBeenCalledTimes(1);
      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        mensaje: 'Usuario actualizado',
        id: 'usuario456'
      });
    });

    test('DELETE /:id debe invocar eliminarUsuario', async () => {
      const token = generarToken();

      const respuesta = await request(app)
        .delete('/api/usuarios/usuario456')
        .set('Authorization', `Bearer ${token}`);

      expect(eliminarUsuario).toHaveBeenCalledTimes(1);
      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        mensaje: 'Usuario eliminado',
        id: 'usuario456'
      });
    });
  });

  describe('Protección de las rutas', () => {
    test('debe rechazar una petición sin token', async () => {
      const respuesta = await request(app)
        .get('/api/usuarios');

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        error: 'Token no proporcionado'
      });

      expect(obtenerUsuarios).not.toHaveBeenCalled();
    });

    test('debe rechazar un token inválido', async () => {
      const respuesta = await request(app)
        .patch('/api/usuarios/usuario456')
        .set('Authorization', 'Bearer token-invalido');

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        error: 'Token invalido o expirado'
      });

      expect(actualizarUsuario).not.toHaveBeenCalled();
    });

    test('debe rechazar a un usuario que no sea administrador', async () => {
      const token = generarToken('usuario');

      const respuesta = await request(app)
        .delete('/api/usuarios/usuario456')
        .set('Authorization', `Bearer ${token}`);

      expect(respuesta.status).toBe(403);
      expect(respuesta.body).toEqual({
        error: 'Se requiere rol de administrador'
      });

      expect(eliminarUsuario).not.toHaveBeenCalled();
    });
  });
});
