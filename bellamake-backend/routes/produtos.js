const express = require('express');
const router = express.Router();
const Produto = require('../models/Produto');

// ROTA 1: Puxar todos os produtos do banco (O que sua Vitrine vai usar)
router.get('/', async (req, res) => {
    try {
        const produtos = await Produto.find();
        res.json(produtos);
    } catch (err) {
        res.status(500).json({ mensagem: err.message });
    }
});

// ROTA 2: Cadastrar um produto novo no banco (O que o seu Dashboard vai usar)
router.post('/', async (req, res) => {
    const produto = new Produto({
        nome: req.body.nome,
        marca: req.body.marca,
        preco: req.body.preco,
        imagemUrl: req.body.imagemUrl,
        estoque: req.body.estoque
    });

    try {
        const novoProduto = await produto.save();
        res.status(201).json(novoProduto);
    } catch (err) {
        res.status(400).json({ mensagem: err.message });
    }
});

module.exports = router;