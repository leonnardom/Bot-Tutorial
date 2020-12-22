const moment = require("moment");

module.exports = {
  async sucess(content) {
    console.log(
      `[${moment().format("DD-MM-YYYY HH:mm")} - Sucesso ✅]` + content
    );
  },
  async error(content) {
    console.log(`[${moment().format("DD-MM-YYYY HH:mm")} - ERRO ❌]` + content);
  },
  async warn(content) {
    console.log(
      `[${moment().format("DD-MM-YYYY HH:mm")} - AVISO ⚠️]` + content
    );
  },
};
