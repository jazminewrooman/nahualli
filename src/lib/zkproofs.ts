import type { TestResult } from './big5-questions'

export type ProofType = 
  | 'test_completed'
  | 'trait_level'
  | 'trait_range'
  | 'role_fit'

export interface ZKProof {
  id: string
  type: ProofType
  statement: string
  proof: string
  publicInputs: Record<string, string | number | boolean>
  createdAt: number
  expiresAt: number | null
  walletAddress: string
}

export interface ProofRequest {
  type: ProofType
  trait?: keyof TestResult
  threshold?: number
  range?: { min: number; max: number }
  role?: string
}

function generateProofId(): string {
  return 'zkp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function hashData(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(16, '0')
}

export function generateZKProof(
  results: TestResult,
  request: ProofRequest,
  walletAddress: string,
  expiresInHours: number | null = 24
): ZKProof {
  const proofId = generateProofId()
  const timestamp = Date.now()
  
  let statement: string
  let publicInputs: Record<string, string | number | boolean> = {}
  
  switch (request.type) {
    case 'test_completed':
      statement = 'I have completed the Big Five personality assessment'
      publicInputs = {
        testType: 'big5',
        completed: true,
        timestamp: timestamp,
      }
      break
      
    case 'trait_level':
      if (!request.trait || request.threshold === undefined) {
        throw new Error('trait and threshold required for trait_level proof')
      }
      const traitValue = results[request.trait]
      const isHigh = traitValue >= request.threshold
      statement = `My ${request.trait} score is ${isHigh ? 'HIGH' : 'LOW'} (threshold: ${request.threshold})`
      publicInputs = {
        trait: request.trait,
        level: isHigh ? 'HIGH' : 'LOW',
        threshold: request.threshold,
        meetsThreshold: isHigh,
      }
      break
      
    case 'trait_range':
      if (!request.trait || !request.range) {
        throw new Error('trait and range required for trait_range proof')
      }
      const value = results[request.trait]
      const inRange = value >= request.range.min && value <= request.range.max
      statement = `My ${request.trait} score is within range ${request.range.min}-${request.range.max}`
      publicInputs = {
        trait: request.trait,
        rangeMin: request.range.min,
        rangeMax: request.range.max,
        inRange: inRange,
      }
      break
      
    case 'role_fit':
      if (!request.role) {
        throw new Error('role required for role_fit proof')
      }
      const roleFit = calculateRoleFit(results, request.role)
      statement = `I am ${roleFit.fit ? 'suitable' : 'not suitable'} for ${request.role} role`
      publicInputs = {
        role: request.role,
        fit: roleFit.fit,
        confidence: roleFit.confidence,
      }
      break
      
    default:
      throw new Error(`Unknown proof type: ${request.type}`)
  }

  const proofData = JSON.stringify({
    id: proofId,
    statement,
    publicInputs,
    timestamp,
    wallet: walletAddress,
  })
  
  const proof = 'zk_' + hashData(proofData) + '_' + hashData(walletAddress + timestamp)

  return {
    id: proofId,
    type: request.type,
    statement,
    proof,
    publicInputs,
    createdAt: timestamp,
    expiresAt: expiresInHours ? timestamp + (expiresInHours * 60 * 60 * 1000) : null,
    walletAddress,
  }
}

export function verifyZKProof(proof: ZKProof): { valid: boolean; reason?: string } {
  if (proof.expiresAt && Date.now() > proof.expiresAt) {
    return { valid: false, reason: 'Proof has expired' }
  }
  
  if (!proof.proof.startsWith('zk_')) {
    return { valid: false, reason: 'Invalid proof format' }
  }
  
  if (!proof.id.startsWith('zkp_')) {
    return { valid: false, reason: 'Invalid proof ID' }
  }
  
  return { valid: true }
}

interface RoleFitResult {
  fit: boolean
  confidence: number
  traits: Record<string, boolean>
}

const ROLE_REQUIREMENTS: Record<string, Partial<Record<keyof TestResult, { min?: number; max?: number }>>> = {
  'Software Engineer': {
    openness: { min: 60 },
    conscientiousness: { min: 50 },
  },
  'Product Manager': {
    extraversion: { min: 50 },
    agreeableness: { min: 50 },
    conscientiousness: { min: 60 },
  },
  'Designer': {
    openness: { min: 70 },
    agreeableness: { min: 40 },
  },
  'Sales': {
    extraversion: { min: 70 },
    agreeableness: { min: 50 },
    neuroticism: { max: 50 },
  },
  'Researcher': {
    openness: { min: 70 },
    conscientiousness: { min: 60 },
  },
  'Team Lead': {
    extraversion: { min: 50 },
    conscientiousness: { min: 60 },
    agreeableness: { min: 50 },
    neuroticism: { max: 60 },
  },
}

function calculateRoleFit(results: TestResult, role: string): RoleFitResult {
  const requirements = ROLE_REQUIREMENTS[role]
  
  if (!requirements) {
    return { fit: true, confidence: 50, traits: {} }
  }
  
  const traitResults: Record<string, boolean> = {}
  let matchCount = 0
  let totalRequirements = 0
  
  for (const [trait, req] of Object.entries(requirements)) {
    const traitKey = trait as keyof TestResult
    const value = results[traitKey]
    totalRequirements++
    
    let meets = true
    if (req.min !== undefined && value < req.min) meets = false
    if (req.max !== undefined && value > req.max) meets = false
    
    traitResults[trait] = meets
    if (meets) matchCount++
  }
  
  const confidence = Math.round((matchCount / totalRequirements) * 100)
  const fit = confidence >= 70
  
  return { fit, confidence, traits: traitResults }
}

export function getAvailableRoles(): string[] {
  return Object.keys(ROLE_REQUIREMENTS)
}

export function storeProof(proof: ZKProof): void {
  const proofs = getStoredProofs()
  proofs.push(proof)
  localStorage.setItem('nahualli_proofs', JSON.stringify(proofs))
}

export function getStoredProofs(): ZKProof[] {
  const stored = localStorage.getItem('nahualli_proofs')
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function getProofsByWallet(walletAddress: string): ZKProof[] {
  return getStoredProofs().filter(p => p.walletAddress === walletAddress)
}

export function generateShareableLink(proof: ZKProof): string {
  const encoded = btoa(JSON.stringify({
    id: proof.id,
    type: proof.type,
    statement: proof.statement,
    publicInputs: proof.publicInputs,
    proof: proof.proof,
    expiresAt: proof.expiresAt,
  }))
  return `${window.location.origin}/verify?proof=${encoded}`
}

export function decodeShareableProof(encoded: string): Partial<ZKProof> | null {
  try {
    return JSON.parse(atob(encoded))
  } catch {
    return null
  }
}
