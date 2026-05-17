const express = require('express');
const router = express.Router();

// Registrar usuario (versión simple sin MongoDB por ahora)
router.post('/register', (req, res) => {
  console.log('Llegó petición a /register');
  console.log('Body:', req.body);
  res.json({ mensaje: 'Usuario creado exitosamente' });
});

// Iniciar sesión
router.post('/login', (req, res) => {
  console.log('Llegó petición a /login');
  res.json({ token: 'token-de-prueba-123' });
});

module.exports = router;