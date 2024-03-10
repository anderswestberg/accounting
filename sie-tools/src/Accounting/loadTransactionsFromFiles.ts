import fsp from 'fs/promises'
import util from 'util'
import { Verification, getBankgiroName, writeSie } from '.'
import { parse as parseCsv } from 'csv'
import sie from 'sie-reader'
import { getAccountPlan } from './GetAccountPlan'

export const parseCsvAsync = util.promisify<string, any, any>(parseCsv)
export const sieReadFileAsync = util.promisify<string, any>(sie.readFile)

export const getSebVerifications = async () => {
    let result: Verification[] = []
    const csv = await fsp.readFile('../Kontoutdrag SEB.csv', { encoding: 'utf-8' })
    const transactions = await parseCsvAsync(csv, {
        comment: '#',
        delimiter: '\t'
    })
    
    return result
}

export const getCustomerInvoiceVerifications = async () => {
    let result: Verification[] = []
    let folder = '../customer-invoices/'
    const files = await fsp.readdir(folder)
    for (const file of files) {
        const invoice = JSON.parse(await fsp.readFile(folder + file, { encoding: 'utf-8' }))
        console.log(invoice)
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


export const getLfVerifications = async () => {
    let result: Verification[] = []
    const csv = await fsp.readFile('../Privatkonto LF.csv', { encoding: 'utf-8' })
    const transactions = await parseCsvAsync(csv, {
        comment: '#',
        quote: "'",
        delimiter: ';'
    })
    return result
}

export const getRentVerifications = async () => {
    let result: Verification[] = []
    const csv = await fsp.readFile('../hyrestransaktioner.csv', { encoding: 'utf-8' })
    const transactions = await parseCsvAsync(csv, {
        comment: '#',
        delimiter: ','
    })
    return result
}

export const getSalaryVerifications = async () => {
    let result: Verification[] = []
    const csv = await fsp.readFile('../lönetransaktioner.csv', { encoding: 'utf-8' })
    const transactions = await parseCsvAsync(csv, {
        comment: '#',
        delimiter: ','
    })
    return result
}

export const loadTransactionsFromFiles = async () => {
    let result: Verification[] = []

    result = result.concat(await getSebVerifications())
    const lfVerifications = await getLfVerifications()
    const taxVerifications = await getTaxVerifications()
    const rentVerifications = await getRentVerifications()
    const upparbetatVerifications = await getUpparbetatVerifications()
    const salaryVerifications = await getSalaryVerifications()
    const kundfordringarVerifications = await getKundfordringarVerifications()
    const customerInvoiceVerifications = await getCustomerInvoiceVerifications()

    // Generate SIE output
    const verifications: Verification[] = []
    writeSie('test.se', verifications)
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