"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = require("glob");
const fs_1 = require("fs");
class Locale {
    constructor(dir) {
        this.dir = dir;
        this.languages = {};
        this.actualLang = 'pt';
        this.options = {
            returnUndefined: true
        };
    }
    async init(options) {
        this.options = options;
        const dirs = glob_1.sync(this.dir + '/**/*.json');

        const promises = dirs.map(async (file) => {
            return new Promise((rej) => {
                const lang = file.split('/')[2];

                if (this.languages[lang] === undefined) this.languages[lang] = {}

                const ns = file.split('/')[3].replace('.json', '');
                fs_1.readFile(file, async (err, data) => {
                    this.languages[lang][ns] = JSON.parse(data.toString());
                    rej(true);
                });
            });
        });
        await Promise.all(promises);
        return this.t.bind(this);
    }
    async setLang(lang) {
        this.actualLang = lang;
    }
    t(locale, options) {
        let nSeparator = locale.split(':');
        let actualLocale = [];
        actualLocale.push(this.actualLang);
        nSeparator.map(ns => {
            const lSeparator = ns.split('.');
            if (lSeparator.length !== 2) {
                actualLocale.push(ns);
            }
            else {
                actualLocale.push(lSeparator[0]);
                actualLocale.push(lSeparator[1]);
            }
        });
        let finalLocale = {};
        actualLocale.map((locale, index) => {
            if (index === 0) {
                finalLocale = this.languages[locale];
            }
            else {

                finalLocale = finalLocale[locale];
            }
        });
        if (!this.options.returnUndefined) {
            if (finalLocale === undefined) {
                return 'No locale available';
            }
            else {
                return this.format(finalLocale, options);
            }
        }
        else {
            return this.format(finalLocale, options);
        }
    }

    format(locale, options) {
        var formatted = locale;
        if (typeof options == 'object') {
            var vars = options;
            for (let v in vars) {
                var regexp = new RegExp('\\{{' + v + '\\}}', 'gi');
                formatted = formatted.replace(regexp, vars[v]);
            }
        }
        return formatted;
    }
}
module.exports = Locale;
