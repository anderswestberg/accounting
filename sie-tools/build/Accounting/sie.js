"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeSie = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const Utils_1 = require("../Utils");
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const crypto_1 = require("crypto");
const addYear = (yearFrom, value) => {
    let year = parseInt(yearFrom.substring(0, 4));
    year += value;
    return year.toString() + yearFrom.substring(4);
};
const writeSie = async (fileNameBase, vers, firstDay = '0901', lastDay = '0831') => {
    let datestrFrom = '';
    let datestrTo = '';
    let datestrVer = '';
    let verNumber = 1;
    let sieData = '';
    let accountingDate = new Date('2010-01-01');
    for (let n = 0; n <= vers.length; n++) {
        const ver = (n < vers.length) ? vers[n] : undefined;
        if (ver)
            datestrVer = (0, Utils_1.formatDateYYYYMMDD)(ver.date);
        if (n === vers.length || (sieData && ver && datestrVer > datestrTo)) {
            await promises_1.default.writeFile(`${fileNameBase} ${datestrFrom} ${datestrTo}.se`, iconv_lite_1.default.encode(sieData, 'cp850'));
            verNumber = 1;
            if (n === vers.length)
                break;
        }
        if (ver) {
            if (verNumber === 1) {
                datestrFrom = (0, Utils_1.formatDateYYYYMMDD)(ver.date).substring(0, 4) + firstDay;
                datestrTo = (0, Utils_1.formatDateYYYYMMDD)(ver.date, 1).substring(0, 4) + lastDay;
                sieData = '';
                sieData += '#FLAGGA 0\r\n';
                sieData += '#FORMAT PC8\r\n';
                sieData += '#SIETYP 4\r\n';
                sieData += '#PROGRAM "SPCS" 3.1.1\r\n';
                sieData += '#GEN 20240205\r\n';
                //sieData += '#FNR 1051660\r\n'
                sieData += '#FNAMN "Diginet Aktiebolag"\r\n';
                sieData += '#ADRESS "Diginet AB" "Grankullevägen 17" "43992 ONSALA" "070-5954076" \r\n';
                sieData += `#RAR 0 ${datestrFrom} ${datestrTo}\r\n`;
                sieData += `#RAR -1 ${addYear(datestrFrom, -1)} ${addYear(datestrTo, -1)}\r\n`;
                sieData += '#ORGNR 556466-2699\r\n';
                sieData += `#OMFATTN ${datestrTo}\r\n`;
                sieData += '#KPTYP EUBAS97\r\n\r\n';
                const kontoplan = await promises_1.default.readFile('../real-sie-kontoplan.txt', 'utf8');
                sieData += kontoplan;
                sieData += '\r\n';
            }
            if (ver.date > accountingDate || ver.date.getMonth() === accountingDate.getMonth()) {
                let nextMonth = ver.date.getMonth() + 1;
                if (nextMonth > 12)
                    nextMonth = 1;
                accountingDate.setFullYear(ver.date.getFullYear());
                accountingDate.setMonth(nextMonth);
                accountingDate.setDate(1 + (0, crypto_1.randomInt)(28));
            }
            sieData += `\r\n#VER ${ver.type} ${verNumber} ${(0, Utils_1.formatDateYYYYMMDD)(ver.date)} "${ver.description}" ${(0, Utils_1.formatDateYYYYMMDD)(accountingDate)}\r\n`;
            sieData += '{\r\n';
            for (let item of ver.items) {
                sieData += `#TRANS ${item.account} {} ${item.amount} "" "${item.description}" 0\r\n`;
            }
            sieData += '}';
            verNumber++;
        }
    }
};
exports.writeSie = writeSie;
//# sourceMappingURL=sie.js.map