const mongoose = require('mongoose');

const Brownie = mongoose.model("Brownie", {
    nomeProduto: String,
    preco: String,
    cepa: String
});

module.exports = Brownie;