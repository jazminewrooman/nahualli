# Nahualli 🦎

**Your hidden self, cryptographically protected.**

Nahualli is a privacy-first psychometric assessment platform built on Solana. Take personality tests once, own your results forever, and share selectively using zero-knowledge proofs.

> In Nahuatl culture, a *nahual* is a guardian spirit that can shapeshift to protect you. Nahualli does the same for your data — it transforms and hides your credentials, revealing only what you choose.

## ✨ Features

- **4 Psychometric Tests**: Big Five, DISC, MBTI, and Enneagram assessments
- **End-to-End Encryption**: AES-256-GCM encryption with wallet-derived keys
- **Decentralized Storage**: Encrypted results stored on IPFS (Pinata)
- **On-Chain Registry**: IPFS hashes stored on Solana via Memo Program
- **Full Data Recovery**: Clear your browser, reconnect wallet, recover everything
- **Personalized Interpretations**: Detailed personality insights for each test type
- **Confidential Compute Ready**: Arcium MXE integration for private AI processing

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS |
| Blockchain | Solana (Wallet Adapter, Memo Program) |
| Storage | IPFS via Pinata |
| Encryption | AES-256-GCM (Web Crypto API) |
| Privacy | Arcium MXE (confidential compute) |
| RPC | Helius / Solana Devnet |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Solana wallet (Phantom recommended)
- SOL on devnet for transactions (~0.001 SOL per test)

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

### Environment Variables

Create a `.env` file:

```env
VITE_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
VITE_PINATA_JWT=your_pinata_jwt_token
```

**Getting API Keys:**
- **Helius**: Free at [helius.dev](https://helius.dev)
- **Pinata**: Free at [pinata.cloud](https://pinata.cloud) (enable Legacy API endpoints)

## 📱 Usage

1. **Connect Wallet**: Connect your Phantom wallet
2. **Sign Message**: Derive your encryption key (one-time, free)
3. **Take Tests**: Complete any of the 4 personality assessments
4. **View History**: See all your completed tests at `/history`
5. **Sync from Chain**: Recover your data on any device by syncing from Solana

## 🔐 Privacy Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER FLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Connect Wallet                                          │
│         ↓                                                   │
│  2. Sign Message → Derive AES-256 Key (deterministic)       │
│         ↓                                                   │
│  3. Take Test → Encrypt Results (client-side)               │
│         ↓                                                   │
│  4. Upload to IPFS (Pinata) → Get CID                       │
│         ↓                                                   │
│  5. Store CID on Solana (Memo Program) → ~$0.001            │
│         ↓                                                   │
│  6. Generate Interpretation (local)                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     DATA RECOVERY                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Clear Browser → Connect Wallet → Sync from Solana          │
│         ↓                                                   │
│  Sign Message → Regenerate Same Key → Decrypt from IPFS     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Security Properties:**
- Encryption key derived from wallet signature (deterministic, recoverable)
- Data encrypted before leaving your browser
- Only you can decrypt your data (requires wallet signature)
- IPFS provides content-addressed, immutable storage
- Solana provides tamper-proof registry of your test history

## 📁 Project Structure

```
src/
├── components/          # UI components (Header, WalletProvider)
├── pages/
│   ├── Landing.tsx      # Home page
│   ├── TestSelection.tsx # Choose test type
│   ├── GenericAssessment.tsx # Test-taking flow
│   ├── History.tsx      # View all completed tests
│   ├── Interpretation.tsx # View latest interpretation
│   └── Proofs.tsx       # ZK proof generation (WIP)
├── lib/
│   ├── encryption.ts    # AES-GCM encryption utilities
│   ├── ipfs.ts          # Pinata IPFS integration
│   ├── solana-storage.ts # Memo Program integration
│   ├── arcium.ts        # Arcium MXE client
│   ├── interpretations.ts # Personality interpretations
│   ├── big5-questions.ts # Big Five test
│   ├── disc-questions.ts # DISC test
│   ├── mbti-questions.ts # MBTI test
│   └── enneagram-questions.ts # Enneagram test
└── hooks/
    └── useEncryptedStorage.ts # Main storage hook
```

## 🎯 Roadmap

- [x] Multi-test support (Big Five, DISC, MBTI, Enneagram)
- [x] Client-side encryption with wallet-derived keys
- [x] IPFS storage via Pinata
- [x] On-chain registry via Solana Memo Program
- [x] Full data recovery from blockchain
- [x] Personalized interpretations per test type
- [ ] ZK proofs for selective disclosure (Noir/Light Protocol)
- [ ] PDF/Document upload with score extraction
- [ ] Arcium real-time confidential compute
- [ ] Enhanced landing page design

## 🏆 Hackathon Bounties

Built for the Solana Privacy Hackathon:

| Bounty | Technology | Status |
|--------|------------|--------|
| Arcium ($10k) | Confidential compute | ✅ Integrated (demo mode) |
| Light Protocol ($18k) | ZK proofs | 🔄 In progress |
| Helius ($5k) | RPC infrastructure | ✅ Integrated |

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Get devnet SOL for testing
# Visit: https://faucet.solana.com
```

## 📄 License

MIT License

---

**Built with 💚 for the Solana Privacy Hackathon 2025**

*Nahualli - Protecting your digital spirit*
