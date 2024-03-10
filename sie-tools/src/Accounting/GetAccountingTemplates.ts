import fsp from 'fs/promises'

export type AccountingTemplate = typeof example

 const example = {
    "code": "9",
    "description": "Betalning av F-skatt uppbokad mot skattekonto",
    "dateField": "Datum",
    "rows": [
        {
            "account": 1930,
            "transactionInformation": "",
            "formula": "-{$total}"
        },
        {
            "account": 1630,
            "transactionInformation": "",
            "formula": "{$total}"
        }
    ],
    "voucherSeries": "A",
    "voucherDescription": "F-skatt"
}

export const getAccountingTemplates = async () => {
    const accountingTemplates: AccountingTemplate[] = JSON.parse(await fsp.readFile('./AccountingTemplates.json', { encoding: 'utf-8' }))
    return accountingTemplates
}

