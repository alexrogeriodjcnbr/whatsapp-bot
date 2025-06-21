const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inicializa o cliente com autenticação local
const client = new Client({
    authStrategy: new LocalAuth()
});

// Mostra o QR Code no terminal para login
client.on('qr', (qr) => {
    console.log('🔐 Escaneie o QR Code abaixo com seu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Após autenticação
client.on('ready', () => {
    console.log('✅ Bot está conectado ao WhatsApp!');
});

// Quando uma mensagem for recebida
client.on('message', async (msg) => {
    const chat = await msg.getChat();

    // Mensagens reconhecidas
    if (msg.body === '1') {
        msg.reply('📞 Um atendente irá falar com você em breve!');
    } else if (msg.body === '2') {
        msg.reply('🛒 Produtos disponíveis:\n1️⃣ Produto A – R$ 50\n2️⃣ Produto B – R$ 70');
    } else if (msg.body.toLowerCase() === 'oi' || msg.body.toLowerCase() === 'olá') {
        msg.reply(
            `👋 Olá! Bem-vindo à Loja XYZ! Como posso ajudar?\n\n` +
            `1️⃣ Falar com atendente\n` +
            `2️⃣ Ver produtos`
        );
    } else if (msg.body === '!menu') {
        msg.reply('📋 Menu:\n1️⃣ Falar com atendente\n2️⃣ Ver produtos');
    }
});

// Inicia o cliente
client.initialize();
