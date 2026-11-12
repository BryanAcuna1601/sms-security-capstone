const express = require("express");
const router = express.Router();
const { consultarAsistente } = require("../controllers/asistenteController");

router.post("/chat", consultarAsistente);

module.exports = router;