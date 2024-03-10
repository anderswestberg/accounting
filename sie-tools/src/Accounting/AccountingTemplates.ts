import { Verify } from 'crypto'
import fsp from 'fs/promises'
import { Verification, VerificationItem } from './Verification'
import { evaluateExpression, substitueArgument } from '../evaluateExpression'

export type AccountingTemplate = {
    code: string
    description: string
    dateField: string
    rows: AccountingTemplateItem[]
    voucherSeries: string
    voucherDescription: string
}

export type AccountingTemplateItem = {
    account: number
    transactionInformation: string
    formula: string
}


export type AccountingTemplateData = {
    date: Date
    [index: string]: any
}

let accountingTemplates: AccountingTemplate[]

export const getAccountingTemplates = async () => {
    accountingTemplates = JSON.parse(await fsp.readFile('./AccountingTemplates.json', { encoding: 'utf-8' }))
    return accountingTemplates
}

export const findTemplate = (templateCode: string) => {
    let result: AccountingTemplate | undefined
    if (accountingTemplates) {
        for (let template of accountingTemplates) {
            if (template.code === templateCode)
                result = template
        }
    }
    return result
}

export const executeTemplate = (template: AccountingTemplate, data: AccountingTemplateData) => {
    let verification: Verification
    verification = {
        type: template.voucherSeries,
        date: data.date,
        description: substitueArgument(template.description, data),
        dateEntered: data.date,
        items: []
    }
    for (let n = 0; n < template.rows.length; n++) {
        const tRow = template.rows[n]
        const item: VerificationItem = {
            description: '',
            account: tRow.account,
            amount: evaluateExpression(tRow.formula, data)
        }
        verification.items.push(item)
    }
    return verification
}