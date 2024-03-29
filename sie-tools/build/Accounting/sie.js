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
function formatNumberWithDecimals(num) {
    // Check if the number is a whole number
    if (num % 1 === 0) {
        // If it's a whole number, format with zero decimals
        return num.toFixed(0);
    }
    else {
        // If it has decimals, format with two decimals
        return num.toFixed(2);
    }
}
const writeSie = async (fileNameBase, vers, A, B, C, D, E, F, firstDay = '0901', lastDay = '0831') => {
    let datestrFrom = '';
    let datestrTo = '';
    let datestrVer = '';
    let verNumber = 1;
    let groupVerNumber = {
        A, B, C, D, E, F
    };
    let sieData = '';
    let accountingDate = new Date('2010-01-01');
    datestrFrom = (0, Utils_1.formatDateYYYYMMDD)(vers[0].date).substring(0, 4) + firstDay;
    datestrTo = (0, Utils_1.formatDateYYYYMMDD)(vers[0].date, 1).substring(0, 4) + lastDay;
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
    for (let n = 0; n <= vers.length; n++) {
        const ver = (n < vers.length) ? vers[n] : undefined;
        if (ver)
            datestrVer = (0, Utils_1.formatDateYYYYMMDD)(ver.date);
        if (n === vers.length || (sieData && ver && datestrVer > datestrTo)) {
            await promises_1.default.writeFile(`${fileNameBase} ${datestrFrom} ${datestrTo}.se`, iconv_lite_1.default.encode(sieData, 'cp850'));
            groupVerNumber = { A: 1, B: 1, C: 1, D: 1, E: 1, F: 1 };
            verNumber = 1;
            if (n === vers.length)
                break;
            datestrFrom = (0, Utils_1.formatDateYYYYMMDD)(vers[n].date).substring(0, 4) + firstDay;
            datestrTo = (0, Utils_1.formatDateYYYYMMDD)(vers[n].date, 1).substring(0, 4) + lastDay;
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
            sieData += kontoplan;
            sieData += '\r\n';
        }
        if (ver) {
            if (ver.date > accountingDate || ver.date.getMonth() === accountingDate.getMonth()) {
                let nextMonth = ver.date.getMonth() + 1;
                if (nextMonth > 12)
                    nextMonth = 1;
                accountingDate.setFullYear(ver.date.getFullYear());
                accountingDate.setMonth(nextMonth);
                accountingDate.setDate(1 + (0, crypto_1.randomInt)(28));
            }
            sieData += `\r\n#VER ${ver.type} ${groupVerNumber[ver.type]} ${(0, Utils_1.formatDateYYYYMMDD)(ver.date)} "${ver.description}" ${(0, Utils_1.formatDateYYYYMMDD)(accountingDate)}\r\n`;
            sieData += '{\r\n';
            for (let item of ver.items) {
                sieData += `#TRANS ${item.account} {} ${formatNumberWithDecimals(item.amount)} "" "${item.description}" 0\r\n`;
            }
            sieData += '}';
            groupVerNumber[ver.type]++;
            verNumber++;
        }
    }
};
exports.writeSie = writeSie;
//# sourceMappingURL=sie.js.map