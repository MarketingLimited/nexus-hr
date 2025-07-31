export interface MFAMethod {
  id: string
  userId: string
  type: 'totp' | 'sms' | 'email' | 'backup_codes' | 'hardware_key'
  name: string
  isEnabled: boolean
  isPrimary: boolean
  createdAt: string
  lastUsed?: string
  metadata?: Record<string, any>
}

export interface MFASetupResponse {
  secret: string
  qrCode: string
  backupCodes: string[]
  method: MFAMethod
}

export interface MFAChallenge {
  id: string
  type: 'totp' | 'sms' | 'email' | 'backup_code'
  maskedDestination?: string // For SMS/email
  expiresAt: string
  attemptsRemaining: number
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAge: number // days
  historyCount: number // prevent reuse of last N passwords
  lockoutThreshold: number
  lockoutDuration: number // minutes
}

export interface SecurityQuestion {
  id: string
  question: string
  isCustom: boolean
}

export interface UserSecuritySettings {
  userId: string
  mfaEnabled: boolean
  mfaMethods: MFAMethod[]
  passwordLastChanged: string
  securityQuestions: Array<{
    questionId: string
    question: string
    hasAnswer: boolean
  }>
  trustedDevices: number
  failedLoginAttempts: number
  accountLocked: boolean
  lockoutExpiresAt?: string
}

class MFAService {
  async getMFAMethods(userId: string) {
    const response = await fetch(`/api/mfa/methods?userId=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch MFA methods')
    return response.json()
  }

  async setupTOTP(userId: string, name: string) {
    const response = await fetch('/api/mfa/setup/totp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name })
    })
    if (!response.ok) throw new Error('Failed to setup TOTP')
    return response.json()
  }

  async verifyTOTPSetup(userId: string, secret: string, code: string) {
    const response = await fetch('/api/mfa/verify/totp-setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, secret, code })
    })
    if (!response.ok) throw new Error('Failed to verify TOTP setup')
    return response.json()
  }

  async setupSMS(userId: string, phoneNumber: string) {
    const response = await fetch('/api/mfa/setup/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, phoneNumber })
    })
    if (!response.ok) throw new Error('Failed to setup SMS MFA')
    return response.json()
  }

  async generateBackupCodes(userId: string) {
    const response = await fetch('/api/mfa/backup-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
    if (!response.ok) throw new Error('Failed to generate backup codes')
    return response.json()
  }

  async disableMFAMethod(methodId: string) {
    const response = await fetch(`/api/mfa/methods/${methodId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to disable MFA method')
    return response.json()
  }

  async setPrimaryMFAMethod(methodId: string) {
    const response = await fetch(`/api/mfa/methods/${methodId}/primary`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to set primary MFA method')
    return response.json()
  }

  async initiateMFAChallenge(userId: string, preferredMethod?: string) {
    const response = await fetch('/api/mfa/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, preferredMethod })
    })
    if (!response.ok) throw new Error('Failed to initiate MFA challenge')
    return response.json()
  }

  async verifyMFAChallenge(challengeId: string, code: string) {
    const response = await fetch('/api/mfa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, code })
    })
    if (!response.ok) throw new Error('Failed to verify MFA challenge')
    return response.json()
  }

  async getPasswordPolicy() {
    const response = await fetch('/api/mfa/password-policy')
    if (!response.ok) throw new Error('Failed to fetch password policy')
    return response.json()
  }

  async updatePasswordPolicy(policy: Partial<PasswordPolicy>) {
    const response = await fetch('/api/mfa/password-policy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy)
    })
    if (!response.ok) throw new Error('Failed to update password policy')
    return response.json()
  }

  async getSecurityQuestions() {
    const response = await fetch('/api/mfa/security-questions')
    if (!response.ok) throw new Error('Failed to fetch security questions')
    return response.json()
  }

  async setSecurityQuestions(userId: string, questionsAndAnswers: Array<{ questionId: string; answer: string }>) {
    const response = await fetch('/api/mfa/security-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, questionsAndAnswers })
    })
    if (!response.ok) throw new Error('Failed to set security questions')
    return response.json()
  }

  async getUserSecuritySettings(userId: string) {
    const response = await fetch(`/api/mfa/user-settings?userId=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch user security settings')
    return response.json()
  }

  async unlockAccount(userId: string, adminUserId: string, reason: string) {
    const response = await fetch('/api/mfa/unlock-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, adminUserId, reason })
    })
    if (!response.ok) throw new Error('Failed to unlock account')
    return response.json()
  }
}

export const mfaService = new MFAService()