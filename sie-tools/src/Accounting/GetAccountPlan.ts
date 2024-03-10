import { sieReadFileAsync } from "./loadTransactionsFromFiles"

export const getAccountPlan = async () => {
    const sieObject = await sieReadFileAsync('./AccountPlan.se')
    const accountPlan: { [index: number]: string } = sieObject.poster.reduce((ack: { [index: number]: string }, current: any) => {
        if (current.etikett === 'konto') {
            ack[parseInt(current.kontonr)] = current.kontonamn
        }
        return ack
    }, {})
    return accountPlan
}