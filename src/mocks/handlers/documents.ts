import { http, delay } from 'msw'
import { 
  generateFolders,
  generateDocuments,
  generateDocumentPermissions,
  generateFolderPermissions,
  generateDocumentVersions,
  generateDocumentActivity,
  Document,
  Folder,
  DocumentPermission,
  FolderPermission,
  DocumentVersion,
  DocumentActivity
} from '../data/documents'
import { mockEmployees } from '../data/employees'

// Generate mock data
const userIds = mockEmployees.map(emp => emp.id)
const folders = generateFolders(userIds, 20)
const documents = generateDocuments(folders.map(f => f.id), userIds, 100)
const documentPermissions = generateDocumentPermissions(documents.map(d => d.id), userIds, 200)
const folderPermissions = generateFolderPermissions(folders.map(f => f.id), userIds, 100)
const documentVersions = generateDocumentVersions(documents.map(d => d.id), userIds, 150)
const documentActivity = generateDocumentActivity(documents.map(d => d.id), userIds, 500)

export const documentHandlers = [
  // Get folders
  http.get('/api/documents/folders', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const parentId = url.searchParams.get('parentId')
    const search = url.searchParams.get('search')
    const accessLevel = url.searchParams.get('accessLevel')
    
    let filtered = [...folders]
    
    if (parentId === 'root' || parentId === null) {
      filtered = filtered.filter(folder => !folder.parentId)
    } else if (parentId) {
      filtered = filtered.filter(folder => folder.parentId === parentId)
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(folder => 
        folder.name.toLowerCase().includes(searchLower) ||
        folder.description?.toLowerCase().includes(searchLower)
      )
    }
    
    if (accessLevel) {
      filtered = filtered.filter(folder => folder.accessLevel === accessLevel)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => a.name.localeCompare(b.name)),
      message: 'Folders retrieved successfully'
    })
  }),

  // Get folder by ID
  http.get('/api/documents/folders/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const folder = folders.find(f => f.id === params.id)
    
    if (!folder) {
      return new Response('Folder not found', { status: 404 })
    }
    
    return Response.json({
      data: folder,
      message: 'Folder retrieved successfully'
    })
  }),

  // Create folder
  http.post('/api/documents/folders', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<Folder>
    
    const parentFolder = data.parentId ? folders.find(f => f.id === data.parentId) : null
    const path = parentFolder 
      ? `${parentFolder.path}/${data.name!.toLowerCase().replace(/\s+/g, '-')}`
      : `/${data.name!.toLowerCase().replace(/\s+/g, '-')}`
    
    const newFolder: Folder = {
      id: `folder-${folders.length + 1}`,
      name: data.name!,
      description: data.description,
      parentId: data.parentId,
      path,
      color: data.color,
      isShared: data.isShared ?? false,
      accessLevel: data.accessLevel || 'internal',
      createdBy: data.createdBy!,
      updatedBy: data.createdBy!,
      documentsCount: 0,
      size: 0,
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    folders.push(newFolder)
    
    return Response.json({
      data: newFolder,
      message: 'Folder created successfully'
    })
  }),

  // Update folder
  http.put('/api/documents/folders/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<Folder>
    const folderIndex = folders.findIndex(f => f.id === params.id)
    
    if (folderIndex === -1) {
      return new Response('Folder not found', { status: 404 })
    }
    
    const updatedFolder = {
      ...folders[folderIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    folders[folderIndex] = updatedFolder
    
    return Response.json({
      data: updatedFolder,
      message: 'Folder updated successfully'
    })
  }),

  // Delete folder
  http.delete('/api/documents/folders/:id', async ({ params }) => {
    await delay(Math.random() * 300 + 100)
    
    const folderIndex = folders.findIndex(f => f.id === params.id)
    
    if (folderIndex === -1) {
      return new Response('Folder not found', { status: 404 })
    }
    
    // Check if folder has documents or subfolders
    const hasDocuments = documents.some(d => d.folderId === params.id)
    const hasSubfolders = folders.some(f => f.parentId === params.id)
    
    if (hasDocuments || hasSubfolders) {
      return new Response('Cannot delete folder that contains documents or subfolders', { status: 400 })
    }
    
    folders.splice(folderIndex, 1)
    
    return Response.json({
      message: 'Folder deleted successfully'
    })
  }),

  // Get documents
  http.get('/api/documents', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const folderId = url.searchParams.get('folderId')
    const search = url.searchParams.get('search')
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const accessLevel = url.searchParams.get('accessLevel')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    
    let filtered = [...documents]
    
    if (folderId) {
      filtered = filtered.filter(doc => doc.folderId === folderId)
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    
    if (type) {
      filtered = filtered.filter(doc => doc.type === type)
    }
    
    if (status) {
      filtered = filtered.filter(doc => doc.status === status)
    }
    
    if (accessLevel) {
      filtered = filtered.filter(doc => doc.accessLevel === accessLevel)
    }
    
    // Sort by updated date
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    
    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDocs = filtered.slice(startIndex, endIndex)
    
    return Response.json({
      data: paginatedDocs,
      meta: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
      message: 'Documents retrieved successfully'
    })
  }),

  // Get document by ID
  http.get('/api/documents/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const document = documents.find(d => d.id === params.id)
    
    if (!document) {
      return new Response('Document not found', { status: 404 })
    }
    
    // Update last accessed
    const docIndex = documents.findIndex(d => d.id === params.id)
    documents[docIndex] = {
      ...document,
      lastAccessedAt: new Date().toISOString(),
    }
    
    return Response.json({
      data: documents[docIndex],
      message: 'Document retrieved successfully'
    })
  }),

  // Create document
  http.post('/api/documents', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<Document>
    
    const newDocument: Document = {
      id: `doc-${documents.length + 1}`,
      name: data.name!,
      description: data.description,
      folderId: data.folderId,
      type: data.type || 'other',
      mimeType: data.mimeType || 'application/octet-stream',
      size: data.size || 0,
      url: data.url || '#',
      thumbnailUrl: data.thumbnailUrl,
      version: 1,
      status: data.status || 'draft',
      tags: data.tags || [],
      createdBy: data.createdBy!,
      updatedBy: data.createdBy!,
      accessLevel: data.accessLevel || 'internal',
      downloadCount: 0,
      isEncrypted: data.isEncrypted || false,
      checksum: data.checksum || '',
      metadata: data.metadata || {},
      permissions: [],
      versions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    documents.push(newDocument)
    
    // Update folder document count
    if (newDocument.folderId) {
      const folderIndex = folders.findIndex(f => f.id === newDocument.folderId)
      if (folderIndex !== -1) {
        folders[folderIndex].documentsCount += 1
        folders[folderIndex].size += newDocument.size
      }
    }
    
    return Response.json({
      data: newDocument,
      message: 'Document created successfully'
    })
  }),

  // Update document
  http.put('/api/documents/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<Document>
    const docIndex = documents.findIndex(d => d.id === params.id)
    
    if (docIndex === -1) {
      return new Response('Document not found', { status: 404 })
    }
    
    const oldDocument = documents[docIndex]
    const updatedDocument = {
      ...oldDocument,
      ...data,
      version: data.version || oldDocument.version + 1,
      updatedAt: new Date().toISOString(),
    }
    
    documents[docIndex] = updatedDocument
    
    return Response.json({
      data: updatedDocument,
      message: 'Document updated successfully'
    })
  }),

  // Delete document
  http.delete('/api/documents/:id', async ({ params }) => {
    await delay(Math.random() * 300 + 100)
    
    const docIndex = documents.findIndex(d => d.id === params.id)
    
    if (docIndex === -1) {
      return new Response('Document not found', { status: 404 })
    }
    
    const document = documents[docIndex]
    
    // Update folder document count
    if (document.folderId) {
      const folderIndex = folders.findIndex(f => f.id === document.folderId)
      if (folderIndex !== -1) {
        folders[folderIndex].documentsCount -= 1
        folders[folderIndex].size -= document.size
      }
    }
    
    documents.splice(docIndex, 1)
    
    return Response.json({
      message: 'Document deleted successfully'
    })
  }),

  // Download document
  http.get('/api/documents/:id/download', async ({ params }) => {
    await delay(Math.random() * 500 + 200)
    
    const document = documents.find(d => d.id === params.id)
    
    if (!document) {
      return new Response('Document not found', { status: 404 })
    }
    
    // Update download count
    const docIndex = documents.findIndex(d => d.id === params.id)
    documents[docIndex] = {
      ...document,
      downloadCount: document.downloadCount + 1,
      lastAccessedAt: new Date().toISOString(),
    }
    
    return Response.json({
      data: {
        url: document.url,
        filename: document.name,
        size: document.size,
        mimeType: document.mimeType,
      },
      message: 'Document download initiated'
    })
  }),

  // Get document versions
  http.get('/api/documents/:id/versions', async ({ params }) => {
    await delay(Math.random() * 300 + 100)
    
    const versions = documentVersions.filter(v => v.documentId === params.id)
    
    return Response.json({
      data: versions.sort((a, b) => b.version - a.version),
      message: 'Document versions retrieved successfully'
    })
  }),

  // Create document version
  http.post('/api/documents/:id/versions', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<DocumentVersion>
    
    const document = documents.find(d => d.id === params.id)
    if (!document) {
      return new Response('Document not found', { status: 404 })
    }
    
    const newVersion: DocumentVersion = {
      id: `version-${documentVersions.length + 1}`,
      documentId: params.id as string,
      version: document.version + 1,
      name: data.name || `v${document.version + 1}`,
      url: data.url || document.url,
      size: data.size || document.size,
      changes: data.changes || '',
      createdBy: data.createdBy!,
      createdAt: new Date().toISOString(),
    }
    
    documentVersions.push(newVersion)
    
    // Update document version
    const docIndex = documents.findIndex(d => d.id === params.id)
    documents[docIndex] = {
      ...document,
      version: newVersion.version,
      updatedAt: new Date().toISOString(),
    }
    
    return Response.json({
      data: newVersion,
      message: 'Document version created successfully'
    })
  }),

  // Get document activity
  http.get('/api/documents/:id/activity', async ({ params }) => {
    await delay(Math.random() * 300 + 100)
    
    const activity = documentActivity
      .filter(a => a.documentId === params.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return Response.json({
      data: activity,
      message: 'Document activity retrieved successfully'
    })
  }),

  // Get document permissions
  http.get('/api/documents/:id/permissions', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const permissions = documentPermissions.filter(p => p.documentId === params.id && p.isActive)
    
    return Response.json({
      data: permissions,
      message: 'Document permissions retrieved successfully'
    })
  }),

  // Update document permissions
  http.put('/api/documents/:id/permissions', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const { permissions } = await request.json() as { permissions: Partial<DocumentPermission>[] }
    
    // Remove existing permissions for this document
    const existingPermissions = documentPermissions.filter(p => p.documentId === params.id)
    existingPermissions.forEach(p => {
      const index = documentPermissions.findIndex(perm => perm.id === p.id)
      if (index !== -1) {
        documentPermissions[index].isActive = false
      }
    })
    
    // Add new permissions
    const newPermissions = permissions.map((perm, index) => ({
      id: `doc-perm-${documentPermissions.length + index + 1}`,
      documentId: params.id as string,
      userId: perm.userId,
      roleId: perm.roleId,
      departmentId: perm.departmentId,
      permission: perm.permission || 'read',
      grantedBy: perm.grantedBy!,
      grantedAt: new Date().toISOString(),
      expiresAt: perm.expiresAt,
      isActive: true,
    }))
    
    documentPermissions.push(...newPermissions)
    
    return Response.json({
      data: newPermissions,
      message: 'Document permissions updated successfully'
    })
  }),

  // Search documents
  http.get('/api/documents/search', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    const type = url.searchParams.get('type')
    const accessLevel = url.searchParams.get('accessLevel')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    
    if (!query) {
      return new Response('Search query is required', { status: 400 })
    }
    
    const queryLower = query.toLowerCase()
    let results = documents.filter(doc => 
      doc.name.toLowerCase().includes(queryLower) ||
      doc.description?.toLowerCase().includes(queryLower) ||
      doc.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
      JSON.stringify(doc.metadata).toLowerCase().includes(queryLower)
    )
    
    if (type) {
      results = results.filter(doc => doc.type === type)
    }
    
    if (accessLevel) {
      results = results.filter(doc => doc.accessLevel === accessLevel)
    }
    
    // Sort by relevance (simplified)
    results.sort((a, b) => {
      const aScore = (a.name.toLowerCase().includes(queryLower) ? 2 : 0) +
                    (a.description?.toLowerCase().includes(queryLower) ? 1 : 0)
      const bScore = (b.name.toLowerCase().includes(queryLower) ? 2 : 0) +
                    (b.description?.toLowerCase().includes(queryLower) ? 1 : 0)
      return bScore - aScore
    })
    
    return Response.json({
      data: results.slice(0, limit),
      meta: {
        total: results.length,
        query,
        limit,
      },
      message: 'Document search completed successfully'
    })
  }),

  // Get document statistics
  http.get('/api/documents/stats', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const folderId = url.searchParams.get('folderId')
    const accessLevel = url.searchParams.get('accessLevel')
    
    let filtered = [...documents]
    
    if (folderId) {
      filtered = filtered.filter(doc => doc.folderId === folderId)
    }
    
    if (accessLevel) {
      filtered = filtered.filter(doc => doc.accessLevel === accessLevel)
    }
    
    const stats = {
      total: filtered.length,
      totalSize: filtered.reduce((sum, doc) => sum + doc.size, 0),
      byType: filtered.reduce((acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byStatus: filtered.reduce((acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byAccessLevel: filtered.reduce((acc, doc) => {
        acc[doc.accessLevel] = (acc[doc.accessLevel] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      recentActivity: documentActivity
        .filter(a => new Date(a.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .length,
      topDownloaded: filtered
        .sort((a, b) => b.downloadCount - a.downloadCount)
        .slice(0, 10)
        .map(doc => ({ id: doc.id, name: doc.name, downloads: doc.downloadCount })),
    }
    
    return Response.json({
      data: stats,
      message: 'Document statistics retrieved successfully'
    })
  }),
]