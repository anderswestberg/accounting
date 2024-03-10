import fsp from 'fs/promises'
import { createVerificationsWithPlainTextAccountNames, loadTransactionsFromFiles } from "./Accounting";
import { getAccountingTemplates } from './Accounting/GetAccountingTemplates';

const main = async () => {
    const accountingTemplates = await getAccountingTemplates()
    const plainTextVerifications = await createVerificationsWithPlainTextAccountNames('../DiginetAktiebolag BF 2022.se')
    await fsp.writeFile('test.json', JSON.stringify(plainTextVerifications, undefined, 2))
    loadTransactionsFromFiles()
}

main()
