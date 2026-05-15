/* ==========================================================================
   CONFIGURAÇÕES GLOBAIS
   ========================================================================== */
// Apontando para o seu servidor Back-end rodando na sua máquina
const API_URL = 'http://localhost:3000/api/produtos'; 
let allProducts = [];
let cart = [];

/* ==========================================================================
   INICIALIZAÇÃO DO SITE
   ========================================================================== */
window.onload = async () => {
    // 1. Carrega sessão do usuário se existir
    const savedSession = localStorage.getItem('bellamake_session');
    if (savedSession) {
        updateUserInterface(JSON.parse(savedSession));
    }

    // 2. Carrega o carrinho salvo
    const savedCart = localStorage.getItem('bellamake_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
        renderCartItems();
    }

    // 3. Verifica em qual página o usuário está
    if (document.getElementById('products-container')) {
        // Estamos na HOME (index.html) -> Buscar produtos do SEU BANCO DE DADOS
        await fetchProducts();
    } else if (document.getElementById('detail-title')) {
        // Estamos na PÁGINA DO PRODUTO (produto.html) -> Carregar detalhes
        carregarPaginaProduto();
    }
};

/* ==========================================================================
   LÓGICA DA HOME (API DO MONGODB)
   ========================================================================== */
async function fetchProducts() {
    const loading = document.getElementById('loading');
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (loading) loading.style.display = 'none';

        // Processamento dos dados vindos do SEU MongoDB
        allProducts = data.map(item => ({
            id: item._id,           // O MongoDB usa _id em vez de id
            name: item.nome,        // Puxando o 'nome' do banco
            price: item.preco,      // Puxando o 'preco' do banco (já em reais)
            image: item.imagemUrl,  // Puxando a 'imagemUrl' do banco
            estoque: item.estoque,  // Puxando o estoque real
            rating: (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1),
            description: "Produto exclusivo e de alta qualidade com garantia BellaMake."
        }));

        renderProducts(allProducts);

    } catch (error) {
        console.error("Erro na API Local:", error);
        if (loading) loading.innerHTML = '<p>Erro ao conectar com o Servidor BellaMake. Verifique se o Node.js está rodando no terminal.</p>';
    }
}

function renderProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');

        // Atenção às aspas simples em '${product.id}' pois o ID do Mongo é texto
        card.innerHTML = `
            <div class="card-img-container" onclick="irParaProduto('${product.id}')">
                <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://via.placeholder.com/200?text=Indisponível'">
            </div>
            <div class="card-info">
                <div>
                    <div class="card-title">${product.name}</div>
                    <div style="font-size:0.8rem; color:#f39c12;">
                        <i class="fas fa-star"></i> ${product.rating}
                    </div>
                </div>
                <div>
                    <div class="card-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                    
                    <div class="btns-container">
                        <button class="btn-icon btn-cart" title="Adicionar ao Carrinho" onclick="addToCart('${product.id}')">
                            <i class="fas fa-shopping-bag"></i>
                        </button>
                        <button class="btn-icon btn-buy" onclick="irParaProduto('${product.id}')">
                            Comprar
                        </button>
                    </div>

                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ==========================================================================
   LÓGICA DA PÁGINA DE PRODUTO
   ========================================================================== */
function irParaProduto(id) {
    // Busca o produto na lista carregada
    const product = allProducts.find(p => p.id == id);
    
    if (product) {
        // Salva no navegador para a próxima página ler
        localStorage.setItem('produto_selecionado', JSON.stringify(product));
        window.location.href = 'produto.html';
    }
}

function carregarPaginaProduto() {
    // Recupera o produto salvo
    const produto = JSON.parse(localStorage.getItem('produto_selecionado'));

    if (!produto) {
        // Se não tiver produto salvo, volta pra home
        window.location.href = 'index.html';
        return;
    }

    // Preenche os campos da página produto.html
    document.getElementById('detail-img').src = produto.image;
    document.getElementById('detail-title').innerText = produto.name;
    document.getElementById('detail-rating').innerHTML = `<i class="fas fa-star"></i> ${produto.rating} (124 avaliações)`;
    document.getElementById('detail-price').innerText = `R$ ${produto.price.toFixed(2).replace('.', ',')}`;
    document.getElementById('detail-desc').innerText = produto.description;
    
    // Configura o botão de comprar da página interna
    const btnComprar = document.getElementById('btn-comprar-final');
    if (btnComprar) {
        btnComprar.onclick = function() {
            // Adiciona ao carrinho
            adicionarAoCarrinhoManual(produto);
        };
    }
}

function calcularFrete() {
    const cep = document.getElementById('cep-input').value;
    const res = document.getElementById('frete-result');
    
    if(cep.length < 8) {
        alert("Digite um CEP válido (Ex: 00000-000)");
        return;
    }

    res.style.display = 'block';
    res.innerHTML = `
        <div style="margin-top:10px; padding:10px; background:#e8f5e9; border-radius:5px; color:#2e7d32; font-size:0.9rem;">
            <strong><i class="fas fa-truck"></i> Frete Grátis</strong> - Chega em 3 a 5 dias úteis<br>
            <small>Sedex: R$ 15,90 (1 a 2 dias úteis)</small>
        </div>
    `;
}

/* ==========================================================================
   CARRINHO DE COMPRAS
   ========================================================================== */
function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('open');
}

// Adiciona quando está na Home (busca pelo ID na lista global)
function addToCart(id) {
    const product = allProducts.find(p => p.id == id);
    if (product) {
        adicionarAoCarrinhoManual(product);
    }
}

// Função genérica para adicionar o objeto produto ao carrinho
function adicionarAoCarrinhoManual(product) {
    cart.push(product);
    saveCart();
    updateCartCount();
    renderCartItems();
    
    const sidebar = document.getElementById('cart-sidebar');
    if (!sidebar.classList.contains('open')) {
        sidebar.classList.add('open');
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderCartItems();
}

function updateCartCount() {
    const el = document.getElementById('cart-count');
    if(el) el.innerText = cart.length;
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    
    // Proteção caso os elementos não existam na página
    if (!container || !totalEl) return;

    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#777; margin-top:20px;">Sua sacola está vazia.</p>';
        totalEl.innerText = "0,00";
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');
        itemDiv.innerHTML = `
            <div style="display:flex; align-items:center;">
                <img src="${item.image}" style="width:50px; height:50px; object-fit:contain; margin-right:10px;">
                <div>
                    <div style="font-size:0.8rem; font-weight:600;">${item.name.substring(0, 15)}...</div>
                    <div style="color:var(--pink-vibrant);">R$ ${item.price.toFixed(2)}</div>
                </div>
            </div>
            <i class="fas fa-trash-alt" style="color:#ff4444; cursor:pointer;" onclick="removeFromCart(${index})"></i>
        `;
        container.appendChild(itemDiv);
    });
    totalEl.innerText = total.toFixed(2).replace('.', ',');
}

function saveCart() {
    localStorage.setItem('bellamake_cart', JSON.stringify(cart));
}

/* ==========================================================================
   MODAIS E LOGIN (Mantido por enquanto)
   ========================================================================== */
function abrirModal(id) {
    const el = document.getElementById(id);
    if(el) el.style.display = 'flex';
}

function fecharModal(id) {
    const el = document.getElementById(id);
    if(el) el.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    }
}

function switchTab(type) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    if (type === 'cliente') {
        document.querySelector('.tabs .tab:nth-child(1)').classList.add('active');
        document.getElementById('tab-cliente').classList.add('active');
    } else {
        document.querySelector('.tabs .tab:nth-child(2)').classList.add('active');
        document.getElementById('tab-staff').classList.add('active');
    }
}

function toggleAuthMode(mode) {
    const loginForm = document.getElementById('form-login');
    const cadForm = document.getElementById('form-cadastro');

    if (mode === 'cadastro') {
        loginForm.style.display = 'none';
        cadForm.style.display = 'block';
    } else {
        cadForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
}

async function cadastrarCliente() {
    const nome = document.getElementById('cad-nome').value;
    const email = document.getElementById('cad-email').value;
    const senha = document.getElementById('cad-pass').value;

    if (!nome || !email || !senha) return alert("Preencha todos os campos!");

    try {
        // Conecta com a rota de registro do SEU back-end
        const response = await fetch('http://localhost:3000/api/auth/registrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Cadastro realizado com sucesso! Faça login.");
            toggleAuthMode('login');
        } else {
            // Mostra o erro que veio do back-end (ex: E-mail já cadastrado)
            alert("Erro: " + data.mensagem);
        }
    } catch (error) {
        console.error("Erro ao cadastrar:", error);
        alert("Erro de conexão com o servidor.");
    }
}

async function loginCliente() {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-pass').value;

    if (!email || !senha) return alert("Preencha todos os campos!");

    try {
        // Conecta com a rota de login do SEU back-end
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            // Salva o Token (crachá) e os dados do usuário no navegador
            localStorage.setItem('bellamake_token', data.token);
            localStorage.setItem('bellamake_session', JSON.stringify(data.usuario));
            
            updateUserInterface(data.usuario);
            fecharModal('login-modal');
        } else {
            alert("Erro: " + data.mensagem);
        }
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        alert("Erro de conexão com o servidor.");
    }
}

function updateUserInterface(user) {
    const label = document.getElementById('user-label');
    const primeiroNome = user.nome.split(' ')[0];
    
    if(label) {
        // Muda o texto do botão para o nome do usuário
        label.innerText = `Olá, ${primeiroNome}`;
        const btn = label.parentElement;
        
        btn.onclick = null; // Remove o evento de abrir o modal de login
        
        // Se for ADMIN, muda a cor do botão e o destino!
        if (user.isAdmin) {
            btn.style.backgroundColor = '#e91e63'; // Cor escura para destacar o admin
            label.innerText = `👑 Admin ${primeiroNome}`;
            
            btn.addEventListener('click', function() {
                // Aqui você pode redirecionar para uma página dashboard.html
                // Mas por enquanto, vamos abrir um menu ou alerta
                if(confirm("Bem-vinda ao painel de controle! Deseja sair da conta ou acessar o sistema?\n\n[OK] = Acessar Sistema\n[Cancelar] = Sair da Conta")) {
                    alert("Abrindo o Dashboard... (Aqui entrará a tela com os gráficos!)");
                    // window.location.href = 'dashboard.html';
                } else {
                    localStorage.removeItem('bellamake_session');
                    localStorage.removeItem('bellamake_token');
                    window.location.reload();
                }
            });
        } else {
            // Se for CLIENTE COMUM, apenas oferece para sair
            btn.addEventListener('click', function() {
                 if(confirm("Deseja sair da conta?")) {
                    localStorage.removeItem('bellamake_session');
                    localStorage.removeItem('bellamake_token');
                    window.location.reload();
                }
            });
        }
    }
}

function simularRastreio() {
    const codigo = document.getElementById('input-rastreio').value;
    const res = document.getElementById('resultado-rastreio');
    
    if(!codigo) return alert("Digite um código.");

    res.style.display = 'block';
    res.innerHTML = `
        <strong>Pedido ${codigo}:</strong><br>
        <span style="color:green">● Em trânsito</span> - Cajamar/SP<br>
        <small>Previsão: 2 dias úteis</small>
    `;
}

function irParaSistema() {
    alert("Área restrita aos funcionários.");
}

/* --- FUNÇÕES DO CHECKOUT --- */
function abrirCheckout() {
    if (cart.length === 0) return alert("Carrinho vazio!");
    
    // Fecha o carrinho lateral
    document.getElementById('cart-sidebar').classList.remove('open');
    
    // Calcula total
    let total = cart.reduce((acc, item) => acc + item.price, 0);
    document.getElementById('checkout-total-display').innerText = total.toFixed(2).replace('.', ',');
    
    // Mostra o Modal (com z-index alto)
    const modal = document.getElementById('checkout-modal');
    modal.style.display = 'flex';
}

function fecharCheckout() {
    document.getElementById('checkout-modal').style.display = 'none';
}

function mudarPagamento(tipo) {
    // Esconde tudo
    document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.payment-content').forEach(c => c.classList.remove('active'));

    // Mostra o escolhido
    document.getElementById('tab-' + tipo).classList.add('active');
    document.getElementById('content-' + tipo).classList.add('active');
}

async function finalizarPedido() {
    // 1. Pega o crachá do cliente no navegador
    const token = localStorage.getItem('bellamake_token');

    // Se não tiver crachá, manda fazer login
    if (!token) {
        alert("Você precisa fazer login para finalizar a compra!");
        fecharCheckout();
        abrirModal('login-modal');
        return;
    }

    if (cart.length === 0) return alert("Carrinho vazio!");

    // 2. Prepara os dados da Nota Fiscal
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    // Transforma o carrinho num formato mais limpo para o banco de dados
    const itens = cart.map(item => ({ nome: item.name, preco: item.price }));

    try {
        // 3. Envia para o Caixa do seu Back-end
        const response = await fetch('http://localhost:3000/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // ⬅️ Aqui vai o crachá para o segurança!
            },
            body: JSON.stringify({ itens, total })
        });

        const data = await response.json();

        if (response.ok) {
            // Sucesso!
            alert("Venda realizada com sucesso! 🎉\n" + data.mensagem);
            cart = []; // Limpa carrinho
            saveCart(); // Atualiza o carrinho vazio no navegador
            fecharCheckout();
            window.location.href = 'index.html'; // Recarrega a página
        } else {
            alert("Erro: " + data.mensagem);
            
            // Se o segurança barrar (token expirado), desloga a pessoa
            if (response.status === 401 || response.status === 400) {
                localStorage.removeItem('bellamake_token');
                localStorage.removeItem('bellamake_session');
                window.location.reload();
            }
        }
    } catch (error) {
        console.error("Erro ao finalizar pedido:", error);
        alert("Erro de conexão com o servidor. Tente novamente.");
    }
}

function copiarPix() {
    navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136123e4567");
    alert("Chave copiada!");
}