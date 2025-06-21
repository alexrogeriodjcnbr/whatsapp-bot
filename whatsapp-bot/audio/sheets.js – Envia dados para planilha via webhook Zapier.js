const axios = require('axios');

async function enviarParaPlanilha(dados) {
    try {
        const res = await axios.post(process.env.GOOGLE_SHEET_WEBHOOK, dados);
        console.log("📊 Enviado para Google Sheets:", res.status);
    } catch (error) {
        console.error("Erro ao enviar para planilha:", error.message);
    }
}

module.exports = enviarParaPlanilha;
