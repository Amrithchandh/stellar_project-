#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    LoanAmount(Address),
    RepaidAmount(Address),
    MissedPayments(Address),
    RepaymentRate(Address),
}

#[contract]
pub struct CreditPool;

#[contractimpl]
impl CreditPool {
    // Initialize Admin
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    // Fronts the asset immediately to the borrower (buy-now-pay-later)
    pub fn pool_lend(env: Env, borrower: Address, amount: i128, daily_rate: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        env.storage().instance().set(&DataKey::LoanAmount(borrower.clone()), &amount);
        env.storage().instance().set(&DataKey::RepaidAmount(borrower.clone()), &0i128);
        env.storage().instance().set(&DataKey::RepaymentRate(borrower.clone()), &daily_rate);
        env.storage().instance().set(&DataKey::MissedPayments(borrower.clone()), &0u32);
    }

    // Split stream contribution: route saving slice to repayment first
    pub fn collect_repayment(env: Env, borrower: Address, amount: i128) -> i128 {
        let loan = env.storage().instance().get(&DataKey::LoanAmount(borrower.clone())).unwrap_or(0i128);
        let repaid = env.storage().instance().get(&DataKey::RepaidAmount(borrower.clone())).unwrap_or(0i128);

        if loan == 0 || repaid >= loan {
            return amount; // return full amount to go to savings as debt is fully paid
        }

        let remaining = loan - repaid;
        let payment = Math_min(amount, remaining);

        env.storage().instance().set(&DataKey::RepaidAmount(borrower.clone()), &(repaid + payment));

        // Return whatever is left after repayment to flow to normal savings
        amount - payment
    }

    // Default Handling: If 3 consecutive weekly payments are missed, redirect goals allocation
    pub fn report_missed_payment(env: Env, borrower: Address) -> bool {
        let missed: u32 = env.storage().instance().get(&DataKey::MissedPayments(borrower.clone())).unwrap_or(0);
        let updated = missed + 1;
        env.storage().instance().set(&DataKey::MissedPayments(borrower.clone()), &updated);

        // If 3 consecutive missed, return true to trigger Goal allocation redirection (non-slashing)
        updated >= 3
    }

    // Reset missed counter on successful payments
    pub fn reset_missed_payments(env: Env, borrower: Address) {
        env.storage().instance().set(&DataKey::MissedPayments(borrower.clone()), &0u32);
    }
}

// Simple helper
fn Math_min(a: i128, b: i128) -> i128 {
    if a < b { a } else { b }
}
