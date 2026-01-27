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
nahualli/                    # Root project
├── src/                     # React Frontend
│   ├── components/          # UI components (Header, WalletProvider)
│   ├── pages/
│   │   ├── Landing.tsx      # Home page
│   │   ├── TestSelection.tsx # Choose test type
│   │   ├── GenericAssessment.tsx # Test-taking flow
│   │   ├── History.tsx      # View all completed tests
│   │   ├── Interpretation.tsx # View latest interpretation
│   │   └── Proofs.tsx       # ZK proof generation (WIP)
│   ├── lib/
│   │   ├── encryption.ts    # AES-GCM encryption utilities
│   │   ├── ipfs.ts          # Pinata IPFS integration
│   │   ├── solana-storage.ts # Memo Program integration
│   │   ├── arcium.ts        # Arcium MXE client (frontend)
│   │   ├── interpretations.ts # Personality interpretations
│   │   └── *-questions.ts   # Test definitions
│   └── hooks/
│       └── useEncryptedStorage.ts # Main storage hook
│
└── nahualli/                # Anchor Program (Arcium Integration)
    ├── programs/nahualli/src/lib.rs  # Solana program with Arcium
    ├── encrypted-ixs/src/lib.rs      # Confidential compute circuit
    ├── Anchor.toml          # Anchor config (deployed to devnet)
    ├── Arcium.toml          # Arcium MXE configuration
    └── tests/nahualli.ts    # Integration tests
```

## 🔒 Arcium Integration

The `nahualli/` subdirectory contains the **Solana Anchor program** with Arcium confidential compute integration.

### Program ID (Devnet)
```
6idYUYvub9XZLFTchE711q18EE3AtejQR3qkX3SrwGFx
```

### Key Files

#### `programs/nahualli/src/lib.rs` - Anchor Program
The main Solana program that:
- Initializes computation definitions for Arcium MXE
- Queues encrypted psychometric scores for confidential processing
- Handles callbacks with encrypted results

```rust
#[arcium_program]
pub mod nahualli {
    /// Submit psychometric scores for confidential processing
    /// Generic: works with Big-5, DISC, MBTI, or any test with up to 8 scores
    pub fn process_scores(
        ctx: Context<ProcessScores>,
        computation_offset: u64,
        encrypted_scores: [u8; 32],  // Encrypted Pack<[u8; 8]>
        num_scores: u8,
        pubkey: [u8; 32],
        nonce: u128,
    ) -> Result<()> { ... }

    /// Callback when score processing is complete
    #[arcium_callback(encrypted_ix = "process_scores")]
    pub fn process_scores_callback(...) -> Result<()> { ... }
}
```

#### `encrypted-ixs/src/lib.rs` - Confidential Circuit
The encrypted instruction that runs inside Arcium's MXE (Multi-party Execution Environment):

```rust
#[encrypted]
mod circuits {
    /// Generic psychometric score processor
    /// Runs inside MXE - data never exposed in plaintext
    #[instruction]
    pub fn process_scores(
        scores: Enc<Shared, Pack<[u8; 8]>>,
        num_scores: u8,
    ) -> Enc<Shared, Pack<[u8; 2]>> {
        let s = scores.to_arcis().unpack();
        let sum = s[0] + s[1] + s[2] + s[3] + s[4] + s[5] + s[6] + s[7];
        let result = Pack::new([sum, num_scores]);
        scores.owner.from_arcis(result)
    }
}
```

#### `Arcium.toml` - MXE Configuration
```toml
[localnet]
nodes = 2
backends = ["Cerberus"]

[clusters.devnet]
offset = 456
```

### Running Arcium Locally

```bash
cd nahualli

# Start Arcium localnet (requires Docker)
arcium localnet start

# Build and deploy
anchor build
arcium deploy

# Run tests
anchor test
```

### How It Works

1. **Frontend** encrypts test scores using X25519 key exchange
2. **Anchor program** queues the encrypted data to Arcium MXE
3. **MXE nodes** perform multi-party computation on encrypted data
4. **Callback** receives encrypted results, stored on-chain
5. **Only the user** can decrypt their results with their wallet

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Anchor    │────▶│  Arcium MXE │
│  (encrypt)  │     │  (queue TX) │     │  (compute)  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   Solana    │◀────│  Callback   │
                    │  (storage)  │     │  (results)  │
                    └─────────────┘     └─────────────┘
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
