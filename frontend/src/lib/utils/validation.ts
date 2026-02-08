export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidCloudResourceName(name: string): boolean {
  // Must start with letter, contain only letters, numbers, hyphens, underscores
  const nameRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/
  return nameRegex.test(name) && name.length <= 63
}
