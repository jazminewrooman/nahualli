import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './components/WalletProvider'
import { Landing } from './pages/Landing'
import { Assessment } from './pages/Assessment'
import { Proofs } from './pages/Proofs'
import { Interpretation } from './pages/Interpretation'

function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/proofs" element={<Proofs />} />
          <Route path="/interpretation" element={<Interpretation />} />
        </Routes>
      </WalletProvider>
    </BrowserRouter>
  )
}

export default App
