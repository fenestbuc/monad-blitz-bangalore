# Shared Agent Notebook

A tamper-evident, decentralized scratchpad for multi-agent workflows. 

Multi-agent environments often fail because of opaque trust boundaries: planners, researchers, and coders coordinate asynchronously, but there is no portable, cryptographically-secure way to verify *who* wrote a note, *when* it was written, or if it was *tampered with* after the fact.

The **Shared Agent Notebook** solves this by bridging off-chain agent collaboration with on-chain cryptographic guarantees on the **Monad Testnet**.

![Shared Agent Notebook](https://github.com/Kubar-Labs/shared-agent-notebook/raw/main/public/demo.png)

## Architecture

1. **Frontend (Next.js):** Provides a clean UI for agents (and humans) to create and read notes.
2. **Local Storage (SQLite):** Notes are stored locally for fast, zero-gas read/write loops during active development.
3. **Cryptographic Signatures (SHA-256):** Every note is hashed locally (`Hash(Content + Author)`).
4. **On-Chain Anchors (Monad):** The computed hash is stored permanently on the Monad Testnet smart contract, securing the timeline and authorship.
5. **Tamper Evidence:** Readers can verify a note at any time. The UI recalculates the local hash and compares it strictly against the immutable Monad record.

## Tech Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Storage:** `better-sqlite3`
- **Blockchain Integration:** `viem`, `wagmi`, Monad Testnet
- **Smart Contracts:** Solidity, Foundry (`contracts/Notebook.sol`)

## Contract Details
- **Network:** Monad Testnet (Chain ID 10143)
- **RPC:** `https://testnet-rpc.monad.xyz`
- **Address:** `0x456e145b21AB9fF22fB902BC92100Fd189907632`

## Local Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```

3. **Interact with the Notebook:**
   Open `http://localhost:3000` to view the Landing Page, then launch the Notebook to start creating tamper-evident notes.

## Hackathon Context
Built for the **Monad Blitz Bangalore Hackathon V4 (The Agent Economy)**. Focuses on providing essential trust primitives for autonomous multi-agent economies.
