require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const connectDB = require('./db');
const { Configuration, OpenAIApi } = require('openai');

// Conectar ao MongoDB
connectDB();

// Conectar à API da OpenAI
const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY
}));

// Inicializa o bot do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

// Mostra o QR Code
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Loga quando estiver pronto
client.on('ready', () => {
    console.log('🤖 Bot WhatsApp está ativo!');
});

// Função para resposta com IA
async function gerarRespostaChatGPT(pergunta) {
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: pergunta }],
        });

        return completion.data.choices[0].message.content;
    } catch (err) {
        console.error("Erro no ChatGPT:", err);
        return "⚠️ Erro ao gerar resposta com IA.";
    }
}

// Evento de mensagens recebidas
client.on('message', async (msg) => {
    const texto = msg.body.toLowerCase();

    if (texto === 'menu' || texto === 'oi' || texto === 'olá') {
        msg.reply(
            `👋 Bem-vindo ao Suporte!\n\n` +
            `Digite uma opção:\n` +
            `1️⃣ Falar com atendente\n` +
            `2️⃣ Ver produtos\n` +
            `3️⃣ Tirar uma dúvida com IA\n` +
            `0️⃣ Ver o menu`
        );
    } else if (texto === '1') {
        msg.reply('👩‍💼 Em instantes um atendente falará com você.');
    } else if (texto === '2') {
        msg.reply('📦 Temos os seguintes produtos:\n\n- Caneca R$ 25\n- Camiseta R$ 50\n\nDigite o nome para saber mais.');
    } else if (texto === '3') {
        msg.reply('🧠 Ok! Envie sua dúvida agora e a IA responderá.');
    } else if (texto.startsWith('?')) {
        const pergunta = texto.replace('?', '');
        const resposta = await gerarRespostaChatGPT(pergunta);
        msg.reply(resposta);
    } else {
        msg.reply('🤖 Desculpe, não entendi. Digite "menu" para ver as opções.');
    }
});

client.initialize();
