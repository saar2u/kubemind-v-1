import sodium from 'libsodium-wrappers'
import { deriveKey, initializeSodium } from './key-management'
import type { EncryptedData } from './encrypt'

export async function decryptData(
  encrypted: EncryptedData,
  password: string
): Promise<string> {
  await initializeSodium()
  
  // Convert from base64
  const ciphertext = sodium.from_base64(
    encrypted.ciphertext,
    sodium.base64_variants.ORIGINAL
  )
  const nonce = sodium.from_base64(
    encrypted.nonce,
    sodium.base64_variants.ORIGINAL
  )
  const salt = sodium.from_base64(
    encrypted.salt,
    sodium.base64_variants.ORIGINAL
  )
  
  // Derive the same key using the stored salt
  const { key } = await deriveKey(password, salt)
  
  // Decrypt
  const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key)
  
  if (decrypted === null) {
    throw new Error('Decryption failed - incorrect password or corrupted data')
  }
  
  return sodium.to_string(decrypted)
}
