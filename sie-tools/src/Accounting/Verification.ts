export interface VerificationItem {
    description: string
    account: number
    amount: number
}

export interface Verification {
    type: string
    date: Date
    dateEntered: Date
    items: VerificationItem[]
}

