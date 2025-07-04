const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('✅ MongoDB conectado');
    } catch (error) {
        console.error('❌ Erro ao conectar no MongoDB', error);
    }
};
module.exports = connectDB;