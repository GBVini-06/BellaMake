require('dotenv').config(); // Carrega as variáveis do .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Configurações (Middlewares)
app.use(cors()); // Permite o front-end conversar com este back-end
app.use(express.json()); // Permite o servidor entender arquivos JSON

// Conexão com o Banco de Dados MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('📦 Banco de Dados (MongoDB) Conectado com sucesso!'))
    .catch(err => console.log('❌ Erro ao conectar no Banco:', err));

// Importando e usando as Rotas
const produtosRouter = require('./routes/produtos');
app.use('/api/produtos', produtosRouter);

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const pedidosRouter = require('./routes/pedidos');
app.use('/api/pedidos', pedidosRouter);

// Rota inicial de teste
app.get('/', (req, res) => {
    res.send('Servidor BellaMake está rodando! 💄');
});

// Ligando o Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});