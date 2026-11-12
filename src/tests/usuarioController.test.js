
jest.mock('../models/Usuario');

const Usuario = require('../models/Usuario');
const {
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario
} = require('../controllers/usuarioController');

describe('usuarioController', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { id: '123' },
      body: { nombre: 'Usuario actualizado' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  // PRUEBAS DE obtenerUsuarios
  describe('obtenerUsuarios', () => {
    test('debe obtener los usuarios y responder 200', async () => {
      const usuarios = [
        { _id: '1', telefono: '111111111' },
        { _id: '2', telefono: '222222222' }
      ];

      Usuario.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(usuarios)
      });

      await obtenerUsuarios(req, res);

      expect(Usuario.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(usuarios);
    });

    test('debe responder 500 si ocurre un error', async () => {
      Usuario.find.mockImplementation(() => {
        throw new Error('Error de base de datos');
      });

      await obtenerUsuarios(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error de base de datos'
      });
    });
  });

  // PRUEBAS DE actualizarUsuario
  describe('actualizarUsuario', () => {
    test('debe actualizar un usuario y responder 200', async () => {
      const usuarioActualizado = {
        _id: '123',
        nombre: 'Usuario actualizado'
      };

      Usuario.findByIdAndUpdate.mockResolvedValue(usuarioActualizado);

      await actualizarUsuario(req, res);

      expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        { nombre: 'Usuario actualizado' },
        { returnDocument: 'after', runValidators: true }
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(usuarioActualizado);
    });

    test('debe responder 404 si el usuario no existe', async () => {
      Usuario.findByIdAndUpdate.mockResolvedValue(null);

      await actualizarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Usuario no encontrado'
      });
    });

    test('debe responder 400 si ocurre un error', async () => {
      Usuario.findByIdAndUpdate.mockRejectedValue(
        new Error('Error al actualizar')
      );

      await actualizarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error al actualizar'
      });
    });
  });

  // PRUEBAS DE eliminarUsuario
  describe('eliminarUsuario', () => {
    test('debe eliminar un usuario y responder 200', async () => {
      const usuarioEliminado = {
        _id: '123',
        nombre: 'Usuario eliminado'
      };

      Usuario.findByIdAndDelete.mockResolvedValue(usuarioEliminado);

      await eliminarUsuario(req, res);

      expect(Usuario.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Usuario eliminado correctamente'
      });
    });

    test('debe responder 404 si el usuario no existe', async () => {
      Usuario.findByIdAndDelete.mockResolvedValue(null);

      await eliminarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Usuario no encontrado'
      });
    });

    test('debe responder 500 si ocurre un error', async () => {
      Usuario.findByIdAndDelete.mockRejectedValue(
        new Error('Error al eliminar')
      );

      await eliminarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error al eliminar'
      });
    });
  });
});
