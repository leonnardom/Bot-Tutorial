const mongoose = require('mongoose');
const logger = require('../utils/logger');

module.exports = {
    start(){
        try{

            mongoose.connect(process.env.DATABASE_CONNECT, {
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
