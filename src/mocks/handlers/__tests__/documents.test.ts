import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { documentHandlers } from '@/mocks/handlers/documents'

// Test server setup
const server = setupServer(...documentHandlers)

describe('Documents Handlers', () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  describe('GET /api/documents', () => {
    it('returns list of documents', async () => {
      const response = await fetch('/api/documents')
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
      
      // Verify document structure
      const document = data[0]
      expect(document).toHaveProperty('id')
      expect(document).toHaveProperty('name')
      expect(document).toHaveProperty('type')
      expect(document).toHaveProperty('size')
      expect(document).toHaveProperty('uploadDate')
      expect(document).toHaveProperty('category')
    })

    it('supports search query parameter', async () => {
      const response = await fetch('/api/documents?search=handbook')
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      
      // Should filter results based on search term
      data.forEach(doc => {
        expect(doc.name.toLowerCase()).toMatch(/handbook/i)
      })
    })

    it('supports category filtering', async () => {
      const response = await fetch('/api/documents?category=policies')
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      
      data.forEach(doc => {
        expect(doc.category.toLowerCase()).toMatch(/policies/i)
      })
    })

    it('supports pagination', async () => {
      const response = await fetch('/api/documents?page=1&limit=5')
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeLessThanOrEqual(5)
    })
  })

  describe('GET /api/documents/:id', () => {
    it('returns specific document', async () => {
      const response = await fetch('/api/documents/doc1')
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('id', 'doc1')
      expect(data).toHaveProperty('name')
      expect(data).toHaveProperty('content')
      expect(data).toHaveProperty('metadata')
    })

    it('returns 404 for non-existent document', async () => {
      const response = await fetch('/api/documents/nonexistent')
      
      expect(response.status).toBe(404)
      
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/not found/i)
    })
  })

  describe('POST /api/documents', () => {
    it('creates new document', async () => {
      const newDocument = {
        name: 'test-document.pdf',
        type: 'policy',
        category: 'HR Policies',
        content: 'base64encodedcontent'
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDocument)
      })
      
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('name', newDocument.name)
      expect(data).toHaveProperty('uploadDate')
      expect(data).toHaveProperty('size')
    })

    it('validates required fields', async () => {
      const invalidDocument = {
        type: 'policy'
        // Missing required name field
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidDocument)
      })
      
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/name.*required/i)
    })

    it('validates file size limits', async () => {
      const largeDocument = {
        name: 'large-file.pdf',
        type: 'document',
        category: 'General',
        content: 'a'.repeat(10 * 1024 * 1024) // 10MB
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(largeDocument)
      })
      
      expect(response.status).toBe(413)
      
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/file.*too large/i)
    })
  })

  describe('PUT /api/documents/:id', () => {
    it('updates existing document', async () => {
      const updates = {
        name: 'updated-document.pdf',
        category: 'Updated Category'
      }

      const response = await fetch('/api/documents/doc1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('id', 'doc1')
      expect(data).toHaveProperty('name', updates.name)
      expect(data).toHaveProperty('category', updates.category)
      expect(data).toHaveProperty('updatedDate')
    })

    it('returns 404 for non-existent document', async () => {
      const updates = { name: 'new-name.pdf' }

      const response = await fetch('/api/documents/nonexistent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/documents/:id', () => {
    it('deletes existing document', async () => {
      const response = await fetch('/api/documents/doc1', {
        method: 'DELETE'
      })
      
      expect(response.status).toBe(204)
    })

    it('returns 404 for non-existent document', async () => {
      const response = await fetch('/api/documents/nonexistent', {
        method: 'DELETE'
      })
      
      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/documents/:id/download', () => {
    it('provides download link', async () => {
      const response = await fetch('/api/documents/doc1/download')
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('downloadUrl')
      expect(data).toHaveProperty('expiresAt')
      expect(data.downloadUrl).toMatch(/^https?:\/\//)
    })

    it('handles download errors', async () => {
      const response = await fetch('/api/documents/nonexistent/download')
      
      expect(response.status).toBe(404)
    })
  })

  describe('Error Handling', () => {
    it('handles server errors gracefully', async () => {
      // Override handler to simulate server error
      server.use(
        http.get('/api/documents', () => {
          return HttpResponse.json({ error: 'Internal server error' }, { status: 500 })
        })
      )

      const response = await fetch('/api/documents')
      
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    it('validates content type for uploads', async () => {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'invalid content'
      })
      
      expect(response.status).toBe(400)
    })
  })

  describe('Security', () => {
    it('requires authentication for sensitive operations', async () => {
      const response = await fetch('/api/documents/doc1', {
        method: 'DELETE'
        // No authorization header
      })
      
      expect(response.status).toBe(401)
    })

    it('validates file types', async () => {
      const maliciousFile = {
        name: 'malicious.exe',
        type: 'executable',
        category: 'General',
        content: 'malicious content'
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maliciousFile)
      })
      
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toMatch(/file type.*not allowed/i)
    })
  })
})