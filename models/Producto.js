const mongoose = require('mongoose'); 
const productoSchema = new mongoose.Schema({ 
  nombre: { type: String, required: true }, 
  precio: { type: Number, required: true }, 
  stock: { type: Number, default: 0 } 
}, { timestamps: true }); 
module.exports = mongoose.model('Producto', productoSchema); 
