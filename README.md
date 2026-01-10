# Nudge: UPI Payment Simulation (Behavioral Study Prototype) 🌱

A high-fidelity UPI payment simulation app designed for behavioral research, focusing on **Mindful Spending** and **Savings Reinforcement**.

## 🍃 Research Features

This prototype embeds several behavioral nudges and friction points:

1. **Calming Green Theme**: A refreshing visual identity designed to reduce spending anxiety and reinforce a sense of "refreshing" savings.
2. **Emergency Buffer Progress**: A prominent progress bar on the dashboard that tracks savings milestones (25%, 50%, 75%, 100%).
3. **Intentional UX Friction**:
   * **Savings Wallet Delay**: A 2.5-second artificial delay when paying from the 'Savings' wallet to encourage reflection.
   * **Intent Reflection**: A mandatory step asking *"Do I really need to buy?"* before payment.
4. **Transaction Failure Simulation**: A 10% chance of payment failure to provide an extra "stop-and-think" moment.
5. **Visual Loss Concretization**: 100 green units represent the total balance; they turn grey as you spend, making the "loss" felt.

## 🚀 Tech Stack

- **React + Vite**
- **Vanilla CSS** (Custom Design System)
- **Lucide React** (Icons)
- **GitHub Pages** (Deployment)

## 🛠️ Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Amrithchandh/nudgebackup.git
```
2. Install dependencies:
```bash
npm install
```
3. Run locally:
```bash
npm run dev
```

## 📋 Study Instructions
- **Default PIN**: `123456`
- **Wallets**: Leisure, Savings, Goals, Bills.
- **Goal**: Observe how friction and visual reinforcement affect spending choices.

---
*Created for the January Behavioral Validation Study.*
