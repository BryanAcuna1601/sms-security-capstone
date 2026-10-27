const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { solicitarOtp, verificarOtp } = require('../services/otpService');

const pedirOtp = async (req, res) => {
  try {
    const { telefono } = req.body;
    if (!telefono) {
      return res.status(400).json({ error: 'Debes enviar un telefono' });
    }

    const codigo = await solicitarOtp(telefono);

    res.status(200).json({
      mensaje: 'Codigo generado (simulado, no se envia SMS real)',
      telefono,
      codigo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const confirmarOtp = async (req, res) => {
  try {
    const { telefono, codigo } = req.body;
    if (!telefono || !codigo) {
      return res.status(400).json({ error: 'Debes enviar telefono y codigo' });
    }

    const esValido = await verificarOtp(telefono, codigo);
    if (!esValido) {
      return res.status(401).json({ error: 'Codigo invalido o expirado' });
    }

    let usuario = await Usuario.findOne({ telefono });
    if (!usuario) {
      usuario = await Usuario.create({ telefono });
    }

    const token = jwt.sign(
      { id: usuario._id, telefono: usuario.telefono, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({ token, usuario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { pedirOtp, confirmarOtp };