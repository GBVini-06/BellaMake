const mongoose = require('mongoose');

const ProdutoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    marca: { type: String, default: 'Maybelline' },
    preco: { type: Number, required: true },
    imagemUrl: { type: String },
    estoque: { type: Number, default: 0 }
});

module.exports = mongoose.model('Produto', ProdutoSchema);