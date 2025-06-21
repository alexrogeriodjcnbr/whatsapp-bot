require('dotenv').config();
const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const connectDB = require('./db');
const { Configuration, OpenAIApi } = require('openai');
const enviarParaPlanilha = require('./sheets');
const agendarMensagem = require('./schedule');
const fs = require('fs');

// Conexões
connectDB();

const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY
}));

const client = new Client({
    authStrategy: new LocalAuth()
});

// QR Code
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Bot pronto
client.on('ready', () => {
    console.log('🤖 Bot pronto!');
});

// IA via ChatGPT
async function respostaIA(pergunta) {
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: pergunta }],
        });
        return completion.data.choices[0].message.content;
    } catch (err) {
        return "❌ Erro na IA.";
    }
}

// Quando mensagem recebida
client.on('message', async (msg) => {
    const texto = msg.body.toLowerCase();
    const numero = msg.from;

    // Log básico
    console.log(`📩 Mensagem de ${numero}: ${texto}`);

    if (texto === 'menu') {
        const botoes = new Buttons(
            '👋 Bem-vindo!\nEscolha uma opção:',
            [{ body: 'Ver produtos' }, { body: 'Falar com atendente' }, { body: 'Perguntar à IA' }],
            '🤖 MENU INTERATIVO',
            'Escolha uma opção abaixo'
        );
        client.sendMessage(numero, botoes);
    } else if (texto === 'ver produtos') {
        client.sendMessage(numero, '📦 Temos:\n- Camiseta\n- Caneca\n- Boné');
        const imagem = fs.readFileSync('./img/caneca.jpg');
        client.sendMessage(numero, new MessageMedia('image/jpeg', imagem.toString('base64'), 'caneca.jpg'));
    } else if (texto === 'falar com atendente') {
        client.sendMessage(numero, '👨‍💼 Encaminhando você para um atendente...');
        enviarParaPlanilha({ cliente: numero, motivo: 'Atendimento' });
    } else if (texto === 'perguntar à ia') {
        client.sendMessage(numero, '🧠 Envie sua pergunta começando com `?`');
    } else if (texto.startsWith('?')) {
        const pergunta = texto.replace('?', '').trim();
        const resposta = await respostaIA(pergunta);
        client.sendMessage(numero, resposta);
    } else if (texto === 'enviar audio') {
        const audio = fs.readFileSync('./audio/boasvindas.ogg');
        client.sendMessage(numero, new MessageMedia('audio/ogg', audio.toString('base64'), 'boasvindas.ogg'));
    } else if (texto === 'agendar') {
        const horario = new Date(Date.now() + 60000); // 1 minuto depois
        agendarMensagem(client, numero, '⏰ Mensagem agendada com sucesso!', horario);
        client.sendMessage(numero, '✅ Sua mensagem será enviada em 1 minuto.');
    } else {
        client.sendMessage(numero, '🤖 Digite "menu" para ver as opções.');
    }
});

client.initialize();
