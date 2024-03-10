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

function formatNumberWithDecimals(num: number): string {
    // Check if the number is a whole number
    if (num % 1 === 0) {
        // If it's a whole number, format with zero decimals
        return num.toFixed(0);
    } else {
        // If it has decimals, format with two decimals
        return num.toFixed(2);
    }
}

export const writeSie = async (fileNameBase: string, vers: Verification[], firstDay: string = '0901', lastDay: string = '0831') => {
    let datestrFrom: string = ''
    let datestrTo: string = ''
    let datestrVer: string = ''
    let verNumber = 1
    let sieData = ''
    let accountingDate = new Date('2010-01-01')
    for (let n = 0; n <= vers.length; n++) {
        const ver = (n < vers.length) ? vers[n] : undefined
        if (ver)
            datestrVer = formatDateYYYYMMDD(ver.date)
        if (n === vers.length || (sieData && ver && datestrVer > datestrTo)) {
            await fsp.writeFile(`${fileNameBase} ${datestrFrom} ${datestrTo}.se`, iconv.encode(sieData, 'cp850'))
            verNumber = 1
            if (n === vers.length)
                break
        }
        if (ver) {
            if (verNumber === 1) {
                datestrFrom = formatDateYYYYMMDD(ver.date).substring(0, 4) + firstDay
                datestrTo = formatDateYYYYMMDD(ver.date, 1).substring(0, 4) + lastDay
                sieData = ''
                sieData += '#FLAGGA 0\r\n'
                sieData += '#FORMAT PC8\r\n'
                sieData += '#SIETYP 4\r\n'
                sieData += '#PROGRAM "SPCS" 3.1.1\r\n'
                sieData += '#GEN 20240205\r\n'
                //sieData += '#FNR 1051660\r\n'
                sieData += '#FNAMN "Diginet Aktiebolag"\r\n'
                sieData += '#ADRESS "Diginet AB" "Grankullevägen 17" "43992 ONSALA" "070-5954076" \r\n'
                sieData += `#RAR 0 ${datestrFrom} ${datestrTo}\r\n`
                sieData += `#RAR -1 ${addYear(datestrFrom, -1)} ${addYear(datestrTo, -1)}\r\n`
                sieData += '#ORGNR 556466-2699\r\n'
                sieData += `#OMFATTN ${datestrTo}\r\n`
                sieData += '#KPTYP EUBAS97\r\n\r\n'

                const kontoplan = await fsp.readFile('../real-sie-kontoplan.txt', 'utf8')
                sieData += kontoplan
                sieData += '\r\n'
            }

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
                sieData += `#TRANS ${item.account} {} ${formatNumberWithDecimals(item.amount)} "" "${item.description}" 0\r\n`
            }
            sieData += '}'
            verNumber++
        }
    }
}
