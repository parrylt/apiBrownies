const mongoose = require('mongoose');

const Pagamento = mongoose.model("Pagamento", {
    numCartao: Number,
    nomeCartao: String,
    cvv: Number,
    senha: String,
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
});

module.exports = Pagamento;