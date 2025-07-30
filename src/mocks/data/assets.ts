import { faker } from '@faker-js/faker'

export interface Asset {
  id: string
  assetTag: string
  name: string
  description: string
  category: AssetCategory
  type: 'hardware' | 'software' | 'furniture' | 'vehicle' | 'equipment'
  brand: string
  model: string
  serialNumber: string
  purchaseDate: string
  purchasePrice: number
  warrantyExpiry?: string
  status: 'available' | 'assigned' | 'maintenance' | 'retired' | 'lost'
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  location: string
  department: string
  assignedTo?: string
  assignedDate?: string
  specifications: Record<string, any>
  maintenanceHistory: AssetMaintenance[]
  photos: string[]
  documents: string[]
  createdAt: string
  updatedAt: string
}

export interface AssetCategory {
  id: string
  name: string
  description: string
  code: string
  parentId?: string
  depreciationRate: number
  usefulLife: number
  createdAt: string
  updatedAt: string
}

export interface AssetAssignment {
  id: string
  assetId: string
  employeeId: string
  assignedBy: string
  assignedDate: string
  returnDate?: string
  returnedBy?: string
  condition: string
  notes?: string
  acknowledgedByEmployee: boolean
  acknowledgedDate?: string
  status: 'active' | 'returned' | 'overdue'
  createdAt: string
  updatedAt: string
}

export interface AssetMaintenance {
  id: string
  assetId: string
  type: 'routine' | 'repair' | 'upgrade' | 'inspection'
  description: string
  scheduledDate: string
  completedDate?: string
  cost: number
  vendor?: string
  performedBy: string
  notes?: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  nextMaintenanceDate?: string
  warrantyClaimNumber?: string
  createdAt: string
  updatedAt: string
}

const assetCategories: AssetCategory[] = [
  {
    id: 'cat-1',
    name: 'IT Equipment',
    description: 'Computers, laptops, servers, and networking equipment',
    code: 'IT',
    depreciationRate: 20,
    usefulLife: 5,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Office Furniture',
    description: 'Desks, chairs, cabinets, and other office furniture',
    code: 'FURN',
    depreciationRate: 10,
    usefulLife: 10,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Software',
    description: 'Software licenses and applications',
    code: 'SW',
    depreciationRate: 33,
    usefulLife: 3,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  },
  {
    id: 'cat-4',
    name: 'Vehicles',
    description: 'Company vehicles and transportation equipment',
    code: 'VEH',
    depreciationRate: 15,
    usefulLife: 7,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  }
]

export function generateAssets(employeeIds: string[], count: number = 100): Asset[] {
  const assets: Asset[] = []

  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(assetCategories)
    const assetType = faker.helpers.arrayElement(['hardware', 'software', 'furniture', 'vehicle', 'equipment'] as const)
    const status = faker.helpers.weightedArrayElement([
      { weight: 0.6, value: 'assigned' },
      { weight: 0.2, value: 'available' },
      { weight: 0.1, value: 'maintenance' },
      { weight: 0.08, value: 'retired' },
      { weight: 0.02, value: 'lost' }
    ] as const)

    const asset: Asset = {
      id: `asset-${i + 1}`,
      assetTag: `${category.code}-${String(i + 1).padStart(4, '0')}`,
      name: generateAssetName(assetType),
      description: faker.commerce.productDescription(),
      category,
      type: assetType,
      brand: generateBrand(assetType),
      model: faker.commerce.productName(),
      serialNumber: faker.string.alphanumeric(12).toUpperCase(),
      purchaseDate: faker.date.past({ years: 3 }).toISOString(),
      purchasePrice: faker.number.int({ min: 100, max: 5000 }),
      warrantyExpiry: faker.date.future({ years: 2 }).toISOString(),
      status,
      condition: faker.helpers.arrayElement(['excellent', 'good', 'fair', 'poor']),
      location: faker.helpers.arrayElement(['Main Office', 'Branch Office', 'Warehouse', 'Remote', 'Storage']),
      department: faker.helpers.arrayElement(['IT', 'HR', 'Finance', 'Marketing', 'Operations']),
      specifications: generateSpecifications(assetType),
      maintenanceHistory: [],
      photos: [faker.image.url()],
      documents: [],
      createdAt: faker.date.past({ years: 2 }).toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    }

    if (status === 'assigned') {
      asset.assignedTo = faker.helpers.arrayElement(employeeIds)
      asset.assignedDate = faker.date.past({ years: 1 }).toISOString()
    }

    assets.push(asset)
  }

  return assets
}

export function generateAssetAssignments(assetIds: string[], employeeIds: string[], count: number = 50): AssetAssignment[] {
  return Array.from({ length: count }, (_, i) => {
    const assignedDate = faker.date.past({ years: 2 })
    const status = faker.helpers.weightedArrayElement([
      { weight: 0.7, value: 'active' },
      { weight: 0.25, value: 'returned' },
      { weight: 0.05, value: 'overdue' }
    ] as const)

    const assignment: AssetAssignment = {
      id: `assignment-${i + 1}`,
      assetId: faker.helpers.arrayElement(assetIds),
      employeeId: faker.helpers.arrayElement(employeeIds),
      assignedBy: faker.helpers.arrayElement(employeeIds),
      assignedDate: assignedDate.toISOString(),
      condition: faker.helpers.arrayElement(['excellent', 'good', 'fair']),
      notes: faker.lorem.sentence(),
      acknowledgedByEmployee: faker.datatype.boolean(0.9),
      status,
      createdAt: assignedDate.toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    }

    if (status === 'returned') {
      assignment.returnDate = faker.date.between({ from: assignedDate, to: new Date() }).toISOString()
      assignment.returnedBy = faker.helpers.arrayElement(employeeIds)
    }

    if (assignment.acknowledgedByEmployee) {
      assignment.acknowledgedDate = faker.date.soon({ days: 3, refDate: assignedDate }).toISOString()
    }

    return assignment
  })
}

export function generateAssetMaintenance(assetIds: string[], employeeIds: string[], count: number = 30): AssetMaintenance[] {
  return Array.from({ length: count }, (_, i) => {
    const type = faker.helpers.arrayElement(['routine', 'repair', 'upgrade', 'inspection'] as const)
    const scheduledDate = faker.date.recent({ days: 90 })
    const status = faker.helpers.weightedArrayElement([
      { weight: 0.4, value: 'completed' },
      { weight: 0.3, value: 'scheduled' },
      { weight: 0.2, value: 'in-progress' },
      { weight: 0.1, value: 'cancelled' }
    ] as const)

    const maintenance: AssetMaintenance = {
      id: `maintenance-${i + 1}`,
      assetId: faker.helpers.arrayElement(assetIds),
      type,
      description: generateMaintenanceDescription(type),
      scheduledDate: scheduledDate.toISOString(),
      cost: faker.number.int({ min: 50, max: 1000 }),
      vendor: faker.company.name(),
      performedBy: faker.helpers.arrayElement(employeeIds),
      notes: faker.lorem.sentence(),
      status,
      createdAt: faker.date.past({ years: 1 }).toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    }

    if (status === 'completed') {
      maintenance.completedDate = faker.date.soon({ days: 7, refDate: scheduledDate }).toISOString()
      maintenance.nextMaintenanceDate = faker.date.future({ years: 1 }).toISOString()
    }

    if (type === 'repair') {
      maintenance.warrantyClaimNumber = faker.string.alphanumeric(8).toUpperCase()
    }

    return maintenance
  })
}

function generateAssetName(type: string): string {
  const names = {
    hardware: ['Dell Laptop', 'HP Desktop', 'MacBook Pro', 'iPad', 'iPhone', 'Monitor', 'Printer', 'Router'],
    software: ['Microsoft Office', 'Adobe Creative Suite', 'Slack', 'Zoom', 'Windows License', 'Antivirus'],
    furniture: ['Ergonomic Chair', 'Standing Desk', 'Filing Cabinet', 'Conference Table', 'Bookshelf'],
    vehicle: ['Toyota Corolla', 'Ford Transit', 'Honda Civic', 'Delivery Van', 'Company Car'],
    equipment: ['Projector', 'Coffee Machine', 'Shredder', 'Scanner', 'Phone System']
  }
  return faker.helpers.arrayElement(names[type as keyof typeof names] || names.equipment)
}

function generateBrand(type: string): string {
  const brands = {
    hardware: ['Dell', 'HP', 'Apple', 'Lenovo', 'ASUS', 'Acer', 'Samsung'],
    software: ['Microsoft', 'Adobe', 'Google', 'Slack', 'Zoom', 'Atlassian'],
    furniture: ['Herman Miller', 'Steelcase', 'IKEA', 'HON', 'Humanscale'],
    vehicle: ['Toyota', 'Ford', 'Honda', 'Chevrolet', 'Nissan'],
    equipment: ['Epson', 'Canon', 'Brother', 'Panasonic', 'Sony']
  }
  return faker.helpers.arrayElement(brands[type as keyof typeof brands] || brands.equipment)
}

function generateSpecifications(type: string): Record<string, any> {
  const specs: Record<string, Record<string, any>> = {
    hardware: {
      processor: faker.helpers.arrayElement(['Intel i7', 'Intel i5', 'AMD Ryzen 7', 'Apple M1']),
      memory: faker.helpers.arrayElement(['8GB', '16GB', '32GB']),
      storage: faker.helpers.arrayElement(['256GB SSD', '512GB SSD', '1TB SSD']),
      screenSize: faker.helpers.arrayElement(['13"', '15"', '17"', '24"', '27"'])
    },
    software: {
      version: faker.system.semver(),
      licenseType: faker.helpers.arrayElement(['Single User', 'Multi User', 'Enterprise']),
      platform: faker.helpers.arrayElement(['Windows', 'macOS', 'Web-based', 'Cross-platform'])
    },
    furniture: {
      material: faker.helpers.arrayElement(['Wood', 'Metal', 'Plastic', 'Fabric']),
      color: faker.color.human(),
      dimensions: `${faker.number.int({ min: 50, max: 200 })}x${faker.number.int({ min: 50, max: 200 })}x${faker.number.int({ min: 70, max: 120 })}cm`
    },
    vehicle: {
      year: faker.date.past({ years: 5 }).getFullYear(),
      mileage: faker.number.int({ min: 10000, max: 100000 }),
      fuelType: faker.helpers.arrayElement(['Gasoline', 'Diesel', 'Hybrid', 'Electric']),
      licensePlate: faker.vehicle.vrm()
    }
  }
  return specs[type] || {}
}

function generateMaintenanceDescription(type: string): string {
  const descriptions = {
    routine: 'Regular maintenance check and cleaning',
    repair: 'Hardware failure repair and component replacement',
    upgrade: 'Software upgrade and hardware enhancement',
    inspection: 'Safety and compliance inspection'
  }
  return descriptions[type] || 'General maintenance'
}

export const mockAssetCategories = assetCategories