#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    UserAddress,
    TargetAsset,
    GoalAmount,
    AccumulatedAmount, // fiat cash waiting to convert
    AccumulatedAsset,  // target assets bought (e.g. gold grams / tokens)
    LastConversion,    // timestamp
    OracleContract,    // Address of Reflector Oracle
}

// Minimal Reflector Oracle Interface for cross-contract calls
pub struct OracleClient;
impl OracleClient {
    pub fn get_price(env: &Env, oracle: &Address, asset: &Symbol) -> (i128, u64) {
        // Mock cross-contract call to Reflector Oracle
        // Returns (price_in_stroops, timestamp_seconds)
        // In real contract, we do: env.invoke_contract(oracle, ...)
        (6500, env.ledger().timestamp())
      }
}

#[contract]
pub struct SaveVault;

#[contractimpl]
impl SaveVault {
    // Initialize the SaveVault
    pub fn initialize(env: Env, user: Address, oracle: Address, asset: Symbol, goal: i128) {
        if env.storage().instance().has(&DataKey::UserAddress) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::UserAddress, &user);
        env.storage().instance().set(&DataKey::OracleContract, &oracle);
        env.storage().instance().set(&DataKey::TargetAsset, &asset);
        env.storage().instance().set(&DataKey::GoalAmount, &goal);
        env.storage().instance().set(&DataKey::AccumulatedAmount, &0i128);
        env.storage().instance().set(&DataKey::AccumulatedAsset, &0i128);
        env.storage().instance().set(&DataKey::LastConversion, &0u64);
    }

    // Accepts deposits from StreamVault
    pub fn deposit(env: Env, amount: i128) {
        let current_accumulated: i128 = env.storage().instance().get(&DataKey::AccumulatedAmount).unwrap_or(0);
        env.storage().instance().set(&DataKey::AccumulatedAmount, &(current_accumulated + amount));
    }

    // Triggers the weekly DCA conversion at the Reflector price
    pub fn trigger_dca_conversion(env: Env) {
        let accumulated_fiat: i128 = env.storage().instance().get(&DataKey::AccumulatedAmount).unwrap_or(0);
        if accumulated_fiat <= 0 {
            panic!("No savings to convert");
        }

        let oracle_addr: Address = env.storage().instance().get(&DataKey::OracleContract).unwrap();
        let target_asset: Symbol = env.storage().instance().get(&DataKey::TargetAsset).unwrap();

        // Fetch price and timestamp from Reflector Oracle
        let (price, price_timestamp) = OracleClient::get_price(&env, &oracle_addr, &target_asset);
        let now = env.ledger().timestamp();

        // Oracle Fallback: Check if price feed is stale (older than 1 hour / 3600 seconds)
        if now - price_timestamp > 3600 {
            panic!("Reflector oracle price is stale. Conversion rejected.");
        }

        // Convert cash to asset: assetAmount = fiatAmount / price
        // Assuming values scaled in stroops (decimal handling)
        let asset_bought = (accumulated_fiat * 10_000_000) / price;

        let current_asset: i128 = env.storage().instance().get(&DataKey::AccumulatedAsset).unwrap_or(0);
        
        env.storage().instance().set(&DataKey::AccumulatedAsset, &(current_asset + asset_bought));
        env.storage().instance().set(&DataKey::AccumulatedAmount, &0i128);
        env.storage().instance().set(&DataKey::LastConversion, &now);
    }

    // Set a new savings goal
    pub fn set_goal(env: Env, asset: Symbol, target_amount: i128) {
        let user: Address = env.storage().instance().get(&DataKey::UserAddress).unwrap();
        user.require_auth();

        env.storage().instance().set(&DataKey::TargetAsset, &asset);
        env.storage().instance().set(&DataKey::GoalAmount, &target_amount);
    }

    // Get goal progress metrics
    pub fn get_goal_progress(env: Env) -> (i128, i128) {
        let accumulated: i128 = env.storage().instance().get(&DataKey::AccumulatedAsset).unwrap_or(0);
        let goal: i128 = env.storage().instance().get(&DataKey::GoalAmount).unwrap_or(0);
        (accumulated, goal)
    }
}
