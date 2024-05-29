const mongoose = require('mongoose');

const Pedido = mongoose.model("Pedido", {
    quantidade: Number,
    precoTotal: String,
    modoPagamento: String,
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    nomeProduto: { type: mongoose.Schema.Types.ObjectId, ref: 'Brownie' },
});

module.exports = Pedido;