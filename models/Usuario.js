const mongoose = require('mongoose');

const Usuario = mongoose.model("Usuario", {
    nome: String,
    email: String,
    usuario: String,
    senha: String
});

module.exports = Usuario;