import { http, delay } from 'msw'
import { 
  generateAssets,
  generateAssetAssignments,
  generateAssetMaintenance,
  mockAssetCategories,
  Asset,
  AssetAssignment,
  AssetMaintenance,
  AssetCategory
} from '../data/assets'
import { mockEmployees } from '../data/employees'

// Generate mock data
const employeeIds = mockEmployees.map(emp => emp.id)
const assets = generateAssets(employeeIds, 100)
const assetAssignments = generateAssetAssignments(assets.map(a => a.id), employeeIds, 50)
const assetMaintenance = generateAssetMaintenance(assets.map(a => a.id), employeeIds, 30)

export const assetHandlers = [
  // Get assets
  http.get('/api/assets', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')
    const assignedTo = url.searchParams.get('assignedTo')
    const location = url.searchParams.get('location')
    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    
    let filtered = [...assets]
    
    if (category) {
      filtered = filtered.filter(asset => asset.category.id === category || asset.type === category)
    }
    
    if (status) {
      filtered = filtered.filter(asset => asset.status === status)
    }
    
    if (assignedTo) {
      filtered = filtered.filter(asset => asset.assignedTo === assignedTo)
    }
    
    if (location) {
      filtered = filtered.filter(asset => asset.location.toLowerCase().includes(location.toLowerCase()))
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(searchLower) ||
        asset.assetTag.toLowerCase().includes(searchLower) ||
        asset.brand.toLowerCase().includes(searchLower) ||
        asset.model.toLowerCase().includes(searchLower) ||
        asset.serialNumber.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort by updated date
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    
    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAssets = filtered.slice(startIndex, endIndex)
    
    return Response.json({
      data: paginatedAssets,
      meta: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
      message: 'Assets retrieved successfully'
    })
  }),

  // Get asset by ID
  http.get('/api/assets/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const asset = assets.find(a => a.id === params.id)
    
    if (!asset) {
      return new Response('Asset not found', { status: 404 })
    }
    
    return Response.json({
      data: asset,
      message: 'Asset retrieved successfully'
    })
  }),

  // Create asset
  http.post('/api/assets', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<Asset>
    
    const newAsset: Asset = {
      id: `asset-${assets.length + 1}`,
      assetTag: data.assetTag || `AST-${String(assets.length + 1).padStart(4, '0')}`,
      name: data.name!,
      description: data.description || '',
      category: data.category || mockAssetCategories[0],
      type: data.type || 'equipment',
      brand: data.brand || '',
      model: data.model || '',
      serialNumber: data.serialNumber || '',
      purchaseDate: data.purchaseDate || new Date().toISOString(),
      purchasePrice: data.purchasePrice || 0,
      warrantyExpiry: data.warrantyExpiry,
      status: data.status || 'available',
      condition: data.condition || 'good',
      location: data.location || 'Main Office',
      department: data.department || 'IT',
      assignedTo: data.assignedTo,
      assignedDate: data.assignedDate,
      specifications: data.specifications || {},
      maintenanceHistory: [],
      photos: data.photos || [],
      documents: data.documents || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    assets.push(newAsset)
    
    return Response.json({
      data: newAsset,
      message: 'Asset created successfully'
    })
  }),

  // Update asset
  http.put('/api/assets/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<Asset>
    const assetIndex = assets.findIndex(a => a.id === params.id)
    
    if (assetIndex === -1) {
      return new Response('Asset not found', { status: 404 })
    }
    
    const updatedAsset = {
      ...assets[assetIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    assets[assetIndex] = updatedAsset
    
    return Response.json({
      data: updatedAsset,
      message: 'Asset updated successfully'
    })
  }),

  // Delete asset
  http.delete('/api/assets/:id', async ({ params }) => {
    await delay(Math.random() * 300 + 100)
    
    const assetIndex = assets.findIndex(a => a.id === params.id)
    
    if (assetIndex === -1) {
      return new Response('Asset not found', { status: 404 })
    }
    
    assets.splice(assetIndex, 1)
    
    return Response.json({
      message: 'Asset deleted successfully'
    })
  }),

  // Assign asset
  http.post('/api/assets/:id/assign', async ({ params, request }) => {
    await delay(Math.random() * 300 + 100)
    
    const { employeeId, assignedBy, notes } = await request.json() as {
      employeeId: string
      assignedBy: string
      notes?: string
    }
    
    const assetIndex = assets.findIndex(a => a.id === params.id)
    
    if (assetIndex === -1) {
      return new Response('Asset not found', { status: 404 })
    }
    
    if (assets[assetIndex].status === 'assigned') {
      return new Response('Asset is already assigned', { status: 400 })
    }
    
    // Update asset
    assets[assetIndex] = {
      ...assets[assetIndex],
      status: 'assigned',
      assignedTo: employeeId,
      assignedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    // Create assignment record
    const newAssignment: AssetAssignment = {
      id: `assignment-${assetAssignments.length + 1}`,
      assetId: params.id as string,
      employeeId,
      assignedBy,
      assignedDate: new Date().toISOString(),
      condition: assets[assetIndex].condition,
      notes: notes || '',
      acknowledgedByEmployee: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    assetAssignments.push(newAssignment)
    
    return Response.json({
      data: { asset: assets[assetIndex], assignment: newAssignment },
      message: 'Asset assigned successfully'
    })
  }),

  // Return asset
  http.post('/api/assets/:id/return', async ({ params, request }) => {
    await delay(Math.random() * 300 + 100)
    
    const { returnedBy, condition, notes } = await request.json() as {
      returnedBy: string
      condition: string
      notes?: string
    }
    
    const assetIndex = assets.findIndex(a => a.id === params.id)
    
    if (assetIndex === -1) {
      return new Response('Asset not found', { status: 404 })
    }
    
    if (assets[assetIndex].status !== 'assigned') {
      return new Response('Asset is not currently assigned', { status: 400 })
    }
    
    // Update asset
    assets[assetIndex] = {
      ...assets[assetIndex],
      status: 'available',
      condition: condition as any,
      assignedTo: undefined,
      assignedDate: undefined,
      updatedAt: new Date().toISOString(),
    }
    
    // Update assignment record
    const assignmentIndex = assetAssignments.findIndex(
      a => a.assetId === params.id && a.status === 'active'
    )
    
    if (assignmentIndex !== -1) {
      assetAssignments[assignmentIndex] = {
        ...assetAssignments[assignmentIndex],
        returnDate: new Date().toISOString(),
        returnedBy,
        condition,
        notes: notes || assetAssignments[assignmentIndex].notes,
        status: 'returned',
        updatedAt: new Date().toISOString(),
      }
    }
    
    return Response.json({
      data: assets[assetIndex],
      message: 'Asset returned successfully'
    })
  }),

  // Get asset categories
  http.get('/api/assets/categories', async () => {
    await delay(Math.random() * 200 + 50)
    
    return Response.json({
      data: mockAssetCategories,
      message: 'Asset categories retrieved successfully'
    })
  }),

  // Create asset category
  http.post('/api/assets/categories', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const data = await request.json() as Partial<AssetCategory>
    
    const newCategory: AssetCategory = {
      id: `cat-${mockAssetCategories.length + 1}`,
      name: data.name!,
      description: data.description || '',
      code: data.code || data.name!.substring(0, 3).toUpperCase(),
      parentId: data.parentId,
      depreciationRate: data.depreciationRate || 0,
      usefulLife: data.usefulLife || 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    mockAssetCategories.push(newCategory)
    
    return Response.json({
      data: newCategory,
      message: 'Asset category created successfully'
    })
  }),

  // Get asset assignments
  http.get('/api/assets/assignments', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const assetId = url.searchParams.get('assetId')
    const status = url.searchParams.get('status')
    
    let filtered = [...assetAssignments]
    
    if (employeeId) {
      filtered = filtered.filter(assignment => assignment.employeeId === employeeId)
    }
    
    if (assetId) {
      filtered = filtered.filter(assignment => assignment.assetId === assetId)
    }
    
    if (status) {
      filtered = filtered.filter(assignment => assignment.status === status)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime()),
      message: 'Asset assignments retrieved successfully'
    })
  }),

  // Acknowledge asset assignment
  http.put('/api/assets/assignments/:id/acknowledge', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const assignmentIndex = assetAssignments.findIndex(a => a.id === params.id)
    
    if (assignmentIndex === -1) {
      return new Response('Asset assignment not found', { status: 404 })
    }
    
    assetAssignments[assignmentIndex] = {
      ...assetAssignments[assignmentIndex],
      acknowledgedByEmployee: true,
      acknowledgedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    return Response.json({
      data: assetAssignments[assignmentIndex],
      message: 'Asset assignment acknowledged successfully'
    })
  }),

  // Get asset maintenance
  http.get('/api/assets/maintenance', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const assetId = url.searchParams.get('assetId')
    const status = url.searchParams.get('status')
    const type = url.searchParams.get('type')
    
    let filtered = [...assetMaintenance]
    
    if (assetId) {
      filtered = filtered.filter(maintenance => maintenance.assetId === assetId)
    }
    
    if (status) {
      filtered = filtered.filter(maintenance => maintenance.status === status)
    }
    
    if (type) {
      filtered = filtered.filter(maintenance => maintenance.type === type)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()),
      message: 'Asset maintenance records retrieved successfully'
    })
  }),

  // Create maintenance record
  http.post('/api/assets/maintenance', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<AssetMaintenance>
    
    const newMaintenance: AssetMaintenance = {
      id: `maintenance-${assetMaintenance.length + 1}`,
      assetId: data.assetId!,
      type: data.type || 'routine',
      description: data.description || '',
      scheduledDate: data.scheduledDate!,
      cost: data.cost || 0,
      vendor: data.vendor,
      performedBy: data.performedBy!,
      notes: data.notes,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    assetMaintenance.push(newMaintenance)
    
    return Response.json({
      data: newMaintenance,
      message: 'Maintenance record created successfully'
    })
  }),

  // Update maintenance record
  http.put('/api/assets/maintenance/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<AssetMaintenance>
    const maintenanceIndex = assetMaintenance.findIndex(m => m.id === params.id)
    
    if (maintenanceIndex === -1) {
      return new Response('Maintenance record not found', { status: 404 })
    }
    
    const updatedMaintenance = {
      ...assetMaintenance[maintenanceIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    if (data.status === 'completed' && !updatedMaintenance.completedDate) {
      updatedMaintenance.completedDate = new Date().toISOString()
    }
    
    assetMaintenance[maintenanceIndex] = updatedMaintenance
    
    return Response.json({
      data: updatedMaintenance,
      message: 'Maintenance record updated successfully'
    })
  }),

  // Get asset statistics
  http.get('/api/assets/stats', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const department = url.searchParams.get('department')
    const location = url.searchParams.get('location')
    
    let filtered = [...assets]
    
    if (department) {
      filtered = filtered.filter(asset => asset.department === department)
    }
    
    if (location) {
      filtered = filtered.filter(asset => asset.location === location)
    }
    
    const stats = {
      total: filtered.length,
      available: filtered.filter(a => a.status === 'available').length,
      assigned: filtered.filter(a => a.status === 'assigned').length,
      maintenance: filtered.filter(a => a.status === 'maintenance').length,
      retired: filtered.filter(a => a.status === 'retired').length,
      lost: filtered.filter(a => a.status === 'lost').length,
      totalValue: filtered.reduce((sum, a) => sum + a.purchasePrice, 0),
      byCategory: filtered.reduce((acc, asset) => {
        const category = asset.category.name
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byLocation: filtered.reduce((acc, asset) => {
        acc[asset.location] = (acc[asset.location] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byDepartment: filtered.reduce((acc, asset) => {
        acc[asset.department] = (acc[asset.department] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      maintenanceStats: {
        scheduled: assetMaintenance.filter(m => m.status === 'scheduled').length,
        inProgress: assetMaintenance.filter(m => m.status === 'in-progress').length,
        completed: assetMaintenance.filter(m => m.status === 'completed').length,
        overdue: assetMaintenance.filter(m => 
          m.status === 'scheduled' && new Date(m.scheduledDate) < new Date()
        ).length,
      },
    }
    
    return Response.json({
      data: stats,
      message: 'Asset statistics retrieved successfully'
    })
  }),
]