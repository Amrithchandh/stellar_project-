#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Map, Symbol};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Employer,
    Worker,
    StreamRate,
    StreamStart,
    LastCheckpoint,
    VaultAllocations, // Map<Symbol, u32>
    VaultBalances,    // Map<Symbol, i128>
}

#[contract]
pub struct StreamVault;

#[contractimpl]
impl StreamVault {
    // Initialize the stream with employer, worker, and rate (in stroops/second)
    pub fn initialize(env: Env, employer: Address, worker: Address, rate: i128) {
        if env.storage().instance().has(&DataKey::Employer) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Employer, &employer);
        env.storage().instance().set(&DataKey::Worker, &worker);
        env.storage().instance().set(&DataKey::StreamRate, &rate);
        env.storage().instance().set(&DataKey::StreamStart, &env.ledger().timestamp());
        env.storage().instance().set(&DataKey::LastCheckpoint, &env.ledger().timestamp());

        // Initialize empty allocations: Spending (50%), Savings (20%), Goals (20%), Bills (10%)
        let mut allocations: Map<Symbol, u32> = Map::new(&env);
        allocations.set(symbol_short!("spend"), 50);
        allocations.set(symbol_short!("save"), 20);
        allocations.set(symbol_short!("goal"), 20);
        allocations.set(symbol_short!("bill"), 10);
        env.storage().instance().set(&DataKey::VaultAllocations, &allocations);

        // Initialize vault balances
        let mut balances: Map<Symbol, i128> = Map::new(&env);
        balances.set(symbol_short!("spend"), 0);
        balances.set(symbol_short!("save"), 0);
        balances.set(symbol_short!("goal"), 0);
        balances.set(symbol_short!("bill"), 0);
        env.storage().instance().set(&DataKey::VaultBalances, &balances);
    }

    // Fund the stream (only callable by employer)
    pub fn fund_stream(env: Env, amount: i128) {
        let employer: Address = env.storage().instance().get(&DataKey::Employer).unwrap();
        employer.require_auth();

        // Update accrued balances up to now before modifying state
        Self::checkpoint_accrual(&env);

        // Mock transferring tokens into the contract (or adding to stream capacity)
        // In a real Soroban contract, we would use token::Client to transfer XLM/USDC
    }

    // Withdraw from a specific vault (only callable by worker)
    pub fn withdraw_from_vault(env: Env, vault_id: Symbol, amount: i128) {
        let worker: Address = env.storage().instance().get(&DataKey::Worker).unwrap();
        worker.require_auth();

        Self::checkpoint_accrual(&env);

        let mut balances: Map<Symbol, i128> = env.storage().instance().get(&DataKey::VaultBalances).unwrap();
        let balance = balances.get(vault_id.clone()).unwrap_or(0);
        
        if balance < amount {
            panic!("Insufficient vault balance");
        }

        balances.set(vault_id, balance - amount);
        env.storage().instance().set(&DataKey::VaultBalances, &balances);

        // Mock token transfer to worker address
    }

    // Update vault allocations (callable by worker to adjust preferences)
    pub fn update_allocation(env: Env, vault_id: Symbol, new_pct: u32) {
        let worker: Address = env.storage().instance().get(&DataKey::Worker).unwrap();
        worker.require_auth();

        Self::checkpoint_accrual(&env);

        let mut allocations: Map<Symbol, u32> = env.storage().instance().get(&DataKey::VaultAllocations).unwrap();
        allocations.set(vault_id, new_pct);

        // Verify total sum is exactly 100%
        let mut sum: u32 = 0;
        for val in allocations.values() {
            sum += val;
        }
        if sum != 100 {
            panic!("Allocations must sum to 100%");
        }

        env.storage().instance().set(&DataKey::VaultAllocations, &allocations);
    }

    // Get current accrued balance (calculates rate * elapsed seconds since last checkpoint)
    pub fn get_accrued_balance(env: Env) -> i128 {
        let rate: i128 = env.storage().instance().get(&DataKey::StreamRate).unwrap_or(0);
        let last_checkpoint: u64 = env.storage().instance().get(&DataKey::LastCheckpoint).unwrap_or(0);
        let now = env.ledger().timestamp();
        
        if now <= last_checkpoint {
            return 0;
        }

        let elapsed = (now - last_checkpoint) as i128;
        rate * elapsed
    }

    // Internal helper to apply accruals based on elapsed time
    fn checkpoint_accrual(env: &Env) {
        let accrued = Self::get_accrued_balance(env.clone());
        if accrued == 0 {
            return;
        }

        let allocations: Map<Symbol, u32> = env.storage().instance().get(&DataKey::VaultAllocations).unwrap();
        let mut balances: Map<Symbol, i128> = env.storage().instance().get(&DataKey::VaultBalances).unwrap();

        for (vault_id, pct) in allocations.iter() {
            let current = balances.get(vault_id.clone()).unwrap_or(0);
            let share = (accrued * (pct as i128)) / 100;
            balances.set(vault_id, current + share);
        }

        env.storage().instance().set(&DataKey::VaultBalances, &balances);
        env.storage().instance().set(&DataKey::LastCheckpoint, &env.ledger().timestamp());
    }
}
