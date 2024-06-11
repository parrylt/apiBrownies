const mongoose = require('mongoose');

const Pagamento = mongoose.model("Pagamento", {
    numCartao: String,
    nomeCartao: String,
    cvv: String,
    senha: String,
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
});

module.exports = Pagamento;