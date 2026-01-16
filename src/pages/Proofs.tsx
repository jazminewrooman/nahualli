import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Shield, Plus, Copy, Check, Clock } from 'lucide-react'
import { Header } from '../components/Header'
import { useEncryptedStorage } from '../hooks/useEncryptedStorage'
import { 
  generateZKProof, 
  getProofsByWallet, 
  storeProof, 
  getAvailableRoles,
  generateShareableLink,
  verifyZKProof
} from '../lib/zkproofs'
import type { ZKProof, ProofType } from '../lib/zkproofs'
import type { TestResult } from '../lib/big5-questions'

export function Proofs() {
  const { publicKey, connected } = useWallet()
  const { getMyResults, loadTestResult } = useEncryptedStorage()
  const [proofs, setProofs] = useState<ZKProof[]>([])
  const [showGenerator, setShowGenerator] = useState(false)
  const [latestResults, setLatestResults] = useState<TestResult | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const [proofType, setProofType] = useState<ProofType>('test_completed')
  const [selectedTrait, setSelectedTrait] = useState<keyof TestResult>('openness')
  const [threshold, setThreshold] = useState(70)
  const [selectedRole, setSelectedRole] = useState(getAvailableRoles()[0])

  useEffect(() => {
    if (publicKey) {
      setProofs(getProofsByWallet(publicKey.toBase58()))
      loadLatestResults()
    }
  }, [publicKey])

  const loadLatestResults = async () => {
    const myResults = getMyResults()
    if (myResults.length > 0) {
      const latest = myResults[myResults.length - 1]
      const data = await loadTestResult(latest.ipfsHash)
      if (data && 'scores' in data) {
        setLatestResults(data.scores as TestResult)
      }
    }
  }

  const handleGenerateProof = () => {
    if (!publicKey || !latestResults) return

    let proof: ZKProof

    switch (proofType) {
      case 'test_completed':
        proof = generateZKProof(latestResults, { type: 'test_completed' }, publicKey.toBase58())
        break
      case 'trait_level':
        proof = generateZKProof(
          latestResults, 
          { type: 'trait_level', trait: selectedTrait, threshold }, 
          publicKey.toBase58()
        )
        break
      case 'role_fit':
        proof = generateZKProof(
          latestResults, 
          { type: 'role_fit', role: selectedRole }, 
          publicKey.toBase58()
        )
        break
      default:
        return
    }

    storeProof(proof)
    setProofs(getProofsByWallet(publicKey.toBase58()))
    setShowGenerator(false)
  }

  const copyToClipboard = async (proof: ZKProof) => {
    const link = generateShareableLink(proof)
    await navigator.clipboard.writeText(link)
    setCopiedId(proof.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="pt-32 px-6 text-center">
          <Shield className="w-16 h-16 mx-auto text-teal mb-6" />
          <h1 className="font-serif text-3xl font-bold text-brown mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-brown-light max-w-md mx-auto">
            Connect your wallet to view and generate zero-knowledge proofs.
          </p>
        </div>
      </div>
    )
  }

  if (!latestResults) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="pt-32 px-6 text-center">
          <Shield className="w-16 h-16 mx-auto text-teal mb-6" />
          <h1 className="font-serif text-3xl font-bold text-brown mb-4">
            No Assessment Found
          </h1>
          <p className="text-brown-light max-w-md mx-auto mb-8">
            You need to complete an assessment before generating proofs.
          </p>
          <a 
            href="/assessment"
            className="inline-block bg-brown text-cream px-8 py-4 rounded-full font-semibold hover:bg-brown-light transition-colors"
          >
            Take Assessment
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="pt-28 px-6 max-w-4xl mx-auto pb-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-brown">
              Zero-Knowledge Proofs
            </h1>
            <p className="text-brown-light mt-1">
              Share verified claims without revealing your data
            </p>
          </div>
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 bg-brown text-cream px-6 py-3 rounded-full font-semibold hover:bg-brown-light transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Proof
          </button>
        </div>

        {/* Proof Generator Modal */}
        {showGenerator && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-cream rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="font-serif text-2xl font-bold text-brown mb-6">
                Generate New Proof
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Proof Type
                  </label>
                  <select
                    value={proofType}
                    onChange={(e) => setProofType(e.target.value as ProofType)}
                    className="w-full p-3 rounded-xl border-2 border-cream-dark bg-white text-brown focus:border-teal outline-none"
                  >
                    <option value="test_completed">Test Completed</option>
                    <option value="trait_level">Trait Level</option>
                    <option value="role_fit">Role Fit</option>
                  </select>
                </div>

                {proofType === 'trait_level' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-brown mb-2">
                        Trait
                      </label>
                      <select
                        value={selectedTrait}
                        onChange={(e) => setSelectedTrait(e.target.value as keyof TestResult)}
                        className="w-full p-3 rounded-xl border-2 border-cream-dark bg-white text-brown focus:border-teal outline-none"
                      >
                        <option value="openness">Openness</option>
                        <option value="conscientiousness">Conscientiousness</option>
                        <option value="extraversion">Extraversion</option>
                        <option value="agreeableness">Agreeableness</option>
                        <option value="neuroticism">Neuroticism</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brown mb-2">
                        Threshold: {threshold}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={threshold}
                        onChange={(e) => setThreshold(Number(e.target.value))}
                        className="w-full accent-teal"
                      />
                      <p className="text-xs text-brown-light mt-1">
                        Proves your score is above or below this threshold
                      </p>
                    </div>
                  </>
                )}

                {proofType === 'role_fit' && (
                  <div>
                    <label className="block text-sm font-medium text-brown mb-2">
                      Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full p-3 rounded-xl border-2 border-cream-dark bg-white text-brown focus:border-teal outline-none"
                    >
                      {getAvailableRoles().map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="bg-cream-dark/50 rounded-xl p-4">
                  <p className="text-sm text-brown-light">
                    <strong className="text-brown">Preview:</strong>{' '}
                    {proofType === 'test_completed' && 'I have completed the Big Five personality assessment'}
                    {proofType === 'trait_level' && `My ${selectedTrait} score is HIGH/LOW (threshold: ${threshold})`}
                    {proofType === 'role_fit' && `I am suitable/not suitable for ${selectedRole} role`}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowGenerator(false)}
                    className="flex-1 py-3 rounded-full border-2 border-brown text-brown font-semibold hover:bg-brown hover:text-cream transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateProof}
                    className="flex-1 py-3 rounded-full bg-brown text-cream font-semibold hover:bg-brown-light transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proofs List */}
        {proofs.length === 0 ? (
          <div className="text-center py-16">
            <Shield className="w-16 h-16 mx-auto text-cream-dark mb-4" />
            <p className="text-brown-light">No proofs generated yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {proofs.map((proof) => {
              const verification = verifyZKProof(proof)
              const isExpired = proof.expiresAt && Date.now() > proof.expiresAt

              return (
                <div 
                  key={proof.id}
                  className={`bg-white rounded-2xl p-6 shadow-sm ${isExpired ? 'opacity-60' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        verification.valid 
                          ? 'bg-teal/10 text-teal' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {verification.valid ? 'Valid' : 'Invalid'}
                      </span>
                      <h3 className="font-semibold text-brown mt-2">
                        {proof.statement}
                      </h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(proof)}
                      className="p-2 rounded-lg hover:bg-cream-dark transition-colors"
                      title="Copy shareable link"
                    >
                      {copiedId === proof.id ? (
                        <Check className="w-5 h-5 text-teal" />
                      ) : (
                        <Copy className="w-5 h-5 text-brown-light" />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(proof.publicInputs).map(([key, value]) => (
                      <span 
                        key={key}
                        className="px-2 py-1 bg-cream-dark rounded text-xs text-brown-light"
                      >
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-brown-light">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Created: {formatDate(proof.createdAt)}
                    </span>
                    {proof.expiresAt && (
                      <span className={isExpired ? 'text-red-500' : ''}>
                        {isExpired ? 'Expired' : `Expires: ${formatDate(proof.expiresAt)}`}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-cream-dark">
                    <p className="text-xs font-mono text-brown-light/60 break-all">
                      {proof.proof}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
