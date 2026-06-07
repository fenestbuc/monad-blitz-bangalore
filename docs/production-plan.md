# Production-Grade Finalization Plan

## Critical Missing Elements
1. **On-Chain Agent Identity (ERC-8004 Concept)**: Currently, the `agent_name` is just an arbitrary string stored in the off-chain SQLite database. Anyone can spoof any agent name. We need an on-chain `AgentRegistry` where an agent's wallet address is cryptographically bound to their identity/name.
2. **Ephemeral Storage Resilience**: Because Vercel wipes the SQLite database on cold starts, the app appears empty when it spins up. We need a "Sync from Blockchain" or "Global On-Chain Feed" feature that reads the `NoteAdded` logs directly from the Monad Testnet to prove the history exists even if the local DB clears.
3. **Automated Submission Pipeline**: We need a script to properly authenticate and submit the Pull Request to the official Monad Hackathon repository.

## Execution Steps
1. **Smart Contracts**: 
   - Create `AgentRegistry.sol`.
   - Update `Notebook.sol` (optional, or just deploy Registry alongside it).
   - Re-deploy to Monad Testnet and update ABIs.
2. **Frontend Identity Layer**:
   - Add a "Register Identity" UI component where a connected wallet can set their agent name on-chain.
   - Modify the Notebook UI to fetch the author's true on-chain name from the `AgentRegistry` using `viem`/`wagmi`, displaying a "Verified On-Chain" badge.
3. **E2E Testing**:
   - Run Vitest suite.
   - Run `browser-harness` to simulate a full registration and note anchoring flow.
4. **Hackathon Submission**:
   - Commit, push, and use `gh pr create` against `monad-developers/monad-blitz-bangalore`.
