import { Link } from 'react-router-dom'
import { Lock, Fingerprint, Network } from 'lucide-react'
import { Header } from '../components/Header'
import { FeatureCard } from '../components/FeatureCard'
import heroImage from '../assets/images/hero-nahual.png'

export function Landing() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative w-full max-w-lg mx-auto mb-8">
            <img 
              src={heroImage} 
              alt="Nahualli - Your digital guardian" 
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
          
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-brown mb-4">
            NAHUALLI
          </h1>
          
          <p className="text-xl md:text-2xl text-brown-light mb-8 font-serif italic">
            Your hidden self, cryptographically protected.
          </p>
          
          <Link 
            to="/assessment"
            className="inline-block bg-brown text-cream px-8 py-4 rounded-full font-semibold hover:bg-brown-light transition-colors text-lg"
          >
            Enter the Vault
          </Link>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 px-6 bg-cream-dark/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-semibold text-brown mb-4">
            Your Private Vault on Solana
          </h2>
          <p className="text-brown-light text-lg max-w-2xl mx-auto">
            Own, encrypt, and selectively share your most sensitive data on Solana. 
            Fully private. User controlled.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Lock className="w-10 h-10" />}
              title="End-to-End Encryption"
              description="Your data is locked, only you hold the key."
            />
            <FeatureCard 
              icon={<Fingerprint className="w-10 h-10" />}
              title="Adaptive Identity"
              description="Reveal only what you choose, exactly when you choose."
            />
            <FeatureCard 
              icon={<Network className="w-10 h-10" />}
              title="Zero-Knowledge Proofs"
              description="Prove your credentials without exposing any data."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-6 bg-cream-dark/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl font-semibold text-brown text-center mb-12">
            How it Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Connect Wallet', desc: 'Your identity on Solana' },
              { step: '2', title: 'Take Assessment', desc: 'Encrypted on-chain' },
              { step: '3', title: 'Generate Proof', desc: 'Share selectively with ZK' },
              { step: '4', title: 'Verify', desc: 'Recruiter confirms privately' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-teal text-cream flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-brown mb-1">{item.title}</h3>
                <p className="text-brown-light text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built With */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brown-light text-sm mb-6">BUILT WITH</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <span className="font-semibold text-brown">Solana</span>
            <span className="font-semibold text-brown">Light Protocol</span>
            <span className="font-semibold text-brown">Arcium</span>
            <span className="font-semibold text-brown">Helius</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-cream-dark">
        <div className="max-w-4xl mx-auto text-center text-brown-light text-sm">
          <p>© 2025 Nahualli. Your digital guardian.</p>
        </div>
      </footer>
    </div>
  )
}
