const mongoose = require('mongoose');

const MovimientoSchema = new mongoose.Schema({
  productoId: String,
  tipo: String,
  cantidad: Number
});

module.exports = mongoose.model('Movimiento', MovimientoSchema);