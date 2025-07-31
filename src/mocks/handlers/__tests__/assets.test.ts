import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { assetHandlers } from '../assets'

const server = setupServer(...assetHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Asset Handlers', () => {
  describe('GET /api/assets', () => {
    it('should return paginated assets list', async () => {
      const response = await fetch('/api/assets?page=1&limit=10')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.meta).toBeDefined()
      expect(data.meta.page).toBe(1)
      expect(data.meta.limit).toBe(10)
      
      if (data.data.length > 0) {
        const asset = data.data[0]
        expect(asset.id).toBeDefined()
        expect(asset.name).toBeDefined()
        expect(asset.category).toBeDefined()
        expect(asset.status).toBeDefined()
        expect(asset.value).toBeDefined()
      }
    })

    it('should filter assets by category', async () => {
      const response = await fetch('/api/assets?category=hardware')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter assets by status', async () => {
      const response = await fetch('/api/assets?status=available')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter assets by location', async () => {
      const response = await fetch('/api/assets?location=Office A')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should search assets by name', async () => {
      const response = await fetch('/api/assets?search=laptop')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('GET /api/assets/:id', () => {
    it('should return specific asset', async () => {
      // First get an asset ID
      const listResponse = await fetch('/api/assets')
      const listData = await listResponse.json()
      
      if (listData.data.length > 0) {
        const assetId = listData.data[0].id
        const response = await fetch(`/api/assets/${assetId}`)

        expect(response.ok).toBe(true)
        const data = await response.json()
        expect(data.data.id).toBe(assetId)
        expect(data.data.name).toBeDefined()
      }
    })

    it('should return 404 for non-existent asset', async () => {
      const response = await fetch('/api/assets/non-existent')

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Asset not found')
    })
  })

  describe('POST /api/assets', () => {
    it('should create new asset', async () => {
      const newAsset = {
        name: 'Dell Laptop XPS 13',
        category: 'hardware',
        serialNumber: 'DL2024001',
        model: 'XPS 13',
        manufacturer: 'Dell',
        purchaseDate: '2024-01-15',
        value: 1200,
        location: 'Office A',
        department: 'IT',
        warranty: '2026-01-15'
      }

      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.data.id).toBeDefined()
      expect(data.data.assetTag).toBeDefined()
      expect(data.data.name).toBe(newAsset.name)
      expect(data.data.status).toBe('available')
    })
  })

  describe('PUT /api/assets/:id', () => {
    it('should update existing asset', async () => {
      // First create an asset
      const newAsset = {
        name: 'Test Asset for Update',
        category: 'hardware',
        serialNumber: 'TEST001',
        value: 500,
        location: 'Test Location'
      }

      const createResponse = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset)
      })
      const createData = await createResponse.json()
      const assetId = createData.data.id

      const updates = {
        name: 'Updated Asset Name',
        location: 'Updated Location',
        value: 600
      }

      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.name).toBe(updates.name)
      expect(data.data.location).toBe(updates.location)
      expect(data.data.value).toBe(updates.value)
    })
  })

  describe('POST /api/assets/:id/assign', () => {
    it('should assign asset to employee', async () => {
      // First create an asset
      const newAsset = {
        name: 'Asset for Assignment',
        category: 'hardware',
        serialNumber: 'ASSIGN001',
        value: 800
      }

      const createResponse = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset)
      })
      const createData = await createResponse.json()
      const assetId = createData.data.id

      const assignment = {
        employeeId: 'emp-001',
        assignedBy: 'manager-001',
        notes: 'Assigned for project work'
      }

      const response = await fetch(`/api/assets/${assetId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.assignment.assetId).toBe(assetId)
      expect(data.assignment.employeeId).toBe(assignment.employeeId)
      expect(data.assignment.status).toBe('assigned')
      expect(data.asset.status).toBe('assigned')
    })
  })

  describe('POST /api/assets/:id/return', () => {
    it('should return assigned asset', async () => {
      // First create and assign an asset
      const newAsset = {
        name: 'Asset for Return',
        category: 'hardware',
        serialNumber: 'RETURN001',
        value: 700
      }

      const createResponse = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset)
      })
      const createData = await createResponse.json()
      const assetId = createData.data.id

      // Assign the asset
      await fetch(`/api/assets/${assetId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: 'emp-001',
          assignedBy: 'manager-001'
        })
      })

      const returnData = {
        returnedBy: 'manager-001',
        condition: 'good',
        notes: 'Returned in good condition'
      }

      const response = await fetch(`/api/assets/${assetId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnData)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.assignment.status).toBe('returned')
      expect(data.asset.status).toBe('available')
    })
  })

  describe('GET /api/assets/categories', () => {
    it('should return asset categories', async () => {
      const response = await fetch('/api/assets/categories')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const category = data.data[0]
        expect(category.id).toBeDefined()
        expect(category.name).toBeDefined()
        expect(category.description).toBeDefined()
      }
    })
  })

  describe('GET /api/assets/assignments', () => {
    it('should return asset assignments', async () => {
      const response = await fetch('/api/assets/assignments')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const assignment = data.data[0]
        expect(assignment.id).toBeDefined()
        expect(assignment.assetId).toBeDefined()
        expect(assignment.employeeId).toBeDefined()
        expect(assignment.status).toBeDefined()
      }
    })

    it('should filter assignments by employee', async () => {
      const response = await fetch('/api/assets/assignments?employeeId=emp-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter assignments by asset', async () => {
      const response = await fetch('/api/assets/assignments?assetId=asset-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter assignments by status', async () => {
      const response = await fetch('/api/assets/assignments?status=assigned')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('GET /api/assets/maintenance', () => {
    it('should return maintenance records', async () => {
      const response = await fetch('/api/assets/maintenance')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const maintenance = data.data[0]
        expect(maintenance.id).toBeDefined()
        expect(maintenance.assetId).toBeDefined()
        expect(maintenance.type).toBeDefined()
        expect(maintenance.status).toBeDefined()
      }
    })

    it('should filter maintenance by asset', async () => {
      const response = await fetch('/api/assets/maintenance?assetId=asset-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter maintenance by status', async () => {
      const response = await fetch('/api/assets/maintenance?status=completed')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter maintenance by type', async () => {
      const response = await fetch('/api/assets/maintenance?type=preventive')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('GET /api/assets/stats', () => {
    it('should return asset statistics', async () => {
      const response = await fetch('/api/assets/stats')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.totalAssets).toBeGreaterThanOrEqual(0)
      expect(data.data.availableAssets).toBeGreaterThanOrEqual(0)
      expect(data.data.assignedAssets).toBeGreaterThanOrEqual(0)
      expect(data.data.maintenanceAssets).toBeGreaterThanOrEqual(0)
      expect(data.data.totalValue).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(data.data.byCategory)).toBe(true)
      expect(Array.isArray(data.data.byLocation)).toBe(true)
      expect(Array.isArray(data.data.byDepartment)).toBe(true)
    })
  })
})