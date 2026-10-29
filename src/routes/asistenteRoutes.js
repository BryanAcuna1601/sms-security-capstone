const express = require("express");
const router = express.Router();
const { consultarAsistente } = require("../controllers/asistenteController");

// Crea el endpoint POST donde recibiremos el mensaje del usuario
router.post("/chat", consultarAsistente);

module.exports = router;