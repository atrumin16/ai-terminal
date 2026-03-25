// URL de la API de Fawaz Ahmed (Open Access)
const API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';

async function fetchMarkets() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const markets = data.usd;

        // 1. Calculamos los precios inversos (1 / valor)
        const prices = {
            btc: (1 / markets.btc).toFixed(2),
            xau: (1 / markets.xau).toFixed(2),
            eur: (1 / markets.eur).toFixed(4)
        };

        // 2. Actualizamos el HTML
        document.getElementById('price-btc').innerText = `$${parseFloat(prices.btc).toLocaleString()}`;
        document.getElementById('price-xau').innerText = `$${parseFloat(prices.xau).toLocaleString()}`;
        document.getElementById('price-eur').innerText = `$${prices.eur}`;

        // 3. Ejecutamos la "IA" de análisis
        runAIAnalysis(prices);

    } catch (error) {
        console.error("Error en la terminal:", error);
        document.getElementById('ia-status').innerText = "Error de conexión. Reintentando...";
    }
}

function runAIAnalysis(prices) {
    const statusEl = document.getElementById('ia-status');
    let report = "";

    // Lógica de análisis basada en umbrales (Simulación de IA)
    if (prices.btc > 65000) {
        report += "Fuerte optimismo en Crypto. ";
    } else {
        report += "Bitcoin en fase de acumulación lateral. ";
    }

    if (prices.xau > 2300) {
        report += "Oro actuando como refugio defensivo. ";
    }

    statusEl.innerText = report + " Análisis completado.";
}

// Inyectar el Widget de TradingView dinámicamente
function loadChart() {
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
        new TradingView.widget({
            "autosize": true,
            "symbol": "BINANCE:BTCUSD",
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "es",
            "container_id": "chart-widget"
        });
    };
    document.head.appendChild(script);
}

// Arrancar todo
window.onload = () => {
    fetchMarkets();
    loadChart();
};