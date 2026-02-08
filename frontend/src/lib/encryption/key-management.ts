import sodium from 'libsodium-wrappers'

export interface EncryptionKey {
  key: Uint8Array
  salt: Uint8Array
}

export const KEY_LENGTH = sodium.crypto_secretbox_KEYBYTES // 32 bytes
export const SALT_LENGTH = 32

export async function initializeSodium(): Promise<void> {
  await sodium.ready
}

export async function deriveKey(password: string, salt?: Uint8Array): Promise<EncryptionKey> {
  await initializeSodium()
  
  // Generate random salt if not provided
  const saltBytes = salt || sodium.randombytes_buf(SALT_LENGTH)
  
  // Derive key using Argon2id (strong KDF)
  const key = sodium.crypto_pwhash(
    KEY_LENGTH,
    password,
    saltBytes,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_ARGON2ID13
  )
  
  return { key, salt: saltBytes }
}
