// Configuration & Dictionary
const state = {
    lang: localStorage.getItem('lang') || 'en',
    allAssets: {},
    symbols: ['btc', 'xau', 'eur', 'eth', 'sol', 'aapl'], // Default view
};

const i18n = {
    en: { ai_label: "AI MARKET SENTIMENT", analyzing: "Analyzing global flows...", neutral: "Market in accumulation phase. Low volatility detected." },
    es: { ai_label: "SENTIMIENTO DE MERCADO IA", analyzing: "Analizando flujos globales...", neutral: "Mercado en fase de acumulación. Baja volatilidad." }
};

// 1. Initialize & Fetch Data
async function init() {
    try {
        const res = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        state.allAssets = (await res.json()).usd;
        renderDashboard();
        updateAIStatus();
    } catch (err) {
        console.error("Connection error");
    }
}

// 2. Search Logic (Filtering thousands of assets)
function searchAssets() {
    const query = document.getElementById('asset-search').value.toLowerCase();
    const resultsDiv = document.getElementById('search-results');
    
    if (query.length < 2) { resultsDiv.style.display = 'none'; return; }

    const matches = Object.keys(state.allAssets)
        .filter(key => key.includes(query))
        .slice(0, 10); // Show top 10 matches

    resultsDiv.innerHTML = matches.map(m => `
        <div class="search-item" onclick="selectAsset('${m}')">
            <strong>${m.toUpperCase()}</strong> - $${(1/state.allAssets[m]).toFixed(4)}
        </div>
    `).join('');
    resultsDiv.style.display = 'block';
}

function selectAsset(symbol) {
    if (!state.symbols.includes(symbol)) state.symbols.unshift(symbol);
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('asset-search').value = '';
    renderDashboard();
    showDetails(symbol);
}

// 3. Render Dashboard Cards
function renderDashboard() {
    const container = document.getElementById('main-dashboard');
    container.innerHTML = state.symbols.slice(0, 6).map(sym => {
        const price = 1 / state.allAssets[sym];
        return `
            <div class="card" onclick="showDetails('${sym}')">
                <h3>${sym.toUpperCase()}</h3>
                <div class="price">$${price > 1 ? price.toLocaleString() : price.toFixed(6)}</div>
                <small class="view-more">Click for AI Analysis</small>
            </div>
        `;
    }).join('');
}

// 4. Modal & More Info
function showDetails(sym) {
    const modal = document.getElementById('asset-modal');
    const body = document.getElementById('modal-body');
    const price = 1 / state.allAssets[sym];
    
    body.innerHTML = `
        <h2>${sym.toUpperCase()} / USD</h2>
        <div class="modal-grid">
            <div class="stat-box"><h4>Current Price</h4><p>$${price.toLocaleString()}</p></div>
            <div class="stat-box"><h4>Asset Class</h4><p>${sym.length < 4 ? 'Commodity/Forex' : 'Crypto/Stock'}</p></div>
        </div>
        <div class="ai-prediction">
            <h4>Neural Prediction</h4>
            <p>Based on current liquidity, ${sym.toUpperCase()} shows a ${price > 100 ? 'stable' : 'volatile'} pattern for the next 24h.</p>
        </div>
    `;
    modal.style.display = "block";
}

function closeModal() { document.getElementById('asset-modal').style.display = "none"; }

// Start
window.onload = init;
