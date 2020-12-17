const mongoose = require('mongoose');
const logger = require('../utils/logger');

module.exports = {
    start(){
        try{

            mongoose.connect('mongodb+srv://admin:<pass>@bot-tutorial.ygt72.mongodb.net/<name>?retryWrites=true&w=majority', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            })

            logger.sucess(`(DataBase) - Conectado ao Banco de Dados.`)

        } catch (err) {
            if(err) return logger.error(`(DataBase) - ERROR:`, + err)
        }
    }
}
