"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBankgiroName = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const getBankgiroName = async (bankgiro) => {
    let result = '';
    const reply = await (0, node_fetch_1.default)(`https://www.bankgirot.se/sok-bankgironummer/?bgnr=${bankgiro}&orgnr=&company=&city=#bgsearchform`);
    const text = await reply.text();
    const pos = text.indexOf('title meta');
    if (pos >= 0) {
        let endPos = text.substring(pos).indexOf('</h3>');
        result = text.substring(pos + 12, pos + endPos);
        result = result.trim();
        if (result == 'DIGINET AKTIEBOLAG I LIKVIDATION')
            result = 'DIGINET AKTIEBOLAG';
    }
    return result;
};
exports.getBankgiroName = getBankgiroName;
//# sourceMappingURL=bankgiro.js.map