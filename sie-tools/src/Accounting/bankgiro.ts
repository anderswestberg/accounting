import { parse } from 'node-html-parser'
import fetch from 'node-fetch'

export const getBankgiroName = async (bankgiro: string) => {
    let result = ''
    const reply = await fetch(`https://www.bankgirot.se/sok-bankgironummer/?bgnr=${ bankgiro }&orgnr=&company=&city=#bgsearchform`)
    const text: string = await reply.text()
    const pos = text.indexOf('title meta')
    if (pos >= 0) {
        let endPos = text.substring(pos).indexOf('</h3>')
        result = text.substring(pos + 12, pos + endPos)
        result = result.trim()
        if (result == 'DIGINET AKTIEBOLAG I LIKVIDATION')
            result = 'DIGINET AKTIEBOLAG'
    }
    return result
}
