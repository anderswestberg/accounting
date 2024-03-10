"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const Accounting_1 = require("./Accounting");
const GetAccountingTemplates_1 = require("./Accounting/GetAccountingTemplates");
const main = async () => {
    const accountingTemplates = await (0, GetAccountingTemplates_1.getAccountingTemplates)();
    const plainTextVerifications = await (0, Accounting_1.createVerificationsWithPlainTextAccountNames)('../DiginetAktiebolag BF 2022.se');
    await promises_1.default.writeFile('test.json', JSON.stringify(plainTextVerifications, undefined, 2));
    (0, Accounting_1.loadTransactionsFromFiles)();
};
main();
//# sourceMappingURL=index.js.map