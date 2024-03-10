"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const Accounting_1 = require("./Accounting");
const AccountingTemplates_1 = require("./Accounting/AccountingTemplates");
const main = async () => {
    const accountingTemplates = await (0, AccountingTemplates_1.getAccountingTemplates)();
    const plainTextVerifications = await (0, Accounting_1.createVerificationsWithPlainTextAccountNames)('../DiginetAktiebolag BF 2022.se');
    await promises_1.default.writeFile('test.json', JSON.stringify(plainTextVerifications, undefined, 2));
    const transactions = await (0, Accounting_1.loadTransactionsFromFiles)();
    (0, Accounting_1.writeSie)('./output', transactions);
};
main();
//# sourceMappingURL=index.js.map