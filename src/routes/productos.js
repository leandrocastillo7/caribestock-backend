const express = require('express');
const router = express.Router();

// Obtener productos
router.get('/', (req, res) => {
  res.json([]);
});

// Crear producto
router.post('/', (req, res) => {
  res.status(201).json({ mensaje: 'Producto creado' });
});

module.exports = router;