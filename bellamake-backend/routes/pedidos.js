const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const verificarToken = require('../middleware/authMiddleware');

// ROTA: SALVAR NOVO PEDIDO (/api/pedidos)
// Note que colocamos o "verificarToken" no meio. Ele é o segurança.
router.post('/', verificarToken, async (req, res) => {
    try {
        // Monta a nota fiscal com os dados que vieram do site (req.body)
        const novoPedido = new Pedido({
            usuario: req.usuario.id, // O ID veio do crachá verificado!
            itens: req.body.itens,
            total: req.body.total
        });

        // Salva no banco de dados nas nuvens
        const pedidoSalvo = await novoPedido.save();
        
        res.status(201).json({ mensagem: 'Pedido salvo com sucesso!', pedido: pedidoSalvo });
    } catch (err) {
        res.status(500).json({ mensagem: err.message });
    }
});

module.exports = router;