(function(){
    "use strict";

    const BINANCE_API = 'https://api.binance.com/api/v3';
    const BINANCE_WS = 'wss://stream.binance.com:9443/ws';
    
    const TOP_5_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];
    
    let allSymbols = [];
    let wsConnection = null;
    let wsSubscriptions = new Set();
    
    const globalSearch = document.getElementById('globalSearch');
    const suggestions = document.getElementById('suggestions');
    const topCapGrid = document.getElementById('topCapGrid');
    const trendingBody = document.getElementById('trendingBody');
    const marketTicker = document.getElementById('marketTicker');
    const wsDot = document.getElementById('wsDot');
    const wsText = document.getElementById('wsText');

    function initWebSocket() {
        if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
            return;
        }

        wsConnection = new WebSocket(BINANCE_WS);

        wsConnection.onopen = () => {
            console.log('WebSocket conectado');
            wsDot.className = 'ws-dot';
            wsText.textContent = 'Conectado';
            
            TOP_5_SYMBOLS.forEach(symbol => {
                subscribeToSymbol(symbol.toLowerCase());
            });
        };

        wsConnection.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };

        wsConnection.onerror = (error) => {
            console.error('WebSocket error:', error);
            wsDot.className = 'ws-dot disconnected';
            wsText.textContent = 'Desconectado';
        };

        wsConnection.onclose = () => {
            console.log('WebSocket desconectado');
            wsDot.className = 'ws-dot disconnected';
            wsText.textContent = 'Desconectado';
            
            setTimeout(initWebSocket, 5000);
        };
    }

    function subscribeToSymbol(symbol) {
        if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
            const subMsg = {
                method: "SUBSCRIBE",
                params: [`${symbol}@ticker`],
                id: Date.now()
            };
            wsConnection.send(JSON.stringify(subMsg));
            wsSubscriptions.add(symbol);
        }
    }

    function handleWebSocketMessage(data) {
        if (data.e === '24hrTicker') {
            updateTickerPrice(data);
        }
    }

    function updateTickerPrice(data) {
        const symbol = data.s;
        const price = parseFloat(data.c);
        const change = parseFloat(data.P);
        
        const cards = document.querySelectorAll('.cap-card');
        cards.forEach(card => {
            const symbolSpan = card.querySelector('.cap-symbol');
            if (symbolSpan && symbolSpan.textContent.includes(symbol.replace('USDT', ''))) {
                const priceSpan = card.querySelector('.cap-price');
                const changeSpan = card.querySelector('.cap-change');
                
                if (priceSpan) {
                    priceSpan.textContent = `$${price.toFixed(2)}`;
                }
                if (changeSpan) {
                    changeSpan.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                    changeSpan.className = `cap-change ${change >= 0 ? 'positive' : 'negative'}`;
                }
            }
        });
        
        if (symbol === 'BTCUSDT') {
            marketTicker.innerHTML = `
                <div class="ticker-item"><span>BTC</span> <span class="${change >= 0 ? 'positive' : 'negative'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span></div>
                <div class="ticker-item"><span>Preço</span> <span>$${price.toFixed(2)}</span></div>
            `;
        }
    }

    function calculateRSI(closes, period = 14) {
        if (closes.length < period + 1) return 50;
        let gains = 0, losses = 0;
        for (let i = closes.length - period; i < closes.length; i++) {
            const diff = closes[i] - closes[i-1];
            if (diff > 0) gains += diff;
            else losses -= diff;
        }
        const avgGain = gains / period;
        const avgLoss = losses / period;
        if (avgLoss === 0) return 100;
        return 100 - (100 / (1 + avgGain / avgLoss));
    }

    function calculateEMA(data, period) {
        if (data.length < period) return data[data.length-1] || 0;
        const k = 2 / (period + 1);
        let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
        for (let i = period; i < data.length; i++) ema = data[i] * k + ema * (1 - k);
        return ema;
    }

    function calculateMACD(closes) {
        const ema12 = calculateEMA(closes, 12);
        const ema26 = calculateEMA(closes, 26);
        const macdLine = ema12 - ema26;
        const signalLine = calculateEMA([macdLine], 9);
        return { macd: macdLine, signal: signalLine, histogram: macdLine - signalLine };
    }

    function calculateBB(closes, period = 20, stdDev = 2) {
        if (closes.length < period) return { position: 0.5 };
        const slice = closes.slice(-period);
        const mean = slice.reduce((a, b) => a + b, 0) / period;
        const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
        const std = Math.sqrt(variance);
        const upper = mean + stdDev * std;
        const lower = mean - stdDev * std;
        const last = closes[closes.length-1];
        return { position: (last - lower) / (upper - lower) };
    }

    function calculateATR(highs, lows, closes, period = 14) {
        if (highs.length < period + 1) return closes[closes.length-1] * 0.01;
        let tr = [];
        for (let i = 1; i < highs.length; i++) {
            tr.push(Math.max(
                highs[i] - lows[i],
                Math.abs(highs[i] - closes[i-1]),
                Math.abs(lows[i] - closes[i-1])
            ));
        }
        return tr.slice(-period).reduce((a, b) => a + b, 0) / period;
    }

    async function analyzeSymbol(symbol) {
        try {
            const klinesResp = await fetch(`${BINANCE_API}/klines?symbol=${symbol}&interval=15m&limit=100`);
            const klines = await klinesResp.json();
            
            const closes = klines.map(k => parseFloat(k[4]));
            const highs = klines.map(k => parseFloat(k[2]));
            const lows = klines.map(k => parseFloat(k[3]));
            const volumes = klines.map(k => parseFloat(k[5]));
            
            const price = closes[closes.length - 1];
            
            const rsi = calculateRSI(closes);
            const macd = calculateMACD(closes);
            const bb = calculateBB(closes);
            const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
            const volumeRatio = volumes[volumes.length - 1] / avgVolume;
            
            let bullishScore = 0, bearishScore = 0;
            
            if (rsi < 30) bullishScore += 2.5;
            else if (rsi > 70) bearishScore += 2.5;
            
            if (macd.histogram > 0) bullishScore += 2;
            else bearishScore += 2;
            
            if (bb.position < 0.2) bullishScore += 2;
            else if (bb.position > 0.8) bearishScore += 2;
            
            if (volumeRatio > 1.5) {
                if (closes[closes.length-1] > closes[closes.length-2]) bullishScore += 1.5;
                else bearishScore += 1.5;
            }
            
            const recentChange = (closes[closes.length-1] - closes[closes.length-5]) / closes[closes.length-5];
            if (recentChange > 0.01) bullishScore += 1;
            else if (recentChange < -0.01) bearishScore += 1;
            
            const netScore = bullishScore - bearishScore;
            let signal, actionMsg;
            
            if (netScore > 3) { signal = 'COMPRA FORTE'; actionMsg = '🚀 FORTE COMPRA'; }
            else if (netScore > 1.5) { signal = 'COMPRA'; actionMsg = '📈 Comprar'; }
            else if (netScore < -3) { signal = 'VENDA FORTE'; actionMsg = '🔻 FORTE VENDA'; }
            else if (netScore < -1.5) { signal = 'VENDA'; actionMsg = '📉 Vender'; }
            else { signal = 'NEUTRO'; actionMsg = '⏸️ Aguardar'; }
            
            const atr = calculateATR(highs, lows, closes);
            const entry = price;
            const stopLoss = signal.includes('COMPRA') ? price - atr * 1.5 : price + atr * 1.5;
            const takeProfit = signal.includes('COMPRA') ? price + atr * 2.5 : price - atr * 2.5;
            const strengthPercent = Math.min(Math.abs(netScore) * 12.5, 100);
            
            return {
                symbol, price, rsi, macd: macd.macd, histogram: macd.histogram,
                bbPosition: bb.position, volumeRatio,
                signal, actionMsg, netScore,
                entry, stopLoss, takeProfit,
                strengthPercent
            };
        } catch (e) {
            console.error('Erro na análise:', e);
            return null;
        }
    }

    function openChartAnalysis(symbol, analysis) {
        const chartWindow = window.open('', '_blank');
        const streamName = symbol.toLowerCase();
        
        chartWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes, viewport-fit=cover">
                <meta name="theme-color" content="#0B0E11">
                <meta name="apple-mobile-web-app-capable" content="yes">
                <title>${symbol} • Análise 15m</title>
                <script src="https://unpkg.com/lightweight-charts@4.0.1/dist/lightweight-charts.standalone.production.js"><\/script>
                <style>
                    * { 
                        margin: 0; 
                        padding: 0; 
                        box-sizing: border-box; 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                    }
                    
                    body { 
                        background: #0B0E11; 
                        color: #EAECEF; 
                        padding: 12px 8px;
                        padding-bottom: 20px;
                        -webkit-tap-highlight-color: transparent;
                    }
                    
                    .header { 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: flex-start; 
                        margin-bottom: 16px; 
                        flex-wrap: wrap; 
                        gap: 12px;
                        background: #1E2329;
                        padding: 16px;
                        border-radius: 12px;
                        border: 1px solid #2B3139;
                    }
                    
                    .pair-info {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                    }
                    
                    .pair { 
                        font-size: clamp(22px, 6vw, 32px); 
                        font-weight: 700;
                        line-height: 1.2;
                    }
                    
                    .price { 
                        font-size: clamp(20px, 5vw, 28px); 
                        font-weight: 600;
                        color: #F0B90B;
                    }
                    
                    .status-container {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        flex-wrap: wrap;
                    }
                    
                    .ws-status { 
                        display: flex; 
                        align-items: center; 
                        gap: 6px; 
                        font-size: 12px;
                        background: #2B3139;
                        padding: 6px 12px;
                        border-radius: 20px;
                    }
                    
                    .ws-dot { 
                        width: 8px; 
                        height: 8px; 
                        border-radius: 50%; 
                        background: #0ECB81; 
                        animation: pulse 1.5s infinite; 
                    }
                    
                    @keyframes pulse { 
                        0%, 100% { opacity: 1; } 
                        50% { opacity: 0.5; } 
                    }
                    
                    #chart-container { 
                        width: 100%; 
                        height: clamp(350px, 60vh, 600px); 
                        margin-bottom: 16px; 
                        background: #1E2329; 
                        border-radius: 12px;
                        border: 1px solid #2B3139;
                        overflow: hidden;
                    }
                    
                    .signal-box { 
                        background: #1E2329; 
                        padding: 20px 16px; 
                        border-radius: 12px; 
                        text-align: center; 
                        margin: 16px 0;
                        border: 1px solid #2B3139;
                    }
                    
                    .signal-badge { 
                        padding: 8px 20px; 
                        border-radius: 8px; 
                        font-size: clamp(18px, 5vw, 24px); 
                        font-weight: 700; 
                        display: inline-block;
                    }
                    
                    .signal-message { 
                        font-size: clamp(16px, 4vw, 20px); 
                        margin-top: 12px;
                    }
                    
                    .analysis-grid { 
                        display: grid; 
                        grid-template-columns: repeat(2, 1fr); 
                        gap: 10px; 
                        margin: 16px 0;
                    }
                    
                    .card { 
                        background: #1E2329; 
                        padding: 14px 12px; 
                        border-radius: 10px; 
                        border: 1px solid #2B3139;
                    }
                    
                    .label { 
                        color: #848E9C; 
                        font-size: 12px; 
                        margin-bottom: 6px;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                    }
                    
                    .value { 
                        font-size: clamp(18px, 4vw, 24px); 
                        font-weight: 700;
                    }
                    
                    .levels { 
                        display: grid; 
                        grid-template-columns: repeat(3, 1fr); 
                        gap: 10px; 
                        margin-top: 16px;
                    }
                    
                    .level-card { 
                        background: #1E2329; 
                        padding: 14px 8px; 
                        border-radius: 10px; 
                        text-align: center;
                        border: 1px solid #2B3139;
                    }
                    
                    .level-card .label {
                        font-size: 11px;
                        margin-bottom: 8px;
                    }
                    
                    .level-card .value {
                        font-size: clamp(14px, 3.5vw, 18px);
                    }
                    
                    .buy { color: #0ECB81; }
                    .sell { color: #F6465D; }
                    .neutral { color: #848E9C; }
                    
                    .timeframe-info {
                        text-align: center;
                        margin-top: 16px;
                        padding: 10px;
                        color: #848E9C;
                        font-size: 12px;
                        background: #1E2329;
                        border-radius: 8px;
                        border: 1px solid #2B3139;
                    }
                    
                    @media (min-width: 768px) {
                        body { padding: 20px 24px; }
                        .analysis-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
                        .levels { gap: 16px; }
                        .level-card { padding: 20px 16px; }
                        .header { padding: 20px; }
                    }
                    
                    @media (min-width: 481px) and (max-width: 767px) {
                        .analysis-grid { grid-template-columns: repeat(2, 1fr); }
                    }
                    
                    @media (max-width: 480px) {
                        body { padding: 8px 6px; }
                        .header { padding: 12px; }
                        .signal-box { padding: 16px 12px; }
                        .card { padding: 12px 10px; }
                        .level-card { padding: 12px 6px; }
                        .level-card .label { font-size: 10px; }
                    }
                    
                    @supports (padding: max(0px)) {
                        body {
                            padding-left: max(8px, env(safe-area-inset-left));
                            padding-right: max(8px, env(safe-area-inset-right));
                            padding-bottom: max(20px, env(safe-area-inset-bottom));
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="pair-info">
                        <span class="pair">${symbol}</span>
                        <span class="price" id="livePrice">$${analysis.price.toFixed(analysis.price < 1 ? 6 : 2)}</span>
                    </div>
                    <div class="status-container">
                        <div class="ws-status">
                            <span class="ws-dot"></span>
                            <span>Live • 15m</span>
                        </div>
                    </div>
                </div>
                
                <div id="chart-container"></div>
                
                <div class="signal-box">
                    <span class="signal-badge ${analysis.signal.includes('COMPRA') ? 'buy' : analysis.signal.includes('VENDA') ? 'sell' : 'neutral'}" 
                          style="background: ${analysis.signal.includes('COMPRA') ? '#0ECB8120' : analysis.signal.includes('VENDA') ? '#F6465D20' : '#848E9C20'}; 
                                 color: ${analysis.signal.includes('COMPRA') ? '#0ECB81' : analysis.signal.includes('VENDA') ? '#F6465D' : '#848E9C'};">
                        ${analysis.signal}
                    </span>
                    <div class="signal-message">${analysis.actionMsg}</div>
                </div>
                
                <div class="analysis-grid">
                    <div class="card">
                        <div class="label">RSI (14)</div>
                        <div class="value" id="rsiValue">${analysis.rsi.toFixed(1)}</div>
                    </div>
                    <div class="card">
                        <div class="label">MACD</div>
                        <div class="value" id="macdValue">${analysis.histogram.toFixed(4)}</div>
                    </div>
                    <div class="card">
                        <div class="label">Bollinger</div>
                        <div class="value" id="bbValue">${analysis.bbPosition < 0.2 ? 'Oversold' : analysis.bbPosition > 0.8 ? 'Overbought' : 'Neutro'}</div>
                    </div>
                    <div class="card">
                        <div class="label">Volume</div>
                        <div class="value" id="volValue">${analysis.volumeRatio.toFixed(2)}x</div>
                    </div>
                </div>
                
                <div class="levels">
                    <div class="level-card">
                        <div class="label">🎯 ENTRADA</div>
                        <div class="value" style="color: #F0B90B;">$${analysis.entry.toFixed(analysis.price < 1 ? 6 : 4)}</div>
                    </div>
                    <div class="level-card">
                        <div class="label">🛑 STOP LOSS</div>
                        <div class="value" style="color: #F6465D;">$${analysis.stopLoss.toFixed(analysis.price < 1 ? 6 : 4)}</div>
                    </div>
                    <div class="level-card">
                        <div class="label">✅ TAKE PROFIT</div>
                        <div class="value" style="color: #0ECB81;">$${analysis.takeProfit.toFixed(analysis.price < 1 ? 6 : 4)}</div>
                    </div>
                </div>
                
                <div class="timeframe-info">
                    ⚡ Gráfico 15 minutos • WebSocket em tempo real • Análise profissional
                </div>
                
                <script>
                    (function() {
                        if (typeof LightweightCharts === 'undefined') {
                            document.getElementById('chart-container').innerHTML = '<div style="padding: 20px; text-align: center; color: #F6465D;">Erro ao carregar gráfico</div>';
                            return;
                        }
                        
                        const chart = LightweightCharts.createChart(document.getElementById('chart-container'), {
                            layout: { background: { color: '#1E2329' }, textColor: '#EAECEF' },
                            grid: { vertLines: { color: '#2B3139' }, horzLines: { color: '#2B3139' } },
                            crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
                            timeScale: { timeVisible: true, secondsVisible: false, borderColor: '#2B3139' },
                            rightPriceScale: { borderColor: '#2B3139' },
                            handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: true },
                            handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true }
                        });
                        
                        const candleSeries = chart.addCandlestickSeries({
                            upColor: '#0ECB81', downColor: '#F6465D',
                            borderDownColor: '#F6465D', borderUpColor: '#0ECB81',
                            wickDownColor: '#F6465D', wickUpColor: '#0ECB81'
                        });
                        
                        let chartData = [];
                        
                        fetch('${BINANCE_API}/klines?symbol=${symbol}&interval=15m&limit=200')
                            .then(r => r.json())
                            .then(data => {
                                chartData = data.map(d => ({
                                    time: Math.floor(d[0] / 1000),
                                    open: parseFloat(d[1]), high: parseFloat(d[2]),
                                    low: parseFloat(d[3]), close: parseFloat(d[4])
                                }));
                                candleSeries.setData(chartData);
                                chart.timeScale().fitContent();
                            })
                            .catch(err => console.error('Erro ao carregar dados:', err));
                        
                        const ws = new WebSocket('wss://stream.binance.com:9443/ws/${streamName}@kline_15m');
                        ws.onmessage = (event) => {
                            const data = JSON.parse(event.data);
                            const kline = data.k;
                            const candleData = {
                                time: Math.floor(kline.t / 1000),
                                open: parseFloat(kline.o), high: parseFloat(kline.h),
                                low: parseFloat(kline.l), close: parseFloat(kline.c)
                            };
                            if (kline.x) {
                                const existingIndex = chartData.findIndex(c => c.time === candleData.time);
                                if (existingIndex >= 0) chartData[existingIndex] = candleData;
                                else { chartData.push(candleData); if (chartData.length > 200) chartData.shift(); }
                                candleSeries.setData(chartData);
                            } else { candleSeries.update(candleData); }
                            document.getElementById('livePrice').textContent = '$' + parseFloat(kline.c).toFixed(kline.c < 1 ? 6 : 2);
                        };
                        
                        const wsTicker = new WebSocket('wss://stream.binance.com:9443/ws/${streamName}@ticker');
                        wsTicker.onmessage = (event) => {
                            const data = JSON.parse(event.data);
                            document.getElementById('livePrice').textContent = '$' + parseFloat(data.c).toFixed(data.c < 1 ? 6 : 2);
                        };
                        
                        setInterval(async () => {
                            try {
                                const resp = await fetch('${BINANCE_API}/klines?symbol=${symbol}&interval=15m&limit=100');
                                const klines = await resp.json();
                                const closes = klines.map(k => parseFloat(k[4]));
                                if (closes.length > 14) {
                                    let gains = 0, losses = 0;
                                    for (let i = closes.length - 14; i < closes.length; i++) {
                                        const diff = closes[i] - closes[i-1];
                                        if (diff > 0) gains += diff;
                                        else losses -= diff;
                                    }
                                    const avgGain = gains / 14;
                                    const avgLoss = losses / 14;
                                    const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
                                    document.getElementById('rsiValue').textContent = rsi.toFixed(1);
                                }
                            } catch(e) {}
                        }, 30000);
                        
                        window.addEventListener('resize', () => {
                            chart.applyOptions({
                                width: document.getElementById('chart-container').clientWidth,
                                height: document.getElementById('chart-container').clientHeight
                            });
                        });
                    })();
                <\/script>
            </body>
            </html>
        `);
        
        chartWindow.document.close();
    }

    async function loadTopCap() {
        topCapGrid.innerHTML = '';
        
        for (let i = 0; i < TOP_5_SYMBOLS.length; i++) {
            const symbol = TOP_5_SYMBOLS[i];
            try {
                const tickerResp = await fetch(`${BINANCE_API}/ticker/24hr?symbol=${symbol}`);
                const ticker = await tickerResp.json();
                
                const analysis = await analyzeSymbol(symbol);
                
                const card = document.createElement('div');
                card.className = 'cap-card';
                card.onclick = () => openChartAnalysis(symbol, analysis);
                
                const change = parseFloat(ticker.priceChangePercent);
                const changeClass = change >= 0 ? 'positive' : 'negative';
                
                card.innerHTML = `
                    <div class="cap-rank">#${i + 1} Market Cap</div>
                    <div class="cap-symbol">
                        ${symbol.replace('USDT', '')}
                        <span class="signal-badge ${analysis.signal.includes('COMPRA') ? 'buy' : analysis.signal.includes('VENDA') ? 'sell' : 'neutral'}" style="font-size: 10px;">
                            ${analysis.signal.split(' ')[0]}
                        </span>
                    </div>
                    <div class="cap-price">$${parseFloat(ticker.lastPrice).toFixed(2)}</div>
                    <div class="cap-change ${changeClass}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</div>
                `;
                
                topCapGrid.appendChild(card);
            } catch (e) {
                console.error('Erro ao carregar:', symbol, e);
            }
        }
    }

    async function loadTrendingSignals() {
        trendingBody.innerHTML = '<div class="loading-placeholder"><div class="loading-spinner"></div> Analisando 40+ pares...</div>';
        
        const candidates = allSymbols.slice(0, 40);
        const analyses = [];
        
        for (const symbol of candidates) {
            try {
                const analysis = await analyzeSymbol(symbol);
                if (analysis) {
                    const tickerResp = await fetch(`${BINANCE_API}/ticker/24hr?symbol=${symbol}`);
                    const ticker = await tickerResp.json();
                    
                    analyses.push({
                        ...analysis,
                        change24h: parseFloat(ticker.priceChangePercent)
                    });
                }
            } catch (e) {}
        }
        
        analyses.sort((a, b) => Math.abs(b.netScore) - Math.abs(a.netScore));
        const top5 = analyses.slice(0, 5);
        
        trendingBody.innerHTML = '';
        
        top5.forEach(item => {
            const row = document.createElement('div');
            row.className = 'table-row';
            
            const signalClass = item.signal.includes('COMPRA') ? 'buy' : item.signal.includes('VENDA') ? 'sell' : 'neutral';
            const changeClass = item.change24h >= 0 ? 'positive' : 'negative';
            
            row.innerHTML = `
                <div class="pair-cell">
                    ${item.symbol.replace('USDT', '')}
                </div>
                <div>$${item.price.toFixed(item.price < 1 ? 6 : 2)}</div>
                <div>
                    <span class="signal-badge ${signalClass}">${item.signal}</span>
                </div>
                <div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>${item.strengthPercent.toFixed(0)}%</span>
                        <div class="strength-bar" style="flex:1;">
                            <div class="strength-fill" style="width:${item.strengthPercent}%"></div>
                        </div>
                    </div>
                </div>
                <div class="${changeClass}">${item.change24h >= 0 ? '+' : ''}${item.change24h.toFixed(2)}%</div>
                <div style="text-align: center;">
                    <span class="action-indicator" onclick="event.stopPropagation(); openChartAnalysis('${item.symbol}', ${JSON.stringify(item).replace(/"/g, '&quot;')})">📊</span>
                </div>
            `;
            
            row.onclick = () => openChartAnalysis(item.symbol, item);
            trendingBody.appendChild(row);
        });
    }

    async function loadAllSymbols() {
        try {
            const resp = await fetch(`${BINANCE_API}/exchangeInfo`);
            const data = await resp.json();
            allSymbols = data.symbols
                .filter(s => s.symbol.endsWith('USDT') && s.status === 'TRADING')
                .map(s => s.symbol);
        } catch (e) {
            allSymbols = TOP_5_SYMBOLS;
        }
    }

    globalSearch.addEventListener('input', function() {
        const val = this.value.toUpperCase();
        if (val.length < 2) {
            suggestions.style.display = 'none';
            return;
        }
        
        const filtered = allSymbols.filter(s => s.includes(val)).slice(0, 8);
        suggestions.innerHTML = '';
        
        filtered.forEach(sym => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = sym;
            div.onclick = async () => {
                globalSearch.value = sym;
                suggestions.style.display = 'none';
                const analysis = await analyzeSymbol(sym);
                if (analysis) openChartAnalysis(sym, analysis);
            };
            suggestions.appendChild(div);
        });
        
        suggestions.style.display = filtered.length ? 'block' : 'none';
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            suggestions.style.display = 'none';
        }
    });

    (async function init() {
        initWebSocket();
        await loadAllSymbols();
        await loadTopCap();
        await loadTrendingSignals();
        
        setInterval(() => {
            loadTrendingSignals();
        }, 300000);
    })();

    window.loadTopCap = loadTopCap;
    window.loadTrendingSignals = loadTrendingSignals;
    window.openChartAnalysis = openChartAnalysis;
})();
