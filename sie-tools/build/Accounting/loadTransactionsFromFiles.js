"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVerificationsWithPlainTextAccountNames = exports.loadTransactionsFromFiles = exports.getSalaryVerifications = exports.getUpparbetatVerifications = exports.getTaxVerifications = exports.getKundfordringarVerifications = exports.getCardVerifications = exports.getRentVerifications = exports.getPrivatKontoVerifications = exports.getCustomerInvoiceVerifications = exports.getSebVerifications = exports.sieReadFileAsync = exports.parseCsvAsync = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const util_1 = __importDefault(require("util"));
const csv_1 = require("csv");
const sie_reader_1 = __importDefault(require("sie-reader"));
const GetAccountPlan_1 = require("./GetAccountPlan");
const AccountingTemplates_1 = require("./AccountingTemplates");
const Utils_1 = require("../Utils");
const read_excel_file_1 = __importDefault(require("read-excel-file"));
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
            if (template.code === 'lbetal') {
                const template = (0, AccountingTemplates_1.findTemplate)('lev-faktura');
                if (template) {
                    const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date: transaction[1], total: parseFloat(transaction[5]), customer: transaction[3] });
                    if (verification)
                        result.push(verification);
                }
            }
            const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date: transaction[1], total: parseFloat(transaction[5]) });
            if (verification)
                result.push(verification);
        }
    }
    return result;
};
exports.getSebVerifications = getSebVerifications;
const getCustomerInvoiceVerifications = async () => {
    let result = [];
    //let folder = '../customer-invoices/'
    let folder = 'C:/Diginet/Fakturor/';
    const files = await promises_1.default.readdir(folder);
    for (const file of files) {
        if (file.substring(0, 3) === '202' && file.indexOf('.xlsx') >= 0) {
            const buffer = await promises_1.default.readFile(folder + file);
            const contents = await (0, read_excel_file_1.default)(buffer);
            const invoice = contents[0][7];
            const date = contents[1][7];
            const startDate = new Date('2021-11-30');
            if (date.getTime() > startDate.getTime()) {
                let total = 0;
                for (let n = 0; n < contents.length; n++) {
                    const row = contents[n];
                    if (row[0] === 'Netto') {
                        total = contents[n + 1][0];
                        break;
                    }
                }
                const template = (0, AccountingTemplates_1.findTemplate)('kundfaktura');
                if (template) {
                    const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total, invoice });
                    if (verification)
                        result.push(verification);
                }
            }
        }
    }
    return result;
};
exports.getCustomerInvoiceVerifications = getCustomerInvoiceVerifications;
const getPrivatKontoVerifications = async () => {
    let result = [];
    const csv = await promises_1.default.readFile('../Privatkonto LF.csv', { encoding: 'utf-8' });
    const transactions = await (0, exports.parseCsvAsync)(csv, {
        comment: '#',
        quote: "'",
        delimiter: ';',
        relaxColumnCount: true,
    });
    for (let n = 0; n < transactions.length; n++) {
        const transaction = transactions[n];
        const date = (0, Utils_1.parseDateString)(transaction[0]);
        const total = -parseFloat(transaction[3]);
        const company = transaction[2];
        const template = (0, AccountingTemplates_1.findTemplate)('inköp privat');
        if (template) {
            const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total, seller: company });
            if (verification)
                result.push(verification);
        }
    }
    return result;
};
exports.getPrivatKontoVerifications = getPrivatKontoVerifications;
const getRentVerifications = async () => {
    let result = [];
    const csv = await promises_1.default.readFile('../hyrestransaktioner.csv', { encoding: 'utf-8' });
    const transactions = await (0, exports.parseCsvAsync)(csv, {
        comment: '#',
        delimiter: ','
    });
    for (let n = 0; n < transactions.length; n++) {
        const transaction = transactions[n];
        const date = (0, Utils_1.parseDateString)(transaction[0]);
        const total = -parseFloat(transaction[1]);
        const template = (0, AccountingTemplates_1.findTemplate)('lokalhyra');
        if (template) {
            const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total });
            if (verification)
                result.push(verification);
        }
    }
    return result;
};
exports.getRentVerifications = getRentVerifications;
const getCardVerifications = async () => {
    let result = [];
    const csv = await promises_1.default.readFile('../kort-transaktioner.txt', { encoding: 'utf-8' });
    const transactions = await (0, exports.parseCsvAsync)(csv, {
        comment: '#',
        delimiter: ',',
        relaxColumnCount: true,
    });
    for (let n = 0; n < transactions.length; n++) {
        const transaction = transactions[n];
        const date = (0, Utils_1.parseDateStringYYMMDD)(transaction[0]);
        const seller = transaction[1];
        const total = parseFloat(transaction[2]);
        const template = (0, AccountingTemplates_1.findTemplate)('kortköp');
        if (template) {
            const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total, seller });
            if (verification)
                result.push(verification);
        }
    }
    return result;
};
exports.getCardVerifications = getCardVerifications;
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
    for (let n = 0; n < transactions.length; n++) {
        const transaction = transactions[n];
        const date = (0, Utils_1.parseDateStringYYMMDD)(transaction[0]);
        const description = transaction[1];
        const total = parseFloat(transaction[2].replace(/\s/g, ''));
        if (description.indexOf('Förs.avgift') >= 0 || description.indexOf('Avgift för tillfälligt anstånd') >= 0) {
            const template = (0, AccountingTemplates_1.findTemplate)('förseningsavgift');
            if (template) {
                const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total });
                if (verification)
                    result.push(verification);
            }
        }
        else if (description.indexOf('Kostnadsränta') >= 0 || description.indexOf('Intäktsränta') >= 0) {
            const template = (0, AccountingTemplates_1.findTemplate)('ränta-skattekonto');
            if (template) {
                const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total });
                if (verification)
                    result.push(verification);
            }
        }
        else if (description.indexOf('Korrigerad') >= 0) {
            const template = (0, AccountingTemplates_1.findTemplate)('ränta-skattekonto');
            if (template) {
                const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total });
                if (verification)
                    result.push(verification);
            }
        }
        else if (description.indexOf('Debiterad preliminärskatt') >= 0) {
            const template = (0, AccountingTemplates_1.findTemplate)('f-skatt');
            if (template) {
                const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total });
                if (verification)
                    result.push(verification);
            }
        }
        else if (description.indexOf('Tillfälligt betalningsanstånd upphör') >= 0) {
            const template = (0, AccountingTemplates_1.findTemplate)('betalanst-upphör');
            if (template) {
                const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total });
                if (verification)
                    result.push(verification);
            }
        }
        else if (description.indexOf('Inbetalning bokförd') >= 0 || description.indexOf('Inbetalt till KFM') >= 0) {
            const template = (0, AccountingTemplates_1.findTemplate)('inbet-skattekonto');
            if (template) {
                const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total });
                if (verification)
                    result.push(verification);
            }
        }
        else if (description.indexOf('Arbetsgivaravgift') >= 0) {
            const template = (0, AccountingTemplates_1.findTemplate)('arbetsgivaravgift');
            if (template) {
                const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total, description });
                if (verification)
                    result.push(verification);
            }
        }
        else if (description.indexOf('Moms') === 0) {
            const template = (0, AccountingTemplates_1.findTemplate)('moms');
            if (template) {
                const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total, description });
                if (verification)
                    result.push(verification);
            }
        }
        else if (description.indexOf('Avdragen skatt') >= 0) {
            const template = (0, AccountingTemplates_1.findTemplate)('pskatt');
            if (template) {
                const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total, description });
                if (verification)
                    result.push(verification);
            }
        }
        else if (description.indexOf('Beslut') >= 0) {
            const template = (0, AccountingTemplates_1.findTemplate)(description.indexOf('arbetsgivaravgift') ? 'arbetsgivaravgift' : 'pskatt');
            if (template) {
                const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total, description });
                if (verification)
                    result.push(verification);
            }
        }
        else if (description.indexOf('Återredovisad nedsättning') >= 0) {
            const template = (0, AccountingTemplates_1.findTemplate)('arbetsgivaravgift');
            if (template) {
                const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total, description });
                if (verification)
                    result.push(verification);
            }
        }
    }
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
    for (let n = 0; n < transactions.length; n++) {
        const transaction = transactions[n];
        const date = (0, Utils_1.parseDateString)(transaction[0]);
        const total = parseFloat(transaction[1]);
        const description = transaction[2];
        const template = (0, AccountingTemplates_1.findTemplate)('upplupet-arbete');
        if (template) {
            const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, total, description });
            if (verification)
                result.push(verification);
        }
    }
    return result;
};
exports.getUpparbetatVerifications = getUpparbetatVerifications;
const getSalaryVerifications = async () => {
    let result = [];
    //let folder = '../customer-invoices/'
    let folder = 'C:/Diginet/Lön/';
    const files = await promises_1.default.readdir(folder);
    for (const file of files) {
        if (file.substring(0, 3) === '202' && file.indexOf('.xlsx') >= 0) {
            const buffer = await promises_1.default.readFile(folder + file);
            const contents = await (0, read_excel_file_1.default)(buffer);
            const date = contents[3][1];
            const startDate = new Date('2021-11-30');
            if (date.getTime() > startDate.getTime()) {
                let brutto = 0;
                for (let n = 0; n < contents.length; n++) {
                    const row = contents[n];
                    if (row[0] === 'Bruttolön') {
                        brutto = contents[n][1];
                        //brutto += contents[n + 1][1] as never as number
                        break;
                    }
                }
                for (let n = 0; n < contents.length; n++) {
                    const row = contents[n];
                    if (row[0] === 'Retroaktiv lön') {
                        brutto += contents[n][1];
                        break;
                    }
                }
                brutto = Math.round(brutto);
                let pskatt = 0;
                for (let n = 0; n < contents.length; n++) {
                    const row = contents[n];
                    if (row[0] && row[0].toString().indexOf('Skatteavdrag') >= 0) {
                        pskatt += contents[n][1];
                    }
                }
                pskatt = Math.round(pskatt);
                let regleringSkuld = 0;
                for (let n = 0; n < contents.length; n++) {
                    const row = contents[n];
                    if (row[0] && row[0].toString().indexOf('Reglering') >= 0) {
                        regleringSkuld += contents[n][1];
                    }
                }
                let netto = 0;
                for (let n = 0; n < contents.length; n++) {
                    const row = contents[n];
                    if (row[0] === 'Netto') {
                        netto += contents[n][1];
                        break;
                    }
                }
                netto = Math.round(netto);
                const template = (0, AccountingTemplates_1.findTemplate)('salary');
                if (template) {
                    const verification = (0, AccountingTemplates_1.executeTemplate)(template, { date, brutto, pskatt, netto, regleringSkuld });
                    if (verification)
                        result.push(verification);
                }
            }
        }
    }
    return result;
};
exports.getSalaryVerifications = getSalaryVerifications;
const loadTransactionsFromFiles = async () => {
    let result = [];
    result = result.concat(await (0, exports.getSebVerifications)());
    result = result.concat(await (0, exports.getPrivatKontoVerifications)());
    result = result.concat(await (0, exports.getUpparbetatVerifications)());
    result = result.concat(await (0, exports.getTaxVerifications)());
    result = result.concat(await (0, exports.getRentVerifications)());
    result = result.concat(await (0, exports.getCardVerifications)());
    result = result.concat(await (0, exports.getSalaryVerifications)());
    result = result.concat(await (0, exports.getKundfordringarVerifications)());
    result = result.concat(await (0, exports.getCustomerInvoiceVerifications)());
    result = result.sort((a, b) => {
        return a.date.getTime() - b.date.getTime();
    });
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