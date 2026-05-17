const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  username: String,
  password: String
});

module.exports = mongoose.model('Usuario', UsuarioSchema);