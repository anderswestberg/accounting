import fsp from 'fs/promises'
import util from 'util'
import { Verification } from '.'
import { parse as parseCsv } from 'csv'
import sie from 'sie-reader'
import { getAccountPlan } from './GetAccountPlan'
import { executeTemplate, findTemplate } from './AccountingTemplates'
import { parseDateString, parseDateStringYYMMDD } from '../Utils'
import readXlsxFile from 'read-excel-file'

export const parseCsvAsync = util.promisify<string, any, any>(parseCsv)
export const sieReadFileAsync = util.promisify<string, any>(sie.readFile)

export const getSebVerifications = async () => {
    let result: Verification[] = []
    const csv = await fsp.readFile('../Kontoutdrag SEB.csv', { encoding: 'utf-8' })
    const transactions = await parseCsvAsync(csv, {
        comment: '#',
        delimiter: '\t'
    })
    for (let n = 1; n < transactions.length; n++) {
        const transaction = transactions[n]
        transaction[1] = parseDateString(transaction[1])
        const template = findTemplate(transaction[0])
        if (template) {
            if (template.code === 'lbetal') {
                const template = findTemplate('lev-faktura')
                if (template) {
                    const verification = executeTemplate(template, { date: transaction[1], total: parseFloat(transaction[5]), customer: transaction[3] })
                    if (verification)
                        result.push(verification)
                }
            }
            const verification = executeTemplate(template, { date: transaction[1], total: parseFloat(transaction[5]) })
            if (verification)
                result.push(verification)
        }
    }
    return result
}

export const getCustomerInvoiceVerifications = async () => {
    let result: Verification[] = []
    //let folder = '../customer-invoices/'
    let folder = 'C:/Diginet/Fakturor/'
    const files = await fsp.readdir(folder)
    for (const file of files) {
        if (file.substring(0, 3) === '202' && file.indexOf('.xlsx') >= 0) {
            const buffer = await fsp.readFile(folder + file)
            const contents = await readXlsxFile(buffer)
            const invoice = contents[0][7]
            const date = contents[1][7] as never as Date
            const startDate = new Date('2021-11-30')
            if (date.getTime() > startDate.getTime()) {
                let total = 0
                for (let n = 0; n < contents.length; n++) {
                    const row = contents[n]
                    if (row[0] === 'Netto') {
                        total = contents[n + 1][0] as never as number
                        break
                    }
                }
                const template = findTemplate('kundfaktura')
                if (template) {
                    const verification = executeTemplate(template, { date, total, invoice })
                    if (verification)
                        result.push(verification)
                }
            }
        }
    }
    return result
}

export const getPrivatKontoVerifications = async () => {
    let result: Verification[] = []
    const csv = await fsp.readFile('../Privatkonto LF.csv', { encoding: 'utf-8' })
    const transactions = await parseCsvAsync(csv, {
        comment: '#',
        quote: "'",
        delimiter: ';',
        relaxColumnCount: true,
    })
    for (let n = 0; n < transactions.length; n++) {
        const transaction = transactions[n]
        const date = parseDateString(transaction[0]) as Date
        const total = -parseFloat(transaction[3])
        const company = transaction[2]
        const template = findTemplate('inköp privat')
        if (template) {
            const verification = executeTemplate(template, { date, total, seller: company })
            if (verification)
                result.push(verification)
        }
    }
    return result
}

export const getRentVerifications = async () => {
    let result: Verification[] = []
    const csv = await fsp.readFile('../hyrestransaktioner.csv', { encoding: 'utf-8' })
    const transactions = await parseCsvAsync(csv, {
        comment: '#',
        delimiter: ','
    })
    for (let n = 0; n < transactions.length; n++) {
        const transaction = transactions[n]
        const date = parseDateString(transaction[0]) as Date
        const total = -parseFloat(transaction[1])
        const template = findTemplate('lokalhyra')
        if (template) {
            const verification = executeTemplate(template, { date, total })
            if (verification)
                result.push(verification)
        }
    }
    return result
}

export const getCardVerifications = async () => {
    let result: Verification[] = []
    const csv = await fsp.readFile('../kort-transaktioner.txt', { encoding: 'utf-8' })
    const transactions = await parseCsvAsync(csv, {
        comment: '#',
        delimiter: ',',
        relaxColumnCount: true,
    })
    for (let n = 0; n < transactions.length; n++) {
        const transaction = transactions[n]
        const date = parseDateStringYYMMDD(transaction[0]) as Date
        const seller = transaction[1]
        const total = parseFloat(transaction[2])
        const template = findTemplate('kortköp')
        if (template) {
            const verification = executeTemplate(template, { date, total, seller })
            if (verification)
                result.push(verification)
        }
    }
    return result
}

export const getKundfordringarVerifications = async () => {
    let result: Verification[] = []
    const csv = await fsp.readFile('../kundfordringartransaktioner.csv', { encoding: 'utf-8' })
    const transactions = await parseCsvAsync(csv, {
        comment: '#',
        delimiter: ','
    })
    return result
}

export const getTaxVerifications = async () => {
    let result: Verification[] = []
    const csv = await fsp.readFile('../skatt transaktioner.txt', { encoding: 'utf-8' })
    const transactions = await parseCsvAsync(csv, {
        comment: '#',
        delimiter: ',',
        relax_column_count: true,
    })
    return result
}

export const getUpparbetatVerifications = async () => {
    // Bokför på 1790 upplupna intäkter resp 1510 kundfordringar
    let result: Verification[] = []
    const csv = await fsp.readFile('../upparbetattransaktioner.csv', { encoding: 'utf-8' })
    const transactions = await parseCsvAsync(csv, {
        comment: '#',
        delimiter: ','
    })
    return result
}


export const getSalaryVerifications = async () => {
    let result: Verification[] = []
    //let folder = '../customer-invoices/'
    let folder = 'C:/Diginet/Lön/'
    const files = await fsp.readdir(folder)
    for (const file of files) {
        if (file.substring(0, 3) === '202' && file.indexOf('.xlsx') >= 0) {
            const buffer = await fsp.readFile(folder + file)
            const contents = await readXlsxFile(buffer)
            const invoice = contents[0][7]
            const date = contents[1][7] as never as Date
            const startDate = new Date('2021-11-30')
            if (date.getTime() > startDate.getTime()) {
                let total = 0
                for (let n = 0; n < contents.length; n++) {
                    const row = contents[n]
                    if (row[0] === 'Netto') {
                        total = contents[n + 1][0] as never as number
                        break
                    }
                }
                const template = findTemplate('kundfaktura')
                if (template) {
                    const verification = executeTemplate(template, { date, total, invoice })
                    if (verification)
                        result.push(verification)
                }
            }
        }
    }
    return result
}

export const loadTransactionsFromFiles = async () => {
    let result: Verification[] = []

    result = result.concat(await getSebVerifications())
    result = result.concat(await getPrivatKontoVerifications())
    result = result.concat(await getUpparbetatVerifications())
    result = result.concat(await getTaxVerifications())
    result = result.concat(await getRentVerifications())
    result = result.concat(await getCardVerifications())
    result = result.concat(await getSalaryVerifications())
    result = result.concat(await getKundfordringarVerifications())
    result = result.concat(await getCustomerInvoiceVerifications())
    result = result.sort((a, b) => {
        return a.date.getTime() - b.date.getTime()
    })
    return result
}

export const createVerificationsWithPlainTextAccountNames = async (fileName: string) => {

    const sieObject = await sieReadFileAsync(fileName)
    const accountPlan = await getAccountPlan()
    const plainTextPosts = sieObject.poster.reduce((ack: any[], current: any) => {
        if (current.etikett === 'ver') {
            const isFixed = current.poster.reduce((ack: boolean, trans: any) => {
                return ack || trans.etikett === 'rtrans' || trans.etikett === 'btrans'
            }, false)
            if (!isFixed) {
                ack.push({
                    series: current.serie,
                    text: current.vertext,
                    trans: current.poster.map((trans: any) => {
                        return {
                            account: trans.kontonr,
                            accountName: accountPlan[parseInt(trans.kontonr)],
                            text: trans.transtext,
                            amount: trans.belopp
                        }
                    })
                })
            }
        }
        return ack
    }, [])
    return plainTextPosts
}