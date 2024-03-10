export interface VerificationItem {
    description: string
    account: number
    amount: number
}

export interface Verification {
    type: string
    date: Date
    description: string
    dateEntered: Date
    items: VerificationItem[]
}

