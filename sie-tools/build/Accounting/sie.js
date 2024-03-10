"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeSie = void 0;
const promises_1 = require("fs/promises");
const writeSie = async (fileName, vers) => {
    /*  Write SIE header

        #FLAGGA 0
        #FORMAT UTF-8
        #SIETYP 4
        #PROGRAM "Fortnox" 3.51.8
        #GEN 20240205
        #FNR 1051660
        #FNAMN "Diginet Aktiebolag"
        #ADRESS "Anders Westberg" "Grankullev„gen 17" "43992 ONSALA" "070-5954076"
        #RAR 0 20190901 20200831
        #ORGNR 556466-2699
        #OMFATTN 20200831
        #KPTYP EUBAS97
        <CRLF>
        <CRLF>
        <CRLF>
        <CRLF>
        <CRLF>
        <CRLF>
    */
    let sieData = '';
    sieData += '#FLAGGA 0\r\n';
    sieData += '#FORMAT UTF-8\r\n';
    sieData += '#SIETYP 4\r\n';
    sieData += '#PROGRAM "SPCS Win95\r\n';
    sieData += '#GEN 20240205\r\n';
    //sieData += '#FNR 1051660\r\n'
    sieData += '#FNAMN "JUSTGÅRDENS VA-FÖRENING"\r\n';
    sieData += '#ADRESS "Anders Westberg" "Grankullev„gen 17" "43992 ONSALA" "070-5954076" \r\n';
    sieData += '#RAR 0 20240101 20241231\r\n';
    sieData += '#ORGNR 003282-1132\r\n';
    //sieData += '#OMFATTN 20240831\r\n'
    sieData += '#KPTYP EUBAS97\r\n';
    sieData += '\r\n\r\n\r\n\r\n\r\n\r\n';
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
    sieData += '#VER A 1 20240201 "Ränta skattekontot" 20240125\r\n';
    sieData += '{\r\n';
    sieData += '#TRANS 1110 {} 29 "" "Ränta skattekontot" 0\r\n';
    sieData += '#TRANS 2020 {} -29 "" "Ränta skattekontot" 0\r\n';
    sieData += '#TRANS 1110 {} -34 "" "Ränta skattekontot" 0\r\n';
    sieData += '#TRANS 2020 {} 34 "" "Ränta skattekontot" 0\r\n';
    sieData += '}\r\n';
    await (0, promises_1.writeFile)(fileName, sieData, { encoding: 'utf-8' });
};
exports.writeSie = writeSie;
//# sourceMappingURL=sie.js.map