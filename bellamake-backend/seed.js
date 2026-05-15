require('dotenv').config();
const mongoose = require('mongoose');
const Produto = require('./models/Produto'); // Puxa aquele molde que criamos

// Nossa lista de produtos iniciais
const produtosIniciais = [
    { 
        nome: "Batom SuperStay Matte Ink", 
        marca: "Maybelline", 
        preco: 59.90, 
        imagemUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=400&auto=format&fit=crop", 
        estoque: 50 
    },
    { 
        nome: "Batom Color Sensational", 
        marca: "Maybelline", 
        preco: 35.90, 
        imagemUrl: "https://images.unsplash.com/photo-1581337204873-ef36aa186caa?q=80&w=400&auto=format&fit=crop", 
        estoque: 30 
    },
    { 
        nome: "Batom Lifter Gloss", 
        marca: "Maybelline", 
        preco: 79.90, 
        imagemUrl: "https://images.unsplash.com/photo-1571781526291-c477ebef0124?q=80&w=400&auto=format&fit=crop", 
        estoque: 15 
    }
];

// Conecta, salva e desconecta
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('🌱 Conectado! Plantando a semente no banco...');
        
        await Produto.deleteMany({}); // Limpa a tabela para não duplicar
        await Produto.insertMany(produtosIniciais); // Salva a lista inteira
        
        console.log('✅ Produtos inseridos com sucesso no MongoDB Atlas!');
        process.exit(); // Encerra o script
    })
    .catch(err => {
        console.log('❌ Erro:', err);
        process.exit();
    });