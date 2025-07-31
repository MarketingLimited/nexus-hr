import { faker } from '@faker-js/faker'

export interface Document {
  id: string
  name: string
  description?: string
  folderId?: string
  type: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'txt' | 'image' | 'other'
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  version: number
  status: 'draft' | 'review' | 'approved' | 'archived'
  tags: string[]
  createdBy: string
  updatedBy: string
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  downloadCount: number
  lastAccessedAt?: string
  expiryDate?: string
  isEncrypted: boolean
  checksum: string
  metadata: Record<string, any>
  permissions: DocumentPermission[]
  versions: DocumentVersion[]
  createdAt: string
  updatedAt: string
}

export interface Folder {
  id: string
  name: string
  description?: string
  parentId?: string
  path: string
  color?: string
  isShared: boolean
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  createdBy: string
  updatedBy: string
  documentsCount: number
  size: number
  permissions: FolderPermission[]
  createdAt: string
  updatedAt: string
}

export interface DocumentPermission {
  id: string
  documentId: string
  userId?: string
  roleId?: string
  departmentId?: string
  permission: 'read' | 'write' | 'delete' | 'share' | 'admin'
  grantedBy: string
  grantedAt: string
  expiresAt?: string
  isActive: boolean
}

export interface FolderPermission {
  id: string
  folderId: string
  userId?: string
  roleId?: string
  departmentId?: string
  permission: 'read' | 'write' | 'delete' | 'share' | 'admin'
  grantedBy: string
  grantedAt: string
  expiresAt?: string
  isActive: boolean
}

export interface DocumentVersion {
  id: string
  documentId: string
  version: number
  name: string
  url: string
  size: number
  changes: string
  createdBy: string
  createdAt: string
}

export interface DocumentActivity {
  id: string
  documentId: string
  userId: string
  action: 'created' | 'viewed' | 'downloaded' | 'updated' | 'deleted' | 'shared' | 'moved'
  details?: string
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

const documentTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'image', 'other'] as const
const accessLevels = ['public', 'internal', 'confidential', 'restricted'] as const
const permissions = ['read', 'write', 'delete', 'share', 'admin'] as const

const documentCategories = [
  'HR Policies', 'Employee Handbooks', 'Contracts', 'Performance Reviews',
  'Training Materials', 'Compliance Documents', 'Financial Reports', 'Project Documentation',
  'Meeting Minutes', 'Presentations', 'Forms', 'Templates'
]

export function generateFolders(userIds: string[], count: number = 20): Folder[] {
  const folders: Folder[] = []
  
  // Create root folders first
  const rootFolders = documentCategories.slice(0, 8).map((category, index) => ({
    id: `folder-${index + 1}`,
    name: category,
    description: `${category} and related documents`,
    path: `/${category.toLowerCase().replace(/\s+/g, '-')}`,
      color: faker.color.rgb(),
    isShared: faker.datatype.boolean(0.7),
    accessLevel: faker.helpers.arrayElement(accessLevels),
    createdBy: faker.helpers.arrayElement(userIds),
    updatedBy: faker.helpers.arrayElement(userIds),
    documentsCount: faker.number.int({ min: 5, max: 50 }),
    size: faker.number.int({ min: 1024 * 1024, max: 100 * 1024 * 1024 }), // 1MB to 100MB
    permissions: [],
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  }))

  folders.push(...rootFolders)

  // Create subfolders
  for (let i = rootFolders.length; i < count; i++) {
    const parentFolder = faker.helpers.arrayElement(rootFolders)
    const folder: Folder = {
      id: `folder-${i + 1}`,
      name: faker.system.directoryPath().split('/').pop() || `Subfolder ${i}`,
      description: faker.lorem.sentence(),
      parentId: parentFolder.id,
      path: `${parentFolder.path}/${faker.system.fileName()}`,
      color: faker.color.rgb(),
      isShared: faker.datatype.boolean(0.5),
      accessLevel: faker.helpers.arrayElement(accessLevels),
      createdBy: faker.helpers.arrayElement(userIds),
      updatedBy: faker.helpers.arrayElement(userIds),
      documentsCount: faker.number.int({ min: 0, max: 20 }),
      size: faker.number.int({ min: 0, max: 50 * 1024 * 1024 }),
      permissions: [],
      createdAt: faker.date.past({ years: 1 }).toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    }
    folders.push(folder)
  }

  return folders
}

export function generateDocuments(folderIds: string[], userIds: string[], count: number = 100): Document[] {
  return Array.from({ length: count }, (_, i) => {
    const type = faker.helpers.arrayElement(documentTypes)
    const version = faker.number.int({ min: 1, max: 5 })
    const size = faker.number.int({ min: 1024, max: 10 * 1024 * 1024 }) // 1KB to 10MB
    
    const document: Document = {
      id: `doc-${i + 1}`,
      name: generateDocumentName(type),
      description: faker.lorem.sentence(),
      folderId: faker.helpers.arrayElement(folderIds),
      type,
      mimeType: getMimeType(type),
      size,
      url: faker.internet.url(),
      thumbnailUrl: type === 'image' ? faker.image.url() : undefined,
      version,
      status: faker.helpers.weightedArrayElement([
        { weight: 0.6, value: 'approved' },
        { weight: 0.2, value: 'draft' },
        { weight: 0.15, value: 'review' },
        { weight: 0.05, value: 'archived' }
      ]),
      tags: faker.helpers.arrayElements(documentCategories, { min: 1, max: 3 }),
      createdBy: faker.helpers.arrayElement(userIds),
      updatedBy: faker.helpers.arrayElement(userIds),
      accessLevel: faker.helpers.arrayElement(accessLevels),
      downloadCount: faker.number.int({ min: 0, max: 100 }),
      lastAccessedAt: faker.date.recent().toISOString(),
      expiryDate: faker.datatype.boolean(0.3) ? faker.date.future({ years: 2 }).toISOString() : undefined,
      isEncrypted: faker.datatype.boolean(0.2),
      checksum: faker.string.hexadecimal({ length: 32 }),
      metadata: {
        author: faker.person.fullName(),
        title: generateDocumentName(type),
        subject: faker.lorem.words(3),
        keywords: faker.lorem.words(5),
        pageCount: type.includes('pdf') || type.includes('doc') ? faker.number.int({ min: 1, max: 50 }) : undefined,
        wordCount: type.includes('doc') || type === 'txt' ? faker.number.int({ min: 100, max: 5000 }) : undefined,
      },
      permissions: [],
      versions: [],
      createdAt: faker.date.past({ years: 2 }).toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    }

    return document
  })
}

export function generateDocumentPermissions(
  documentIds: string[], 
  userIds: string[], 
  count: number = 200
): DocumentPermission[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `doc-perm-${i + 1}`,
    documentId: faker.helpers.arrayElement(documentIds),
    userId: faker.helpers.arrayElement(userIds),
    permission: faker.helpers.arrayElement(permissions),
    grantedBy: faker.helpers.arrayElement(userIds),
    grantedAt: faker.date.past({ years: 1 }).toISOString(),
    expiresAt: faker.datatype.boolean(0.3) ? faker.date.future({ years: 1 }).toISOString() : undefined,
    isActive: faker.datatype.boolean(0.9),
  }))
}

export function generateFolderPermissions(
  folderIds: string[], 
  userIds: string[], 
  count: number = 100
): FolderPermission[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `folder-perm-${i + 1}`,
    folderId: faker.helpers.arrayElement(folderIds),
    userId: faker.helpers.arrayElement(userIds),
    permission: faker.helpers.arrayElement(permissions),
    grantedBy: faker.helpers.arrayElement(userIds),
    grantedAt: faker.date.past({ years: 1 }).toISOString(),
    expiresAt: faker.datatype.boolean(0.3) ? faker.date.future({ years: 1 }).toISOString() : undefined,
    isActive: faker.datatype.boolean(0.9),
  }))
}

export function generateDocumentVersions(
  documentIds: string[], 
  userIds: string[], 
  count: number = 150
): DocumentVersion[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `version-${i + 1}`,
    documentId: faker.helpers.arrayElement(documentIds),
    version: faker.number.int({ min: 1, max: 10 }),
    name: `v${faker.number.int({ min: 1, max: 10 })}.${faker.number.int({ min: 0, max: 9 })}`,
    url: faker.internet.url(),
    size: faker.number.int({ min: 1024, max: 10 * 1024 * 1024 }),
    changes: faker.lorem.sentence(),
    createdBy: faker.helpers.arrayElement(userIds),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  }))
}

export function generateDocumentActivity(
  documentIds: string[], 
  userIds: string[], 
  count: number = 500
): DocumentActivity[] {
  const actions = ['created', 'viewed', 'downloaded', 'updated', 'deleted', 'shared', 'moved'] as const
  
  return Array.from({ length: count }, (_, i) => ({
    id: `activity-${i + 1}`,
    documentId: faker.helpers.arrayElement(documentIds),
    userId: faker.helpers.arrayElement(userIds),
    action: faker.helpers.arrayElement(actions),
    details: faker.lorem.sentence(),
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    timestamp: faker.date.past({ years: 1 }).toISOString(),
  }))
}

function generateDocumentName(type: string): string {
  const prefixes = {
    pdf: ['Report', 'Manual', 'Guide', 'Policy', 'Handbook'],
    doc: ['Letter', 'Memo', 'Draft', 'Document', 'Plan'],
    docx: ['Proposal', 'Contract', 'Agreement', 'Summary', 'Analysis'],
    xls: ['Budget', 'Expenses', 'Data', 'Statistics', 'Report'],
    xlsx: ['Financial', 'Payroll', 'Inventory', 'Sales', 'Analytics'],
    ppt: ['Presentation', 'Slides', 'Training', 'Meeting', 'Overview'],
    pptx: ['Strategy', 'Review', 'Update', 'Quarterly', 'Annual'],
    txt: ['Notes', 'Log', 'Config', 'Readme', 'Instructions'],
    image: ['Screenshot', 'Photo', 'Chart', 'Diagram', 'Flowchart'],
    other: ['Archive', 'Backup', 'Template', 'Resource', 'Asset']
  }
  
  const prefix = faker.helpers.arrayElement(prefixes[type as keyof typeof prefixes] || prefixes.other)
  const suffix = faker.date.recent().getFullYear()
  return `${prefix}_${faker.lorem.word()}_${suffix}.${type}`
}

function getMimeType(type: string): string {
  const mimeTypes = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    image: 'image/jpeg',
    other: 'application/octet-stream'
  }
  
  return mimeTypes[type as keyof typeof mimeTypes] || mimeTypes.other
}