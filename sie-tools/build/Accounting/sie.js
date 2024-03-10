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
const writeSie = async (fileNameBase, vers) => {
    let yearFrom = '';
    let yearTo = '';
    let verNumber = 1;
    let sieData = '';
    let accountingDate = new Date('2010-01-01');
    for (let n = 0; n < vers.length; n++) {
        const ver = vers[n];
        if (verNumber === 1) {
            yearFrom = (0, Utils_1.formatDateYYYYMMDD)(ver.date).substring(0, 4) + '0901';
            yearTo = (0, Utils_1.formatDateYYYYMMDD)(ver.date).substring(0, 4) + '0831';
            sieData = '';
            sieData += '#FLAGGA 0\r\n';
            sieData += '#FORMAT PC8\r\n';
            sieData += '#SIETYP 4\r\n';
            sieData += '#PROGRAM "SPCS" 3.1.1\r\n';
            sieData += '#GEN 20240205\r\n';
            //sieData += '#FNR 1051660\r\n'
            sieData += '#FNAMN "Diginet Aktiebolag"\r\n';
            sieData += '#ADRESS "Diginet AB" "Grankullevägen 17" "43992 ONSALA" "070-5954076" \r\n';
            sieData += `#RAR 0 ${yearFrom} ${yearTo}\r\n`;
            sieData += `#RAR -1 ${addYear(yearFrom, -1)} ${addYear(yearTo, -1)}\r\n`;
            sieData += '#ORGNR 556466-2699\r\n';
            sieData += `#OMFATTN ${yearTo}\r\n`;
            sieData += '#KPTYP EUBAS97\r\n\r\n';
            const kontoplan = await promises_1.default.readFile('../real-sie-kontoplan.txt', 'utf8');
            sieData += kontoplan;
            sieData += '\r\n';
        }
        /*  Write SIE VER
    
        #VER A 1 20190901 "R„nta skattekontot" 20201125
        {
        #TRANS 1645 {} 29 "" "R„nta skattekontot" 0
        #TRANS 8451 {} -29 "" "R„nta skattekontot" 0
        #TRANS 1645 {} -34 "" "R„nta skattekontot" 0
        #TRANS 8451 {} 34 "" "R„nta skattekontot" 0
        }
            <CRLF>
    
        */
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
        if (n === (vers.length - 1)) {
            await promises_1.default.writeFile(fileNameBase + '.se', iconv_lite_1.default.encode(sieData, 'cp850'));
            verNumber = 1;
        }
    }
};
exports.writeSie = writeSie;
//# sourceMappingURL=sie.js.map