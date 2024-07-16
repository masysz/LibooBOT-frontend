
// 500 friends
// 1,500,000 and 0.5 TON

// 1000 friends
// 3,000,000 and 1 TON

interface ReferralMetricsProps {
    friends: number,
    bonus: number,
    tonBonus?: number
}

export const referralMetrics: ReferralMetricsProps[] = [
    {
        friends: 3,
        bonus: 5000
    },
    {
        friends: 5,
        bonus: 10000
    },
    {
        friends: 20,
        bonus: 50000
    },
    {
        friends: 50,
        bonus: 140000
    },
    {
        friends: 100,
        bonus: 300000
    },
    {
        friends: 200,
        bonus: 700000
    },
    {
        friends: 500,
        bonus: 1500000,
        tonBonus: 0.5
    },
    {
        friends: 1000,
        bonus: 3000000,
        tonBonus: 1
    }
]