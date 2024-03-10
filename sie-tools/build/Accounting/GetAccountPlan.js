"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountPlan = void 0;
const loadTransactionsFromFiles_1 = require("./loadTransactionsFromFiles");
const getAccountPlan = async () => {
    const sieObject = await (0, loadTransactionsFromFiles_1.sieReadFileAsync)('./AccountPlan.se');
    const accountPlan = sieObject.poster.reduce((ack, current) => {
        if (current.etikett === 'konto') {
            ack[parseInt(current.kontonr)] = current.kontonamn;
        }
        return ack;
    }, {});
    return accountPlan;
};
exports.getAccountPlan = getAccountPlan;
//# sourceMappingURL=GetAccountPlan.js.map