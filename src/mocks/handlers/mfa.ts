import { http, HttpResponse } from 'msw'
import { MFAMethod, MFASetupResponse, MFAChallenge, PasswordPolicy, SecurityQuestion, UserSecuritySettings } from '../../services/mfaService'

// Mock data
let mfaMethods: MFAMethod[] = [
  {
    id: 'mfa_1',
    userId: '1',
    type: 'totp',
    name: 'Google Authenticator',
    isEnabled: true,
    isPrimary: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: { issuer: 'HR System' }
  },
  {
    id: 'mfa_2',
    userId: '1',
    type: 'backup_codes',
    name: 'Backup Codes',
    isEnabled: true,
    isPrimary: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { codesRemaining: 8 }
  },
  {
    id: 'mfa_3',
    userId: '2',
    type: 'sms',
    name: 'SMS to +1****1234',
    isEnabled: true,
    isPrimary: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { phoneNumber: '+1****1234' }
  }
]

let activeChallenges: MFAChallenge[] = []

const passwordPolicy: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90, // 90 days
  historyCount: 5,
  lockoutThreshold: 5,
  lockoutDuration: 30 // 30 minutes
}

const securityQuestions: SecurityQuestion[] = [
  { id: 'sq_1', question: 'What was the name of your first pet?', isCustom: false },
  { id: 'sq_2', question: 'In what city were you born?', isCustom: false },
  { id: 'sq_3', question: 'What was your mother\'s maiden name?', isCustom: false },
  { id: 'sq_4', question: 'What was the make of your first car?', isCustom: false },
  { id: 'sq_5', question: 'What elementary school did you attend?', isCustom: false }
]

let userSecuritySettings: UserSecuritySettings[] = [
  {
    userId: '1',
    mfaEnabled: true,
    mfaMethods: mfaMethods.filter(m => m.userId === '1'),
    passwordLastChanged: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    securityQuestions: [
      { questionId: 'sq_1', question: 'What was the name of your first pet?', hasAnswer: true },
      { questionId: 'sq_2', question: 'In what city were you born?', hasAnswer: true }
    ],
    trustedDevices: 2,
    failedLoginAttempts: 0,
    accountLocked: false
  },
  {
    userId: '2',
    mfaEnabled: true,
    mfaMethods: mfaMethods.filter(m => m.userId === '2'),
    passwordLastChanged: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    securityQuestions: [
      { questionId: 'sq_3', question: 'What was your mother\'s maiden name?', hasAnswer: true }
    ],
    trustedDevices: 1,
    failedLoginAttempts: 2,
    accountLocked: false
  }
]

export const mfaHandlers = [
  // Get MFA methods
  http.get('/api/mfa/methods', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return HttpResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const userMethods = mfaMethods.filter(method => method.userId === userId)
    return HttpResponse.json({ data: userMethods })
  }),

  // Setup TOTP
  http.post('/api/mfa/setup/totp', async ({ request }) => {
    const body = await request.json() as { userId: string; name: string }
    const { userId, name } = body
    
    // Generate mock TOTP secret and QR code
    const secret = 'JBSWY3DPEHPK3PXP' // Mock secret
    const qrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' // Mock QR code
    const backupCodes = [
      '12345678', '23456789', '34567890', '45678901', '56789012',
      '67890123', '78901234', '89012345', '90123456', '01234567'
    ]

    const newMethod: MFAMethod = {
      id: `mfa_${Date.now()}`,
      userId,
      type: 'totp',
      name,
      isEnabled: false, // Will be enabled after verification
      isPrimary: false,
      createdAt: new Date().toISOString(),
      metadata: { secret, issuer: 'HR System' }
    }

    const response: MFASetupResponse = {
      secret,
      qrCode,
      backupCodes,
      method: newMethod
    }

    return HttpResponse.json({ data: response })
  }),

  // Verify TOTP setup
  http.post('/api/mfa/verify/totp-setup', async ({ request }) => {
    const body = await request.json() as { userId: string; secret: string; code: string }
    const { userId, secret, code } = body
    
    // Mock verification - accept any 6-digit code
    if (!/^\d{6}$/.test(code)) {
      return HttpResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    const method: MFAMethod = {
      id: `mfa_${Date.now()}`,
      userId,
      type: 'totp',
      name: 'TOTP Authenticator',
      isEnabled: true,
      isPrimary: mfaMethods.filter(m => m.userId === userId && m.isEnabled).length === 0,
      createdAt: new Date().toISOString(),
      metadata: { secret, issuer: 'HR System' }
    }

    mfaMethods.push(method)

    // Update user security settings
    const userSettingsIndex = userSecuritySettings.findIndex(s => s.userId === userId)
    if (userSettingsIndex !== -1) {
      userSecuritySettings[userSettingsIndex].mfaEnabled = true
      userSecuritySettings[userSettingsIndex].mfaMethods.push(method)
    }

    return HttpResponse.json({ data: method })
  }),

  // Setup SMS
  http.post('/api/mfa/setup/sms', async ({ request }) => {
    const body = await request.json() as { userId: string; phoneNumber: string }
    const { userId, phoneNumber } = body

    const maskedPhone = phoneNumber.replace(/(\d{2})\d+(\d{4})/, '$1****$2')
    
    const method: MFAMethod = {
      id: `mfa_${Date.now()}`,
      userId,
      type: 'sms',
      name: `SMS to ${maskedPhone}`,
      isEnabled: true,
      isPrimary: mfaMethods.filter(m => m.userId === userId && m.isEnabled).length === 0,
      createdAt: new Date().toISOString(),
      metadata: { phoneNumber: maskedPhone }
    }

    mfaMethods.push(method)
    return HttpResponse.json({ data: method })
  }),

  // Generate backup codes
  http.post('/api/mfa/backup-codes', async ({ request }) => {
    const { userId } = await request.json()

    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )

    const method: MFAMethod = {
      id: `mfa_backup_${Date.now()}`,
      userId,
      type: 'backup_codes',
      name: 'Backup Codes',
      isEnabled: true,
      isPrimary: false,
      createdAt: new Date().toISOString(),
      metadata: { codesRemaining: 10 }
    }

    mfaMethods.push(method)
    return HttpResponse.json({ data: { method, backupCodes } })
  }),

  // Disable MFA method
  http.delete('/api/mfa/methods/:methodId', ({ params }) => {
    const { methodId } = params
    const methodIndex = mfaMethods.findIndex(m => m.id === methodId)
    
    if (methodIndex === -1) {
      return HttpResponse.json({ error: 'Method not found' }, { status: 404 })
    }

    mfaMethods.splice(methodIndex, 1)
    return HttpResponse.json({ message: 'MFA method disabled successfully' })
  }),

  // Set primary MFA method
  http.post('/api/mfa/methods/:methodId/primary', ({ params }) => {
    const { methodId } = params
    const method = mfaMethods.find(m => m.id === methodId)
    
    if (!method) {
      return HttpResponse.json({ error: 'Method not found' }, { status: 404 })
    }

    // Remove primary status from other methods for this user
    mfaMethods.forEach(m => {
      if (m.userId === method.userId) {
        m.isPrimary = m.id === methodId
      }
    })

    return HttpResponse.json({ data: method })
  }),

  // Initiate MFA challenge
  http.post('/api/mfa/challenge', async ({ request }) => {
    const { userId, preferredMethod } = await request.json()

    const userMethods = mfaMethods.filter(m => m.userId === userId && m.isEnabled)
    if (userMethods.length === 0) {
      return HttpResponse.json({ error: 'No MFA methods available' }, { status: 400 })
    }

    const method = preferredMethod 
      ? userMethods.find(m => m.type === preferredMethod)
      : userMethods.find(m => m.isPrimary) || userMethods[0]

    if (!method) {
      return HttpResponse.json({ error: 'Preferred method not available' }, { status: 400 })
    }

    const challenge: MFAChallenge = {
      id: `challenge_${Date.now()}`,
      type: method.type === 'backup_codes' ? 'backup_code' : method.type === 'hardware_key' ? 'totp' : method.type,
      maskedDestination: method.type === 'sms' ? method.metadata?.phoneNumber : undefined,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      attemptsRemaining: 3
    }

    activeChallenges.push(challenge)
    return HttpResponse.json({ data: challenge })
  }),

  // Verify MFA challenge
  http.post('/api/mfa/verify', async ({ request }) => {
    const { challengeId, code } = await request.json()

    const challengeIndex = activeChallenges.findIndex(c => c.id === challengeId)
    if (challengeIndex === -1) {
      return HttpResponse.json({ error: 'Challenge not found or expired' }, { status: 400 })
    }

    const challenge = activeChallenges[challengeIndex]
    
    // Check if challenge is expired
    if (new Date(challenge.expiresAt) < new Date()) {
      activeChallenges.splice(challengeIndex, 1)
      return HttpResponse.json({ error: 'Challenge expired' }, { status: 400 })
    }

    // Mock verification - accept specific codes or any 6-digit number
    const validCodes = ['123456', '000000', 'backup1', 'backup2']
    const isValid = validCodes.includes(code) || /^\d{6}$/.test(code)

    if (!isValid) {
      challenge.attemptsRemaining--
      if (challenge.attemptsRemaining <= 0) {
        activeChallenges.splice(challengeIndex, 1)
        return HttpResponse.json({ error: 'Too many failed attempts' }, { status: 400 })
      }
      return HttpResponse.json({ error: 'Invalid verification code', attemptsRemaining: challenge.attemptsRemaining }, { status: 400 })
    }

    // Remove challenge after successful verification
    activeChallenges.splice(challengeIndex, 1)
    return HttpResponse.json({ data: { verified: true } })
  }),

  // Get password policy
  http.get('/api/mfa/password-policy', () => {
    return HttpResponse.json({ data: passwordPolicy })
  }),

  // Update password policy
  http.put('/api/mfa/password-policy', async ({ request }) => {
    const update = await request.json()
    Object.assign(passwordPolicy, update)
    return HttpResponse.json({ data: passwordPolicy })
  }),

  // Get security questions
  http.get('/api/mfa/security-questions', () => {
    return HttpResponse.json({ data: securityQuestions })
  }),

  // Set security questions
  http.post('/api/mfa/security-questions', async ({ request }) => {
    const { userId, questionsAndAnswers } = await request.json()

    // Update user security settings
    const userSettingsIndex = userSecuritySettings.findIndex(s => s.userId === userId)
    if (userSettingsIndex !== -1) {
      userSecuritySettings[userSettingsIndex].securityQuestions = questionsAndAnswers.map((qa: any) => {
        const question = securityQuestions.find(sq => sq.id === qa.questionId)
        return {
          questionId: qa.questionId,
          question: question?.question || 'Custom question',
          hasAnswer: true
        }
      })
    }

    return HttpResponse.json({ message: 'Security questions set successfully' })
  }),

  // Get user security settings
  http.get('/api/mfa/user-settings', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return HttpResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const settings = userSecuritySettings.find(s => s.userId === userId)
    if (!settings) {
      return HttpResponse.json({ error: 'User settings not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: settings })
  }),

  // Unlock account
  http.post('/api/mfa/unlock-account', async ({ request }) => {
    const { userId, adminUserId, reason } = await request.json()

    const userSettingsIndex = userSecuritySettings.findIndex(s => s.userId === userId)
    if (userSettingsIndex === -1) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }

    userSecuritySettings[userSettingsIndex].accountLocked = false
    userSecuritySettings[userSettingsIndex].failedLoginAttempts = 0
    userSecuritySettings[userSettingsIndex].lockoutExpiresAt = undefined

    return HttpResponse.json({ 
      message: 'Account unlocked successfully',
      data: userSecuritySettings[userSettingsIndex]
    })
  })
]