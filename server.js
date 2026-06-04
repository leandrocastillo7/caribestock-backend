require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

console.log("🔥 PRUEBA LEANDRO 2026 🔥");

const Producto = require('./models/Producto');
const Usuario = require('./models/Usuario');
const Movimiento = require('./models/Movimiento');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para autenticación
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Acceso denegado' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = verified;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// ==================== RUTAS ====================

// Registrar usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const usuario = new Usuario({ username, password: hashed });
    await usuario.save();
    res.json({ mensaje: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const usuario = await Usuario.findOne({ username });
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });
    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, usuario: { id: usuario._id, username: usuario.username } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD Productos (protegido)
app.get('/api/productos', auth, async (req, res) => {
  const productos = await Producto.find().sort({ createdAt: -1 });
  res.json(productos);
});

app.post('/api/productos', auth, async (req, res) => {
  const { nombre, precio, stock } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
  const producto = new Producto({ nombre, precio, stock });
  await producto.save();
  res.status(201).json(producto);
});

app.put('/api/productos/:id', auth, async (req, res) => {
  const { id } = req.params;
  const producto = await Producto.findByIdAndUpdate(id, req.body, { new: true });
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
});

app.delete('/api/productos/:id', auth, async (req, res) => {
  const { id } = req.params;
  const producto = await Producto.findByIdAndDelete(id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ mensaje: 'Producto eliminado' });
});

// Movimientos
app.get('/api/movimientos', auth, async (req, res) => {
  const movimientos = await Movimiento.find().populate('productoId', 'nombre').sort({ fecha: -1 });
  res.json(movimientos);
});

app.post('/api/movimientos', auth, async (req, res) => {
  const { productoId, tipo, cantidad } = req.body;
  const producto = await Producto.findById(productoId);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  if (tipo === 'salida' && producto.stock < cantidad) {
    return res.status(400).json({ error: 'Stock insuficiente' });
  }
  if (tipo === 'entrada') producto.stock += cantidad;
  else producto.stock -= cantidad;
  await producto.save();
  const movimiento = new Movimiento({ productoId, tipo, cantidad });
  await movimiento.save();
  res.status(201).json({ movimiento, stockActual: producto.stock });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ mensaje: 'API CaribeStock funcionando con MongoDB' });
});

// Conectar a MongoDB y arrancar
const PORT = process.env.PORT || 3000;

console.log("MONGODB_URI =", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas');
    app.listen(PORT, () => console.log(`🌐 Servidor en puerto ${PORT}`));
  })
  .catch(err => console.error('❌ Error de conexión:', err)); 