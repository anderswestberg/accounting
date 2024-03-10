import fsp from 'fs/promises'
import { Verification } from '.'
import { formatDateYYYYMMDD } from '../Utils'
import iconv from 'iconv-lite'
import { randomInt } from 'crypto'

const addYear = (yearFrom: string, value: number) => {
    let year = parseInt(yearFrom.substring(0, 4))
    year += value
    return year.toString() + yearFrom.substring(4)
}

export const writeSie = async (fileNameBase: string, vers: Verification[]) => {
    let yearFrom: string = ''
    let yearTo: string = ''
    let verNumber = 1
    let sieData = ''
    let accountingDate = new Date('2010-01-01')
    for (let n = 0; n < vers.length; n++) {
        const ver = vers[n]
        if (verNumber === 1) {
            yearFrom = formatDateYYYYMMDD(ver.date).substring(0, 4) + '0901'
            yearTo = formatDateYYYYMMDD(ver.date).substring(0, 4) + '0831'
            sieData = ''
            sieData += '#FLAGGA 0\r\n'
            sieData += '#FORMAT PC8\r\n'
            sieData += '#SIETYP 4\r\n'
            sieData += '#PROGRAM "SPCS" 3.1.1\r\n'
            sieData += '#GEN 20240205\r\n'
            //sieData += '#FNR 1051660\r\n'
            sieData += '#FNAMN "Diginet Aktiebolag"\r\n'
            sieData += '#ADRESS "Diginet AB" "Grankullevägen 17" "43992 ONSALA" "070-5954076" \r\n'
            sieData += `#RAR 0 ${yearFrom} ${yearTo}\r\n`
            sieData += `#RAR -1 ${addYear(yearFrom, -1)} ${addYear(yearTo, -1)}\r\n`
            sieData += '#ORGNR 556466-2699\r\n'
            sieData += `#OMFATTN ${yearTo}\r\n`
            sieData += '#KPTYP EUBAS97\r\n\r\n'

            const kontoplan = await fsp.readFile('../real-sie-kontoplan.txt', 'utf8')
            sieData += kontoplan
            sieData += '\r\n'
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
            let nextMonth = ver.date.getMonth() + 1
            if (nextMonth > 12)
                nextMonth = 1;
            accountingDate.setFullYear(ver.date.getFullYear())
            accountingDate.setMonth(nextMonth)
            accountingDate.setDate(1 + randomInt(28))
        }
        sieData += `\r\n#VER ${ver.type} ${verNumber} ${formatDateYYYYMMDD(ver.date)} "${ver.description}" ${formatDateYYYYMMDD(accountingDate)}\r\n`
        sieData += '{\r\n'
        for (let item of ver.items) {
            sieData += `#TRANS ${item.account} {} ${item.amount} "" "${item.description}" 0\r\n`
        }
        sieData += '}'
        verNumber++
        if (n === (vers.length - 1)) {
            await fsp.writeFile(fileNameBase + '.se', iconv.encode(sieData, 'cp850'))
            verNumber = 1
        }
    }
}
