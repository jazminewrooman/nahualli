import type { EncryptedPayload } from './encryption'

const IPFS_GATEWAY = 'https://w3s.link/ipfs'

export interface StoredTestResult {
  ipfsHash: string
  timestamp: number
  testType: string
  walletAddress: string
}

export async function uploadToIPFS(encryptedPayload: EncryptedPayload): Promise<string> {
  const blob = new Blob([JSON.stringify(encryptedPayload)], { type: 'application/json' })
  
  const formData = new FormData()
  formData.append('file', blob, 'encrypted-result.json')

  const response = await fetch('https://api.web3.storage/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_WEB3_STORAGE_TOKEN || ''}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Failed to upload to IPFS: ${response.statusText}`)
  }

  const result = await response.json()
  return result.cid
}

export async function fetchFromIPFS(cid: string): Promise<EncryptedPayload> {
  const response = await fetch(`${IPFS_GATEWAY}/${cid}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from IPFS: ${response.statusText}`)
  }

  return await response.json()
}

export function getIPFSUrl(cid: string): string {
  return `${IPFS_GATEWAY}/${cid}`
}

export function storeLocalResult(result: StoredTestResult): void {
  const stored = getLocalResults()
  stored.push(result)
  localStorage.setItem('nahualli_results', JSON.stringify(stored))
}

export function getLocalResults(): StoredTestResult[] {
  const stored = localStorage.getItem('nahualli_results')
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function getLocalResultsByWallet(walletAddress: string): StoredTestResult[] {
  return getLocalResults().filter(r => r.walletAddress === walletAddress)
}
