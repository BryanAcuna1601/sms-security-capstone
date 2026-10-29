const { GoogleGenerativeAI } = require("@google/generative-ai");

// Tu clave debe estar en un archivo .env por seguridad
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const consultarAsistente = async (req, res) => {
  try {
    const { mensajeUsuario } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    // Aquí le damos la "personalidad" mediante un prompt estructurado
    const prompt = `Eres un asistente de ciberseguridad amable y paciente, diseñado para ayudar a adultos mayores a detectar fraudes por SMS (smishing). Responde de forma breve, clara, usando un tono respetuoso y sin tecnicismos complejos.
    El usuario pregunta: "${mensajeUsuario}"`;

    const result = await model.generateContent(prompt);
    const respuestaIA = result.response.text();

    res.json({ respuesta: respuestaIA });
  } catch (error) {
    console.error("Error con la IA:", error);
    res.status(500).json({ error: "No pudimos conectar con el asistente educativo." });
  }
};

module.exports = { consultarAsistente };