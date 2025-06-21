require('dotenv').config();
const { Client, LocalAuth, Buttons, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const connectDB = require('./db');
const { Configuration, OpenAIApi } = require('openai');
const enviarParaPlanilha = require('./sheets');
const agendarMensagem = require('./schedule');
const fs = require('fs');

connectDB();

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

const client = new Client({ authStrategy: new LocalAuth() });

client.on('qr', (qr) => { qrcode.generate(qr, { small: true }); });
client.on('ready', () => { console.log('🤖 Bot pronto!'); });

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

client.on('message', async (msg) => {
    const texto = msg.body.toLowerCase();
    const numero = msg.from;
    console.log(`📩 Mensagem de ${numero}: ${texto}`);

    if (texto === 'menu') {
        const botoes = new Buttons('👋 Bem-vindo! Escolha uma opção:', [{ body: 'Ver produtos' }, { body: 'Falar com atendente' }, { body: 'Perguntar à IA' }], '🤖 MENU INTERATIVO', 'Escolha uma opção abaixo');
        client.sendMessage(numero, botoes);
    } else if (texto === 'ver produtos') {
        client.sendMessage(numero, '📦 Produtos:
- Camiseta
- Caneca
- Boné');
        const imagem = fs.readFileSync('./img/caneca.jpg');
        const media = new MessageMedia('image/jpeg', imagem.toString('base64'), 'caneca.jpg');
        client.sendMessage(numero, media);
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
        const media = new MessageMedia('audio/ogg; codecs=opus', audio.toString('base64'), 'boasvindas.ogg');
        client.sendMessage(numero, media);
    } else if (texto === 'agendar') {
        const horario = new Date(Date.now() + 60000);
        agendarMensagem(client, numero, '⏰ Mensagem agendada com sucesso!', horario);
        client.sendMessage(numero, '✅ Sua mensagem será enviada em 1 minuto.');
    } else {
        client.sendMessage(numero, '🤖 Digite "menu" para ver as opções.');
    }
});

client.initialize();