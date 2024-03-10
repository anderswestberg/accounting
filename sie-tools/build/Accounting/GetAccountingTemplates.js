"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountingTemplates = void 0;
const promises_1 = __importDefault(require("fs/promises"));
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
};
const getAccountingTemplates = async () => {
    const accountingTemplates = JSON.parse(await promises_1.default.readFile('./AccountingTemplates.json', { encoding: 'utf-8' }));
    return accountingTemplates;
};
exports.getAccountingTemplates = getAccountingTemplates;
//# sourceMappingURL=GetAccountingTemplates.js.map