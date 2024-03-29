"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTemplate = exports.findTemplate = exports.getAccountingTemplates = void 0;
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
let accountingTemplates;
const getAccountingTemplates = async () => {
    accountingTemplates = JSON.parse(await promises_1.default.readFile('./AccountingTemplates.json', { encoding: 'utf-8' }));
    return accountingTemplates;
};
exports.getAccountingTemplates = getAccountingTemplates;
const findTemplate = (templateCode) => {
    let result;
    if (accountingTemplates) {
        for (let template of accountingTemplates) {
            if (template.code === templateCode)
                result = template;
        }
    }
    return result;
};
exports.findTemplate = findTemplate;
const executeTemplate = (template, data) => {
    let verification;
    verification = {
        date: data.date,
        dateEntered: data.date,
        type: template.voucherSeries,
        items: []
    };
    for (let n = 0; n < template.rows.length; n++) {
        const item = ;
    }
    return verification;
};
exports.executeTemplate = executeTemplate;
//# sourceMappingURL=GetAccountingTemplates.js.map