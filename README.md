# Nahualli 

**Your hidden self, cryptographically protected.**

Nahualli is a privacy-first psychometric assessment platform built on Solana. Take personality tests once, own your results forever, and share selectively using zero-knowledge proofs.

> In Nahuatl culture, a *nahual* is a guardian spirit that can shapeshift to protect you. Nahualli does the same for your data — it transforms and hides your credentials, revealing only what you choose.

## Features

- **End-to-End Encryption**: Your data is encrypted client-side before storage
- **Adaptive Identity**: Reveal only what you choose, exactly when you choose
- **Zero-Knowledge Proofs**: Prove your credentials without exposing any data
- **AI-Powered Interpretation**: Get personality insights via confidential compute (Arcium)
- **Decentralized Storage**: Results stored on IPFS, ownership on Solana

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Blockchain**: Solana (wallet adapter)
- **Privacy**: Light Protocol (ZK proofs), Arcium (confidential compute)
- **Storage**: IPFS (Web3.Storage)
- **RPC**: Helius

## Getting Started

### Prerequisites

- Node.js 18+
- A Solana wallet (Phantom or Solflare)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/nahualli.git
cd nahualli

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables (Optional)

Create a `.env` file for IPFS storage:

```env
VITE_WEB3_STORAGE_TOKEN=your_web3_storage_token
```

## Usage

1. **Connect Wallet**: Connect your Phantom or Solflare wallet
2. **Take Assessment**: Complete the Big Five personality test (25 questions)
3. **View Results**: See your encrypted results stored on-chain
4. **Generate Proofs**: Create ZK proofs to share specific traits
5. **Get Interpretation**: AI-powered personality analysis via Arcium

## Privacy Architecture

```
User → Takes Test → Encrypted Client-Side → IPFS Storage
                                         ↓
                              Hash stored on Solana
                                         ↓
                    Light Protocol generates ZK proofs
                                         ↓
                    Share selectively without revealing data
```

## Hackathon Bounties

Built for the Solana Privacy Hackathon:

- **Light Protocol** ($18k) - ZK proofs for selective disclosure
- **Arcium** ($10k) - Confidential LLM interpretation
- **Helius** ($5k) - RPC infrastructure

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── lib/             # Core libraries
└── hooks/           # Custom React hooks
```

## License

MIT License

---

**Built with 💚 for the Solana Privacy Hackathon 2025**
