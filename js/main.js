const state = {
    allAssets: {},
    symbols: ['btc', 'xau', 'eur', 'eth', 'sol', 'aapl'],
    lang: localStorage.getItem('lang') || 'en'
};

const i18n = {
    en: { title: "AI MARKET SENTIMENT", online: "System online. Normal volatility.", offline: "Offline mode. Check connection.", search: "Search markets (e.g., btc, eur, xau)..." },
    es: { title: "SENTIMIENTO DE MERCADO IA", online: "Sistema en línea. Volatilidad normal.", offline: "Modo sin conexión. Revisa tu red.", search: "Buscar mercados (ej: btc, eur, xau)..." }
};

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
        loadChart('BINANCE:BTCUSD'); 
    } catch (err) {
        const statusEl = document.getElementById('ia-status');
        statusEl.innerText = i18n[state.lang].offline;
        statusEl.style.color = "#ff5252";
    }
}

function renderDashboard() {
    const container = document.getElementById('main-dashboard');
    if(!container) return;

    container.innerHTML = state.symbols.map(sym => {
        const rate = state.allAssets[sym];
        if (!rate) return '';
        
        const price = 1 / rate;
        const formattedPrice = price > 1 ? price.toLocaleString('en-US', {maximumFractionDigits: 2}) : price.toFixed(6);
        
        return `
            <div class="card" onclick="showDetails('${sym}')">
                <h3>${sym}</h3>
                <div class="price">$${formattedPrice}</div>
            </div>
        `;
    }).join('');
}

function searchAssets() {
    const query = document.getElementById('asset-search').value.toLowerCase();
    const resultsDiv = document.getElementById('search-results');
    
    if (query.length < 2) { 
        resultsDiv.style.display = 'none'; 
        return; 
    }

    // startsWith lo hace más exacto y slice(0, 1) muestra solo 1 resultado
    const matches = Object.keys(state.allAssets)
        .filter(key => key.startsWith(query))
        .slice(0, 1);
    
    resultsDiv.innerHTML = matches.map(m => `
        <div class="search-item" onclick="selectAsset('${m}')">
            ${m.toUpperCase()}
        </div>
    `).join('');
    
    resultsDiv.style.display = 'block';
}

function selectAsset(symbol) {
    if (!state.symbols.includes(symbol)) {
        state.symbols.unshift(symbol);
    }
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('asset-search').value = '';
    renderDashboard();
    showDetails(symbol);
}

function showDetails(sym) {
    const modal = document.getElementById('asset-modal');
    const price = 1 / state.allAssets[sym];
    const formattedPrice = price > 1 ? price.toLocaleString('en-US') : price.toFixed(6);
    
    let aiPrediction = price > 1000 ? "High value asset. Expect institutional movements." : "Micro-cap/Forex zone. Trade with caution.";
    if (['btc', 'eth', 'sol'].includes(sym)) aiPrediction = "Crypto flow detected. Monitoring volatility.";

    document.getElementById('modal-body').innerHTML = `
        <h2>${sym} / USD</h2>
        <p style="font-size: 20px; font-family: monospace;">$${formattedPrice}</p>
        <hr style="border-color:#30363d; margin: 15px 0;">
        <p style="color: var(--accent); font-size: 12px; font-weight: bold;">🧠 AI Insight:</p>
        <p style="font-size: 14px; color: #8b949e;">${aiPrediction}</p>
        <button class="btn-chart" onclick="updateChart('${sym}')">View on Chart</button>
    `;
    modal.style.display = "flex"; 
}

function closeModal() { 
    document.getElementById('asset-modal').style.display = "none"; 
}

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
            "enable_publishing": false,
            "backgroundColor": "#0d1117",
            "gridColor": "#30363d",
            "hide_top_toolbar": false,
            "save_image": false,
            "container_id": "chart-widget"
        });
    };
    document.head.appendChild(script);
}

function updateChart(sym) {
    closeModal();
    let tvSymbol = "BINANCE:" + sym.toUpperCase() + "USDT";
    if(['xau', 'xag', 'eur', 'gbp', 'jpy'].includes(sym)) tvSymbol = "OANDA:" + sym.toUpperCase() + "USD";
    if(sym === 'aapl') tvSymbol = "NASDAQ:AAPL";
    
    loadChart(tvSymbol);
}

window.onload = init;
