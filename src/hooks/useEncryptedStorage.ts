import { useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { 
  generateEncryptionKey, 
  encryptForStorage, 
  decryptFromStorage, 
  exportKey, 
  importKey 
} from '../lib/encryption'
import type { EncryptedPayload } from '../lib/encryption'
import { uploadToIPFS, fetchFromIPFS, storeLocalResult, getLocalResultsByWallet } from '../lib/ipfs'
import type { StoredTestResult } from '../lib/ipfs'
import type { TestResult } from '../lib/big5-questions'

const ENCRYPTION_KEY_STORAGE = 'nahualli_encryption_key'

export function useEncryptedStorage() {
  const { publicKey } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getOrCreateKey = useCallback(async (): Promise<CryptoKey> => {
    const walletAddress = publicKey?.toBase58()
    if (!walletAddress) throw new Error('Wallet not connected')

    const storedKey = localStorage.getItem(`${ENCRYPTION_KEY_STORAGE}_${walletAddress}`)
    
    if (storedKey) {
      return await importKey(storedKey)
    }

    const newKey = await generateEncryptionKey()
    const exportedKey = await exportKey(newKey)
    localStorage.setItem(`${ENCRYPTION_KEY_STORAGE}_${walletAddress}`, exportedKey)
    
    return newKey
  }, [publicKey])

  const saveTestResult = useCallback(async (
    testType: string,
    answers: Record<number, number>,
    scores: TestResult
  ): Promise<StoredTestResult | null> => {
    if (!publicKey) {
      setError('Wallet not connected')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const key = await getOrCreateKey()
      
      const dataToEncrypt = {
        testType,
        answers,
        scores,
        timestamp: Date.now(),
        walletAddress: publicKey.toBase58(),
      }

      const encryptedPayload = await encryptForStorage(dataToEncrypt, key)
      
      let ipfsHash = 'local_' + Date.now().toString(36)
      
      try {
        ipfsHash = await uploadToIPFS(encryptedPayload)
      } catch (ipfsError) {
        console.warn('IPFS upload failed, storing locally:', ipfsError)
        localStorage.setItem(`nahualli_encrypted_${ipfsHash}`, JSON.stringify(encryptedPayload))
      }

      const storedResult: StoredTestResult = {
        ipfsHash,
        timestamp: Date.now(),
        testType,
        walletAddress: publicKey.toBase58(),
      }

      storeLocalResult(storedResult)
      
      return storedResult
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save result'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, getOrCreateKey])

  const loadTestResult = useCallback(async (ipfsHash: string): Promise<object | null> => {
    if (!publicKey) {
      setError('Wallet not connected')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const key = await getOrCreateKey()
      
      let encryptedPayload: EncryptedPayload

      if (ipfsHash.startsWith('local_')) {
        const stored = localStorage.getItem(`nahualli_encrypted_${ipfsHash}`)
        if (!stored) throw new Error('Local data not found')
        encryptedPayload = JSON.parse(stored)
      } else {
        encryptedPayload = await fetchFromIPFS(ipfsHash)
      }

      const decrypted = await decryptFromStorage(encryptedPayload, key)
      return decrypted
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load result'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, getOrCreateKey])

  const getMyResults = useCallback((): StoredTestResult[] => {
    if (!publicKey) return []
    return getLocalResultsByWallet(publicKey.toBase58())
  }, [publicKey])

  return {
    saveTestResult,
    loadTestResult,
    getMyResults,
    isLoading,
    error,
  }
}
