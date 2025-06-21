const schedule = require('node-schedule');

function agendarMensagem(client, numero, mensagem, data) {
    schedule.scheduleJob(data, () => {
        client.sendMessage(numero, mensagem);
        console.log(`⏰ Mensagem enviada para ${numero} em ${data}`);
    });
}

module.exports = agendarMensagem;
