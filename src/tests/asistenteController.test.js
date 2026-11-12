jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn()
  }))
}));

const { GoogleGenerativeAI } = require('@google/generative-ai');

const {
  consultarAsistente
} = require('../controllers/asistenteController');

// Obtenemos la instancia simulada de Gemini
const genAI = GoogleGenerativeAI.mock.results[0].value;

describe('asistenteController', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        mensajeUsuario: '¿Cómo puedo reconocer un SMS fraudulento?'
      }
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    genAI.getGenerativeModel.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('consultarAsistente', () => {

    test('debe responder correctamente cuando Gemini genera una respuesta', async () => {
      const respuestaIA = 'No compartas tus datos personales por SMS.';

      const generateContentMock = jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue(respuestaIA)
        }
      });

      genAI.getGenerativeModel.mockReturnValue({
        generateContent: generateContentMock
      });

      await consultarAsistente(req, res);

      expect(genAI.getGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-3.5-flash-lite'
      });

      expect(generateContentMock).toHaveBeenCalledWith(
        expect.stringContaining(req.body.mensajeUsuario)
      );

      expect(res.json).toHaveBeenCalledWith({
        respuesta: respuestaIA
      });

      expect(res.status).not.toHaveBeenCalled();
    });

    test('debe responder con error 500 cuando Gemini falla', async () => {
      const error = new Error('Error de conexión con Gemini');

      const generateContentMock = jest.fn().mockRejectedValue(error);

      genAI.getGenerativeModel.mockReturnValue({
        generateContent: generateContentMock
      });

      jest.spyOn(console, 'error').mockImplementation(() => {});

      await consultarAsistente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        error: 'No pudimos conectar con el asistente educativo.'
      });
    });

    test('debe incluir el mensaje del usuario dentro del prompt enviado a Gemini', async () => {
      const generateContentMock = jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue('Respuesta de prueba')
        }
      });

      genAI.getGenerativeModel.mockReturnValue({
        generateContent: generateContentMock
      });

      await consultarAsistente(req, res);

      const promptEnviado = generateContentMock.mock.calls[0][0];

      expect(promptEnviado).toContain(
        '¿Cómo puedo reconocer un SMS fraudulento?'
      );

      expect(promptEnviado).toContain(
        'asistente de ciberseguridad amable y paciente'
      );
    });
  });
});