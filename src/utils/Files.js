const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

module.exports = class Files {
  static async requireDirectory(dirPath, sucess, error, recursive = true) {
    const files = await Files.readdir(dirPath);
    const filesObject = {};
    return Promise.all(
      files.map(async (file) => {
        const fullPath = path.resolve(dirPath, file);
        if (file.match(/\.(js|json)$/)) {
          try {
            const required = require(fullPath);
            if (sucess) await sucess(required);
            filesObject[file] = required;
            return required;
          } catch (e) {
            console.log(e);
          }
        } else if (recursive) {
          const isDirectory = await Files.stat(fullPath).then((x) =>
            x.isDirectory()
          );

          if (isDirectory) {
            return files.requireDirectory(fullPath, sucess, error);
          }
        }
      })
    )
      .then(() => filesObject)
      .catch(console.error);
  }
};

module.exports.readdir = promisify(fs.readdir);
module.exports.readFile = promisify(fs.readFile);
module.exports.stat = promisify(fs.stat);
