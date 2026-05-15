const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
    // Guarda o ID do usuário que fez a compra
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    
    // Lista de produtos no carrinho
    itens: [
        {
            nome: { type: String, required: true },
            preco: { type: Number, required: true }
        }
    ],
    
    // Valor final da compra
    total: { type: Number, required: true },
    
    // Data automática da compra
    data: { type: Date, default: Date.now },
    
    // Status do pedido (Pendente, Pago, Enviado)
    status: { type: String, default: 'Pendente' }
});

module.exports = mongoose.model('Pedido', PedidoSchema);