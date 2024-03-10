"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVerificationsWithPlainTextAccountNames = exports.loadTransactionsFromFiles = exports.getSalaryVerifications = exports.getRentVerifications = exports.getLfVerifications = exports.getUpparbetatVerifications = exports.getTaxVerifications = exports.getKundfordringarVerifications = exports.getCustomerInvoiceVerifications = exports.getSebVerifications = exports.sieReadFileAsync = exports.parseCsvAsync = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const util_1 = __importDefault(require("util"));
const csv_1 = require("csv");
const sie_reader_1 = __importDefault(require("sie-reader"));
const GetAccountPlan_1 = require("./GetAccountPlan");
const AccountingTemplates_1 = require("./AccountingTemplates");
const Utils_1 = require("../Utils");
exports.parseCsvAsync = util_1.default.promisify(csv_1.parse);
exports.sieReadFileAsync = util_1.default.promisify(sie_reader_1.default.readFile);
const getSebVerifications = async () => {
    let result = [];
    const csv = await promises_1.default.readFile('../Kontoutdrag SEB.csv', { encoding: 'utf-8' });
    const transactions = await (0, exports.parseCsvAsync)(csv, {
        comment: '#',
        delimiter: '\t'
    });
    for (let n = 1; n < transactions.length; n++) {
        const transaction = transactions[n];
        transaction[1] = (0, Utils_1.parseDateString)(transaction[1]);
        const template = (0, AccountingTemplates_1.findTemplate)(transaction[0]);
        if (template) {
            const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date: transaction[1], total: -parseFloat(transaction[5]) });
            if (verification)
                result.push(verification);
        }
    }
    return result;
};
exports.getSebVerifications = getSebVerifications;
const getCustomerInvoiceVerifications = async () => {
    let result = [];
    let folder = '../customer-invoices/';
    const files = await promises_1.default.readdir(folder);
    for (const file of files) {
        const invoice = JSON.parse(await promises_1.default.readFile(folder + file, { encoding: 'utf-8' }));
    }
    return result;
};
exports.getCustomerInvoiceVerifications = getCustomerInvoiceVerifications;
const getKundfordringarVerifications = async () => {
    let result = [];
    const csv = await promises_1.default.readFile('../kundfordringartransaktioner.csv', { encoding: 'utf-8' });
    const transactions = await (0, exports.parseCsvAsync)(csv, {
        comment: '#',
        delimiter: ','
    });
    return result;
};
exports.getKundfordringarVerifications = getKundfordringarVerifications;
const getTaxVerifications = async () => {
    let result = [];
    const csv = await promises_1.default.readFile('../skatt transaktioner.txt', { encoding: 'utf-8' });
    const transactions = await (0, exports.parseCsvAsync)(csv, {
        comment: '#',
        delimiter: ',',
        relax_column_count: true,
    });
    return result;
};
exports.getTaxVerifications = getTaxVerifications;
const getUpparbetatVerifications = async () => {
    // Bokför på 1790 upplupna intäkter resp 1510 kundfordringar
    let result = [];
    const csv = await promises_1.default.readFile('../upparbetattransaktioner.csv', { encoding: 'utf-8' });
    const transactions = await (0, exports.parseCsvAsync)(csv, {
        comment: '#',
        delimiter: ','
    });
    return result;
};
exports.getUpparbetatVerifications = getUpparbetatVerifications;
const getLfVerifications = async () => {
    let result = [];
    const csv = await promises_1.default.readFile('../Privatkonto LF.csv', { encoding: 'utf-8' });
    const transactions = await (0, exports.parseCsvAsync)(csv, {
        comment: '#',
        quote: "'",
        delimiter: ';'
    });
    return result;
};
exports.getLfVerifications = getLfVerifications;
const getRentVerifications = async () => {
    let result = [];
    const csv = await promises_1.default.readFile('../hyrestransaktioner.csv', { encoding: 'utf-8' });
    const transactions = await (0, exports.parseCsvAsync)(csv, {
        comment: '#',
        delimiter: ','
    });
    return result;
};
exports.getRentVerifications = getRentVerifications;
const getSalaryVerifications = async () => {
    let result = [];
    const csv = await promises_1.default.readFile('../lönetransaktioner.csv', { encoding: 'utf-8' });
    const transactions = await (0, exports.parseCsvAsync)(csv, {
        comment: '#',
        delimiter: ','
    });
    return result;
};
exports.getSalaryVerifications = getSalaryVerifications;
const loadTransactionsFromFiles = async () => {
    let result = [];
    result = result.concat(await (0, exports.getSebVerifications)());
    const lfVerifications = await (0, exports.getLfVerifications)();
    const taxVerifications = await (0, exports.getTaxVerifications)();
    const rentVerifications = await (0, exports.getRentVerifications)();
    const upparbetatVerifications = await (0, exports.getUpparbetatVerifications)();
    const salaryVerifications = await (0, exports.getSalaryVerifications)();
    const kundfordringarVerifications = await (0, exports.getKundfordringarVerifications)();
    const customerInvoiceVerifications = await (0, exports.getCustomerInvoiceVerifications)();
    // Generate SIE output
    const verifications = [];
    return result;
};
exports.loadTransactionsFromFiles = loadTransactionsFromFiles;
const createVerificationsWithPlainTextAccountNames = async (fileName) => {
    const sieObject = await (0, exports.sieReadFileAsync)(fileName);
    const accountPlan = await (0, GetAccountPlan_1.getAccountPlan)();
    const plainTextPosts = sieObject.poster.reduce((ack, current) => {
        if (current.etikett === 'ver') {
            const isFixed = current.poster.reduce((ack, trans) => {
                return ack || trans.etikett === 'rtrans' || trans.etikett === 'btrans';
            }, false);
            if (!isFixed) {
                ack.push({
                    series: current.serie,
                    text: current.vertext,
                    trans: current.poster.map((trans) => {
                        return {
                            account: trans.kontonr,
                            accountName: accountPlan[parseInt(trans.kontonr)],
                            text: trans.transtext,
                            amount: trans.belopp
                        };
                    })
                });
            }
        }
        return ack;
    }, []);
    return plainTextPosts;
};
exports.createVerificationsWithPlainTextAccountNames = createVerificationsWithPlainTextAccountNames;
//# sourceMappingURL=loadTransactionsFromFiles.js.map