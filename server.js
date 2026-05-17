require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base de datos en memoria (para pruebas, no necesita MongoDB)
let productos = [];
let usuarios = [];
let movimientos = [];
let nextId = 1;

// ========== RUTAS DE AUTENTICACIÓN ==========
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  console.log('Registro usuario:', username);
  
  const existe = usuarios.find(u => u.username === username);
  if (existe) {
    return res.status(400).json({ error: 'El usuario ya existe' });
  }
  
  usuarios.push({ id: nextId++, username, password });
  res.json({ mensaje: 'Usuario creado exitosamente' });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login usuario:', username);
  
  const usuario = usuarios.find(u => u.username === username && u.password === password);
  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  
  // Token simple (para pruebas)
  const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
  res.json({ token, usuario: { id: usuario.id, username: usuario.username } });
});

// ========== RUTAS DE PRODUCTOS ==========
app.get('/api/productos', (req, res) => {
  console.log('GET productos - Cantidad:', productos.length);
  res.json(productos);
});

app.post('/api/productos', (req, res) => {
  const { nombre, precio, stock } = req.body;
  console.log('POST producto:', { nombre, precio, stock });
  
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  
  const nuevoProducto = {
    _id: String(nextId++),
    nombre,
    precio: precio || 0,
    stock: stock || 0,
    createdAt: new Date().toISOString()
  };
  
  productos.push(nuevoProducto);
  console.log('Producto creado:', nuevoProducto);
  res.status(201).json(nuevoProducto);
});

app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock } = req.body;
  console.log('PUT producto:', id);
  
  const index = productos.findIndex(p => p._id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  
  productos[index] = { ...productos[index], nombre, precio, stock };
  res.json(productos[index]);
});

app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  console.log('DELETE producto:', id);
  
  const index = productos.findIndex(p => p._id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  
  productos.splice(index, 1);
  res.json({ mensaje: 'Producto eliminado' });
});

// ========== RUTAS DE MOVIMIENTOS ==========
app.get('/api/movimientos', (req, res) => {
  console.log('GET movimientos - Cantidad:', movimientos.length);
  res.json(movimientos);
});

app.post('/api/movimientos', (req, res) => {
  const { productoId, tipo, cantidad } = req.body;
  console.log('POST movimiento:', { productoId, tipo, cantidad });
  
  const producto = productos.find(p => p._id === productoId);
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  
  if (tipo === 'salida' && producto.stock < cantidad) {
    return res.status(400).json({ error: 'Stock insuficiente' });
  }
  
  if (tipo === 'entrada') {
    producto.stock += cantidad;
  } else {
    producto.stock -= cantidad;
  }
  
  const movimiento = {
    _id: String(nextId++),
    productoId,
    tipo,
    cantidad,
    fecha: new Date().toISOString()
  };
  
  movimientos.push(movimiento);
  res.status(201).json({ movimiento, stockActual: producto.stock });
});

// ========== RUTA DE PRUEBA ==========
app.get('/', (req, res) => {
  res.json({ mensaje: 'API CaribeStock funcionando' });
});

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Servidor corriendo en http://localhost:${PORT}`);
  console.log('✅ Backend listo para recibir peticiones');
  console.log('📋 Endpoints disponibles:');
  console.log('   POST   /api/auth/login');
  console.log('   POST   /api/auth/register');
  console.log('   GET    /api/productos');
  console.log('   POST   /api/productos');
  console.log('   PUT    /api/productos/:id');
  console.log('   DELETE /api/productos/:id');
  console.log('   GET    /api/movimientos');
  console.log('   POST   /api/movimientos');
});