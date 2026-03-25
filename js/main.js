const state = {
    allAssets: {},
    symbols: ['btc', 'xau', 'eur', 'eth', 'sol', 'aapl'],
    lang: localStorage.getItem('lang') || 'en'
};

const i18n = {
    en: { title: "AI MARKET SENTIMENT", online: "System online. Normal volatility.", offline: "Offline mode. Check connection.", search: "Search 2,000+ assets..." },
    es: { title: "SENTIMIENTO DE MERCADO IA", online: "Sistema en línea. Volatilidad normal.", offline: "Modo sin conexión. Revisa tu red.", search: "Buscar +2,000 activos..." }
};

// 1. Iniciar API
async function init() {
    setLanguage(state.lang);
    try {
        const res = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        if (!res.ok) throw new Error("API Error");
        
        state.allAssets = (await res.json()).usd;
        
        const statusEl = document.getElementById('ia-status');
        statusEl.innerText = i18n[state.lang].online;
        statusEl.style.color = "#00e676";
        
        renderDashboard();
        loadChart('BINANCE:BTCUSD'); // Cargar gráfico por defecto
    } catch (err) {
        console.error(err);
        const statusEl = document.getElementById('ia-status');
        statusEl.innerText = i18n[state.lang].offline;
        statusEl.style.color = "red";
    }
}

// 2. Renderizar Tarjetas
function renderDashboard() {
    const container = document.getElementById('main-dashboard');
    if(!container) return;

    container.innerHTML = state.symbols.map(sym => {
        const rate = state.allAssets[sym];
        if (!rate) return '';
        
        const price = 1 / rate;
        return `
            <div class="card" onclick="showDetails('${sym}')">
                <h3>${sym.toUpperCase()}/USD</h3>
                <div class="price">$${price > 1 ? price.toLocaleString('en-US', {maximumFractionDigits: 2}) : price.toFixed(6)}</div>
            </div>
        `;
    }).join('');
}

// 3. Buscador
function searchAssets() {
    const query = document.getElementById('asset-search').value.toLowerCase();
    const resultsDiv = document.getElementById('search-results');
    
    if (query.length < 2) { 
        resultsDiv.style.display = 'none'; 
        return; 
    }

    const matches = Object.keys(state.allAssets).filter(key => key.includes(query)).slice(0, 8);
    
    resultsDiv.innerHTML = matches.map(m => `
        <div class="search-item" onclick="selectAsset('${m}')">
            ${m.toUpperCase()}
        </div>
    `).join('');
    
    resultsDiv.style.display = 'block';
}

// 4. Seleccionar Activo
function selectAsset(symbol) {
    if (!state.symbols.includes(symbol)) {
        state.symbols.unshift(symbol);
    }
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('asset-search').value = '';
    renderDashboard();
    showDetails(symbol);
}

// 5. Modal de Detalles e IA Estática
function showDetails(sym) {
    const modal = document.getElementById('asset-modal');
    const price = 1 / state.allAssets[sym];
    
    // Lógica IA simple
    let aiPrediction = price > 1000 ? "High value asset detected. Expect institutional movements." : "Micro-cap/Forex volatility zone. Trade with caution.";
    if (sym === 'btc' || sym === 'eth') aiPrediction = "Major crypto flow detected. Bullish accumulation.";

    document.getElementById('modal-body').innerHTML = `
        <h2>${sym.toUpperCase()} / USD</h2>
        <p>Current Price: <strong>$${price > 1 ? price.toLocaleString('en-US') : price.toFixed(6)}</strong></p>
        <hr style="border-color:#363a45; margin: 15px 0;">
        <p style="color: #2962ff; font-weight: bold;">🤖 AI Insight:</p>
        <p><em>${aiPrediction}</em></p>
        <button onclick="updateChart('${sym}')" style="margin-top:15px; background:#2962ff; color:white; border:none; padding:10px 15px; border-radius:4px; cursor:pointer; font-weight:bold;">View on Chart</button>
    `;
    modal.style.display = "block";
}

function closeModal() { 
    document.getElementById('asset-modal').style.display = "none"; 
}

// 6. Selector de Idioma
function setLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('lang', lang);
    
    const labelEl = document.getElementById('ai-label');
    const searchEl = document.getElementById('asset-search');
    
    if(labelEl) labelEl.innerText = i18n[lang].title;
    if(searchEl) searchEl.placeholder = i18n[lang].search;
    
    const statusEl = document.getElementById('ia-status');
    if (statusEl && state.allAssets.btc) {
         statusEl.innerText = i18n[lang].online;
    }
}

// 7. Gráficos de TradingView
function loadChart(symbolConfig) {
    const chartContainer = document.getElementById('chart-widget');
    if(!chartContainer) return;
    
    chartContainer.innerHTML = ''; 
    
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
        new TradingView.widget({
            "autosize": true,
            "symbol": symbolConfig,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": state.lang,
            "container_id": "chart-widget"
        });
    };
    document.head.appendChild(script);
}

function updateChart(sym) {
    closeModal();
    // Mapeo básico de tickers para TradingView
    let tvSymbol = "BINANCE:" + sym.toUpperCase() + "USDT";
    if(sym === 'xau' || sym === 'eur') tvSymbol = "OANDA:" + sym.toUpperCase() + "USD";
    if(sym === 'aapl') tvSymbol = "NASDAQ:AAPL";
    
    loadChart(tvSymbol);
    document.querySelector('.chart-section').scrollIntoView({behavior: "smooth"});
}

window.onload = init;
