import sodium from 'libsodium-wrappers'
import { deriveKey, initializeSodium } from './key-management'

export interface EncryptedData {
  ciphertext: string // base64
  nonce: string // base64
  salt: string // base64
}

export async function encryptData(data: any, password: string): Promise<EncryptedData> {
  await initializeSodium()
  
  // Derive encryption key
  const { key, salt } = await deriveKey(password)
  
  // Generate random nonce
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
  
  // Convert data to string and encrypt
  const message = typeof data === 'string' ? data : JSON.stringify(data)
  const messageBytes = sodium.from_string(message)
  
  const ciphertext = sodium.crypto_secretbox_easy(messageBytes, nonce, key)
  
  // Convert to base64 for storage/transmission
  return {
    ciphertext: sodium.to_base64(ciphertext, sodium.base64_variants.ORIGINAL),
    nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
    salt: sodium.to_base64(salt, sodium.base64_variants.ORIGINAL)
  }
}
