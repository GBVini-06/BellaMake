const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Rota de Registro
router.post('/registrar', async (req, res) => {
    try {
        // Verifica se o email já existe
        const usuarioExiste = await Usuario.findOne({ email: req.body.email });
        if (usuarioExiste) return res.status(400).json({ mensagem: 'E-mail já cadastrado.' });

        // Criptografa a senha (ninguém vai saber a senha real, nem você)
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(req.body.senha, salt);

        // Salva no banco de dados
        const novoUsuario = new Usuario({
            nome: req.body.nome,
            email: req.body.email,
            senha: senhaCriptografada
        });
        await novoUsuario.save();

        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (err) {
        res.status(500).json({ mensagem: err.message });
    }
});

// ROTA 2: FAZER LOGIN (/api/auth/login)
router.post('/login', async (req, res) => {
    try {
        // Procura o usuário pelo e-mail
        const usuario = await Usuario.findOne({ email: req.body.email });
        if (!usuario) return res.status(400).json({ mensagem: 'E-mail ou senha incorretos.' });

        // Compara a senha digitada com a senha criptografada do banco
        const senhaValida = await bcrypt.compare(req.body.senha, usuario.senha);
        if (!senhaValida) return res.status(400).json({ mensagem: 'E-mail ou senha incorretos.' });

        // Cria o "Crachá" (Token JWT)
        const token = jwt.sign({ id: usuario._id, isAdmin: usuario.isAdmin }, process.env.JWT_SECRET);

        // Devolve o token e os dados básicos para o Front-end
        res.json({ token, usuario: { nome: usuario.nome, email: usuario.email, isAdmin: usuario.isAdmin } });
    } catch (err) {
        res.status(500).json({ mensagem: err.message });
    }
});

module.exports = router;