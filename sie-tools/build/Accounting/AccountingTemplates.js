"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTemplate = exports.findTemplate = exports.getAccountingTemplates = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const evaluateExpression_1 = require("../evaluateExpression");
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
        type: template.voucherSeries,
        date: data.date,
        description: (0, evaluateExpression_1.substitueArgument)(template.description, data),
        dateEntered: data.date,
        items: []
    };
    for (let n = 0; n < template.rows.length; n++) {
        const tRow = template.rows[n];
        const item = {
            description: '',
            account: tRow.account,
            amount: (0, evaluateExpression_1.evaluateExpression)(tRow.formula, data)
        };
        verification.items.push(item);
    }
    return verification;
};
exports.executeTemplate = executeTemplate;
//# sourceMappingURL=AccountingTemplates.js.map