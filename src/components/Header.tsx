import { Link, useLocation } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'

export function Header() {
  const location = useLocation()
  const { connected } = useWallet()
  const isHome = location.pathname === '/'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-sm border-b border-cream-dark">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-teal" />
          <span className="font-serif text-2xl font-semibold text-brown">NAHUALLI</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {isHome ? (
            <>
              <a href="#features" className="text-brown-light hover:text-brown transition-colors">Features</a>
              <a href="#how-it-works" className="text-brown-light hover:text-brown transition-colors">How it Works</a>
            </>
          ) : connected && (
            <>
              <Link 
                to="/tests" 
                className={`transition-colors ${location.pathname === '/tests' || location.pathname.startsWith('/assessment') ? 'text-brown font-medium' : 'text-brown-light hover:text-brown'}`}
              >
                Tests
              </Link>
              <Link 
                to="/history" 
                className={`transition-colors ${location.pathname === '/history' ? 'text-brown font-medium' : 'text-brown-light hover:text-brown'}`}
              >
                History
              </Link>
              <Link 
                to="/proofs" 
                className={`transition-colors ${location.pathname === '/proofs' ? 'text-brown font-medium' : 'text-brown-light hover:text-brown'}`}
              >
                Proofs
              </Link>
            </>
          )}
        </nav>

        <WalletMultiButton className="!bg-brown !text-cream !rounded-full !px-6 !py-2 !font-sans !text-sm hover:!bg-brown-light !transition-colors" />
      </div>
    </header>
  )
}
