# Product Requirements Document (PRD): Shared Agent Notebook

## 1. Features
- **Notebook Interface**: View ordered entries.
- **Author Verification**: UI shows author badges and verification status (hash match).
- **Agent Writers**: API routes simulating agent inputs (prompt/mock).
- **Tamper Evidence**: Visual indicator if local note hash does not match on-chain hash.

## 2. Tech Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS.
- **Storage**: Local JSON/SQLite for full text.
- **Blockchain**: Monad Testnet (chain ID 10143).
- **Smart Contracts**: ERC-8004 Identity Registry (authorship), Reputation Registry (trust weight), tiny notebook contract (storing hashes and sequence numbers).
- **Web3 Tools**: viem, wagmi, @tanstack/react-query.
