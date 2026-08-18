/**
 * CryptoAnalyzer - Versão Simplificada
 * Teste rápido para verificar funcionamento
 */

console.log('🚀 Iniciando CryptoAnalyzer...');

// ========================================
// CONFIGURAÇÕES
// ========================================
const CONFIG = {
    defaultCoins: ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple'],
    currency: 'brl'
};

// ========================================
// ESTADO GLOBAL
// ========================================
const state = {
    coins: [...CONFIG.defaultCoins],
    coinData: {}
};

// ========================================
// ELEMENTOS DOM
// ========================================
const DOM = {
    coinsGrid: document.getElementById('coinsGrid'),
    updateTime: document.getElementById('updateTime'),
    refreshBtn: document.getElementById('refreshBtn')
};

// ========================================
// FUNÇÕES DE UTILIDADE
// ========================================

function formatCurrency(value) {
    if (value === null || value === undefined) return '--';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
}

// ========================================
// FUNÇÕES DE API
// ========================================

async function fetchCoinData(coinId) {
    try {
        console.log(`📊 Buscando dados de ${coinId}...`);
        const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Dados de ${coinId} carregados!`);
        return data;
    } catch (error) {
        console.error(`❌ Erro ao buscar dados de ${coinId}:`, error);
        return null;
    }
}

// ========================================
// FUNÇÕES DE PROCESSAMENTO
// ========================================

function processCoinData(coinData) {
    if (!coinData) return null;

    const marketData = coinData.market_data || {};
    
    const currentPrice = marketData.current_price ? marketData.current_price[CONFIG.currency] : null;
    const change24h = marketData.price_change_percentage_24h || null;
    
    // Score simples (apenas para demonstração)
    let score = 50;
    let status = 'neutral';
    let statusText = 'Neutro';
    let emoji = '🟡';
    
    if (change24h !== null) {
        if (change24h > 5) {
            score = 75;
            status = 'favorable';
            statusText = 'Possível região favorável';
            emoji = '🟢';
        } else if (change24h < -5) {
            score = 25;
            status = 'danger';
            statusText = 'Cautela';
            emoji = '🟠';
        }
    }

    return {
        currentPrice,
        change24h,
        score: { score, status, statusText, emoji },
        name: coinData.name,
        symbol: coinData.symbol,
        image: coinData.image ? coinData.image.small : null
    };
}

// ========================================
// FUNÇÕES DE RENDERIZAÇÃO
// ========================================

function renderCoinCards() {
    console.log('🎨 Renderizando cards...');
    DOM.coinsGrid.innerHTML = '';

    state.coins.forEach(coinId => {
        const data = state.coinData[coinId];
        const card = document.createElement('div');
        card.className = 'coin-card';
        card.dataset.coin = coinId;

        if (data) {
            const priceFormatted = formatCurrency(data.currentPrice);
            const changeClass = data.change24h >= 0 ? 'positive' : 'negative';
            const changeFormatted = data.change24h !== null ? `${data.change24h >= 0 ? '+' : ''}${data.change24h.toFixed(2)}%` : '--';

            card.innerHTML = `
                <div class="card-header">
                    <span class="coin-name">${data.name || coinId}</span>
                    <span class="coin-symbol">${data.symbol || coinId}</span>
                </div>
                <div class="coin-price">${priceFormatted}</div>
                <div class="coin-change ${changeClass}">${changeFormatted}</div>
                <div class="card-score">
                    <span class="status-indicator ${data.score.status}"></span>
                    <span>Score: ${data.score.score}/100</span>
                    <span class="score-badge ${data.score.status}">${data.score.emoji} ${data.score.statusText}</span>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="card-header">
                    <span class="coin-name">${coinId}</span>
                </div>
                <div class="loading-spinner" style="margin: 12px auto;"></div>
                <div style="font-size:0.7rem;color:var(--text-muted);text-align:center;">Carregando...</div>
            `;
        }

        DOM.coinsGrid.appendChild(card);
    });
}

// ========================================
// FUNÇÃO PRINCIPAL DE CARREGAMENTO
// ========================================

async function loadAllData() {
    console.log('🔄 Carregando todos os dados...');
    
    try {
        // Busca dados de todas as moedas
        for (const coinId of state.coins) {
            const coinData = await fetchCoinData(coinId);
            if (coinData) {
                state.coinData[coinId] = processCoinData(coinData);
            }
        }

        // Renderiza os cards
        renderCoinCards();

        // Atualiza horário
        state.lastUpdate = new Date();
        DOM.updateTime.textContent = `Atualizado: ${formatDate(state.lastUpdate)}`;
        
        console.log('✅ Todos os dados carregados com sucesso!');
        console.log('📊 Dados:', state.coinData);
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        DOM.coinsGrid.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--red);">
                <i class="fas fa-exclamation-triangle" style="font-size:2rem;display:block;margin-bottom:16px;"></i>
                Erro ao carregar dados. Verifique sua conexão com a internet.
                <br><br>
                <button onclick="loadAllData()" style="background:var(--blue);color:white;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;">
                    Tentar novamente
                </button>
            </div>
        `;
    }
}

// ========================================
// EVENTOS
// ========================================

// Botão de atualizar
DOM.refreshBtn.addEventListener('click', () => {
    console.log('🔄 Atualizando manualmente...');
    loadAllData();
});

// ========================================
// INICIALIZAÇÃO
// ========================================

console.log('🌟 Inicializando aplicação...');

// Carrega os dados quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado, iniciando carregamento...');
    loadAllData();
});

// Também tenta carregar imediatamente (caso o DOM já esteja carregado)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('📄 DOM já está pronto, carregando...');
    loadAllData();
}

console.log('🏁 Aplicação inicializada! Aguarde o carregamento dos dados...');
// ========================================
// CONFIGURAÇÕES DE EXCHANGES
// ========================================
const EXCHANGES = {
    // Exchanges brasileiras
    'mercadobitcoin': {
        name: 'Mercado Bitcoin',
        icon: '🇧🇷',
        url: (coin) => `https://www.mercadobitcoin.com.br/comprar/${coin}/`,
        color: '#00a859'
    },
    'foxbit': {
        name: 'Foxbit',
        icon: '🦊',
        url: (coin) => `https://foxbit.com.br/trade/${coin.toUpperCase()}-BRL`,
        color: '#f15a24'
    },
    'bitcointrade': {
        name: 'BitcoinTrade',
        icon: '🔷',
        url: (coin) => `https://www.bitcointrade.com.br/trade/${coin.toUpperCase()}/BRL`,
        color: '#2d7de9'
    },
    // Exchanges internacionais
    'binance': {
        name: 'Binance',
        icon: '🟡',
        url: (coin) => `https://www.binance.com/pt-BR/trade/${coin.toUpperCase()}_BRL`,
        color: '#f0b90b'
    },
    'coinbase': {
        name: 'Coinbase',
        icon: '🔵',
        url: (coin) => `https://www.coinbase.com/price/${coin}`,
        color: '#0052ff'
    },
    'kraken': {
        name: 'Kraken',
        icon: '🐙',
        url: (coin) => `https://www.kraken.com/prices/${coin}`,
        color: '#5844e0'
    }
};

// ========================================
// ELEMENTOS DO MODAL DE COMPRA
// ========================================
const DOM_BUY = {
    buyModal: document.getElementById('buyModal'),
    closeBuyModal: document.getElementById('closeBuyModal'),
    buyCoinName: document.getElementById('buyCoinName'),
    exchangeGrid: document.getElementById('exchangeGrid')
};

// ========================================
// FUNÇÃO PARA ABRIR MODAL DE COMPRA
// ========================================

function openBuyModal(coinId) {
    const data = state.coinData[coinId];
    if (!data) {
        alert('Dados da moeda não disponíveis. Tente novamente.');
        return;
    }

    // Mostra o nome da moeda
    DOM_BUY.buyCoinName.textContent = data.name || coinId;

    // Gera os botões das exchanges
    DOM_BUY.exchangeGrid.innerHTML = '';

    Object.entries(EXCHANGES).forEach(([key, exchange]) => {
        const btn = document.createElement('button');
        btn.className = 'exchange-btn';
        btn.style.borderColor = exchange.color;
        btn.innerHTML = `
            <span class="exchange-icon">${exchange.icon}</span>
            <span>${exchange.name}</span>
            <span class="exchange-name">Comprar ${data.symbol?.toUpperCase() || coinId}</span>
        `;
        
        btn.addEventListener('click', () => {
            // Abre a exchange em uma nova aba
            const url = exchange.url(coinId);
            window.open(url, '_blank');
            
            // Fecha o modal
            DOM_BUY.buyModal.classList.remove('show');
            
            // Mostra mensagem de confirmação
            console.log(`🔗 Redirecionando para ${exchange.name} para comprar ${coinId}`);
        });
        
        DOM_BUY.exchangeGrid.appendChild(btn);
    });

    // Mostra o modal
    DOM_BUY.buyModal.classList.add('show');
}

// ========================================
// EVENTOS DO MODAL DE COMPRA
// ========================================

// Fechar modal
DOM_BUY.closeBuyModal.addEventListener('click', () => {
    DOM_BUY.buyModal.classList.remove('show');
});

// Fechar ao clicar fora
DOM_BUY.buyModal.addEventListener('click', (e) => {
    if (e.target === DOM_BUY.buyModal) {
        DOM_BUY.buyModal.classList.remove('show');
    }
});
function renderCoinCards() {
    console.log('🎨 Renderizando cards...');
    DOM.coinsGrid.innerHTML = '';

    state.coins.forEach(coinId => {
        const data = state.coinData[coinId];
        const card = document.createElement('div');
        card.className = 'coin-card';
        card.dataset.coin = coinId;

        if (data) {
            const priceFormatted = formatCurrency(data.currentPrice);
            const changeClass = data.change24h >= 0 ? 'positive' : 'negative';
            const changeFormatted = data.change24h !== null ? `${data.change24h >= 0 ? '+' : ''}${data.change24h.toFixed(2)}%` : '--';

            card.innerHTML = `
                <div class="card-header">
                    <span class="coin-name">${data.name || coinId}</span>
                    <span class="coin-symbol">${data.symbol || coinId}</span>
                </div>
                <div class="coin-price">${priceFormatted}</div>
                <div class="coin-change ${changeClass}">${changeFormatted}</div>
                <div class="card-score">
                    <span class="status-indicator ${data.score.status}"></span>
                    <span>Score: ${data.score.score}/100</span>
                    <span class="score-badge ${data.score.status}">${data.score.emoji} ${data.score.statusText}</span>
                </div>
                <button class="btn-buy-coin" data-coin="${coinId}">
                    <i class="fas fa-shopping-cart"></i> Comprar
                </button>
            `;

            // Evento para abrir o modal de compra
            const buyBtn = card.querySelector('.btn-buy-coin');
            buyBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede que o card seja clicado
                openBuyModal(coinId);
            });

            // Evento para abrir detalhes da moeda (click no card)
            card.addEventListener('click', (e) => {
                // Não abre detalhes se clicou no botão de compra
                if (e.target.closest('.btn-buy-coin')) return;
                selectCoin(coinId);
            });

        } else {
            card.innerHTML = `
                <div class="card-header">
                    <span class="coin-name">${coinId}</span>
                </div>
                <div class="loading-spinner" style="margin: 12px auto;"></div>
                <div style="font-size:0.7rem;color:var(--text-muted);text-align:center;">Carregando...</div>
            `;
        }

        DOM.coinsGrid.appendChild(card);
    });
}
function selectCoin(coinId) {
    console.log(`🪙 Selecionando moeda: ${coinId}`);
    state.selectedCoin = coinId;
    
    // Atualiza o card selecionado visualmente
    document.querySelectorAll('.coin-card').forEach(card => {
        card.style.borderColor = card.dataset.coin === coinId ? 'var(--blue)' : 'var(--border-color)';
    });
    
    // Aqui você pode adicionar mais funcionalidades, como abrir um detalhe
    alert(`Moeda selecionada: ${coinId}\nClique em "Comprar" para abrir uma exchange.`);
}
