const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    // Pega o crachá que o site enviou
    const token = req.header('Authorization');
    
    // Se não tiver crachá, barra na porta
    if (!token) return res.status(401).json({ mensagem: 'Acesso negado. Faça login para comprar.' });

    try {
        // Limpa o texto (geralmente vem escrito "Bearer hash_do_token")
        const tokenLimpo = token.replace('Bearer ', '');
        
        // Confere se o crachá é verdadeiro usando a sua senha secreta
        const verificado = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        
        // Guarda os dados do cliente (ID) para usarmos na nota fiscal
        req.usuario = verificado; 
        
        // Libera a passagem!
        next(); 
    } catch (err) {
        res.status(400).json({ mensagem: 'Token inválido ou expirado. Faça login novamente.' });
    }
}

module.exports = verificarToken;