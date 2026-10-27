const jwt = require('jsonwebtoken');

const verificarTokenOpcional = (req, res, next) => {
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    try {
      req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      req.usuario = null;
    }
  }

  next();
};

module.exports = { verificarTokenOpcional };