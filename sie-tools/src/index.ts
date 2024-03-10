import fsp from 'fs/promises'
import { createVerificationsWithPlainTextAccountNames, loadTransactionsFromFiles, writeSie } from "./Accounting";
import { getAccountingTemplates } from './Accounting/AccountingTemplates';

const main = async () => {
    const accountingTemplates = await getAccountingTemplates()
    const plainTextVerifications = await createVerificationsWithPlainTextAccountNames('../DiginetAktiebolag BF 2022.se')
    await fsp.writeFile('test.json', JSON.stringify(plainTextVerifications, undefined, 2))
    const transactions = await loadTransactionsFromFiles()
    writeSie('./output', transactions)
}

main()
