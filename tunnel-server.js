const WebSocket = require('ws');
const http = require('http');
const https = require('https');
const url = require('url');

const wss = new WebSocket.Server({ port: 8080 });
console.log('Servidor de Sinalização WebSocket rodando na porta 8080');

// Armazena as conexões dos peers (navegador headless e saída)
const peers = {
    browser: null,
    exit: null
};

wss.on('connection', (ws, req) => {
    const location = url.parse(req.url, true);
    const peerType = location.query.type; // 'browser' ou 'exit'

    console.log(`Novo peer conectado: ${peerType}`);

    if (peerType === 'browser') {
        peers.browser = ws;
        ws.on('message', (message) => {
            // Se receber uma mensagem do browser, encaminha para o peer de saída
            if (peers.exit && peers.exit.readyState === WebSocket.OPEN) {
                peers.exit.send(message);
            }
        });
    } else if (peerType === 'exit') {
        peers.exit = ws;
        ws.on('message', (message) => {
            // Se receber uma mensagem do ponto de saída, encaminha para o browser
            if (peers.browser && peers.browser.readyState === WebSocket.OPEN) {
                peers.browser.send(message);
            }
        });
    }

    ws.on('close', () => {
        console.log(`Peer desconectado: ${peerType}`);
        if (peerType === 'browser') peers.browser = null;
        if (peerType === 'exit') peers.exit = null;
    });
});

// Simulador de um ponto de saída WebRTC real (para este exemplo, apenas eco)
// Na prática, você teria um servidor WebRTC separado.
// Este código é apenas para o signaling.
console.log('Aguardando conexões...');
