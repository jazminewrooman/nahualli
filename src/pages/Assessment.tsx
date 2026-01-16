import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Shield, CheckCircle, Loader2 } from 'lucide-react'
import { BIG5_QUESTIONS, calculateScores, getTraitLabel, getTraitDescription } from '../lib/big5-questions'
import type { TestResult } from '../lib/big5-questions'
import { Header } from '../components/Header'
import { useEncryptedStorage } from '../hooks/useEncryptedStorage'

type AssessmentStep = 'intro' | 'questions' | 'saving' | 'results'

export function Assessment() {
  const { connected } = useWallet()
  const { saveTestResult, isLoading: isSaving } = useEncryptedStorage()
  const [step, setStep] = useState<AssessmentStep>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [results, setResults] = useState<TestResult | null>(null)
  const [savedHash, setSavedHash] = useState<string | null>(null)

  const handleAnswer = async (value: number) => {
    const question = BIG5_QUESTIONS[currentQuestion]
    const newAnswers = { ...answers, [question.id]: value }
    setAnswers(newAnswers)
    
    if (currentQuestion < BIG5_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      const scores = calculateScores(newAnswers)
      setResults(scores)
      setStep('saving')
      
      const stored = await saveTestResult('big5', newAnswers, scores)
      if (stored) {
        setSavedHash(stored.ipfsHash)
      }
      setStep('results')
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const progress = ((currentQuestion + 1) / BIG5_QUESTIONS.length) * 100

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
            To take the assessment and own your results on-chain, please connect your Solana wallet first.
          </p>
        </div>
      </div>
    )
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="pt-32 px-6 max-w-2xl mx-auto text-center">
          <Shield className="w-16 h-16 mx-auto text-teal mb-6" />
          <h1 className="font-serif text-4xl font-bold text-brown mb-4">
            Big Five Personality Assessment
          </h1>
          <p className="text-brown-light mb-8">
            This assessment measures five key personality traits: Openness, Conscientiousness, 
            Extraversion, Agreeableness, and Neuroticism. Your responses are encrypted and 
            stored on-chain — only you can access them.
          </p>
          
          <div className="bg-cream-dark/50 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-brown mb-3">What to expect:</h3>
            <ul className="space-y-2 text-brown-light text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                <span>25 questions about your personality and preferences</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                <span>Takes approximately 5-10 minutes to complete</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                <span>Results are encrypted and stored on Solana</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                <span>Share selectively using zero-knowledge proofs</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setStep('questions')}
            className="bg-brown text-cream px-8 py-4 rounded-full font-semibold hover:bg-brown-light transition-colors"
          >
            Begin Assessment
          </button>
        </div>
      </div>
    )
  }

  if (step === 'questions') {
    const question = BIG5_QUESTIONS[currentQuestion]
    const currentAnswer = answers[question.id]

    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="pt-28 px-6 max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-brown-light mb-2">
              <span>Question {currentQuestion + 1} of {BIG5_QUESTIONS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <p className="text-xl text-brown font-medium text-center mb-8">
              {question.text}
            </p>

            {/* Answer options */}
            <div className="space-y-3">
              {[
                { value: 1, label: 'Strongly Disagree' },
                { value: 2, label: 'Disagree' },
                { value: 3, label: 'Neutral' },
                { value: 4, label: 'Agree' },
                { value: 5, label: 'Strongly Agree' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    currentAnswer === option.value
                      ? 'border-teal bg-teal/10 text-brown'
                      : 'border-cream-dark hover:border-teal/50 text-brown-light hover:text-brown'
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 text-brown-light hover:text-brown disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>
            <button
              onClick={() => currentAnswer && handleAnswer(currentAnswer)}
              disabled={!currentAnswer}
              className="flex items-center gap-2 text-brown-light hover:text-brown disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {currentQuestion === BIG5_QUESTIONS.length - 1 ? 'Finish' : 'Next'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'saving') {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="pt-32 px-6 text-center">
          <Loader2 className="w-16 h-16 mx-auto text-teal mb-6 animate-spin" />
          <h1 className="font-serif text-3xl font-bold text-brown mb-4">
            Encrypting & Storing
          </h1>
          <p className="text-brown-light max-w-md mx-auto">
            Your results are being encrypted and stored securely. This may take a moment...
          </p>
        </div>
      </div>
    )
  }

  if (step === 'results' && results) {
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const

    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="pt-28 px-6 max-w-3xl mx-auto pb-16">
          <div className="text-center mb-12">
            <CheckCircle className="w-16 h-16 mx-auto text-teal mb-4" />
            <h1 className="font-serif text-4xl font-bold text-brown mb-2">
              Your Results
            </h1>
            <p className="text-brown-light">
              Your personality profile has been encrypted and stored.
            </p>
            {savedHash && (
              <p className="text-xs text-brown-light/60 mt-2 font-mono">
                ID: {savedHash.slice(0, 20)}...
              </p>
            )}
          </div>

          {/* Results Grid */}
          <div className="space-y-6 mb-12">
            {traits.map((trait) => (
              <div key={trait} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-serif text-xl font-semibold text-brown">
                    {getTraitLabel(trait)}
                  </h3>
                  <span className="text-2xl font-bold text-teal">
                    {results[trait]}%
                  </span>
                </div>
                <div className="h-3 bg-cream-dark rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-teal transition-all duration-500"
                    style={{ width: `${results[trait]}%` }}
                  />
                </div>
                <p className="text-brown-light text-sm">
                  {getTraitDescription(trait, results[trait])}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/proofs"
              className="bg-brown text-cream px-8 py-4 rounded-full font-semibold hover:bg-brown-light transition-colors text-center"
            >
              Generate ZK Proof
            </Link>
            <button className="border-2 border-brown text-brown px-8 py-4 rounded-full font-semibold hover:bg-brown hover:text-cream transition-colors">
              View on Explorer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
