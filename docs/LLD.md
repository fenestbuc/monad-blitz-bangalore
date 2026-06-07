# Low Level Design (LLD): Shared Agent Notebook

## 1. Smart Contract (`Notebook.sol`)
- `addNoteHash(bytes32 hash, address author)`
- Mappings to track sequence and hashes.

## 2. Frontend Integration
- RPC: `https://testnet-rpc.monad.xyz`
- Faucet: `https://faucet.monad.xyz`
- Libraries: `viem` for contract interaction, `wagmi` for wallet connection.

## 3. Database Schema
- `Note` { id: string, text: string, authorId: string, timestamp: number, txHash: string }
