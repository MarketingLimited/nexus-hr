import { faker } from '@faker-js/faker'

export interface Department {
  id: string
  name: string
  description: string
  head: string
  location: string
  budget: number
  employeeCount: number
  parentDepartment: string | null
  costCenter: string
  createdAt: string
  updatedAt: string
}

export interface DepartmentHierarchy {
  department: Department
  children: DepartmentHierarchy[]
}

const departmentData = [
  { name: 'Engineering', description: 'Software development and technical operations' },
  { name: 'Human Resources', description: 'Employee relations and organizational development' },
  { name: 'Finance', description: 'Financial planning and accounting operations' },
  { name: 'Marketing', description: 'Brand promotion and customer acquisition' },
  { name: 'Sales', description: 'Revenue generation and client relationships' },
  { name: 'Operations', description: 'Business operations and process management' },
  { name: 'Legal', description: 'Legal compliance and contract management' },
  { name: 'Product', description: 'Product strategy and development' }
]

export const generateDepartments = (): Department[] => {
  return departmentData.map((dept, index) => ({
    id: faker.string.uuid(),
    name: dept.name,
    description: dept.description,
    head: faker.person.fullName(),
    location: faker.helpers.arrayElement(['New York', 'San Francisco', 'London', 'Toronto']),
    budget: faker.number.int({ min: 500000, max: 5000000 }),
    employeeCount: faker.number.int({ min: 5, max: 25 }),
    parentDepartment: index > 0 ? faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.3 }) : null,
    costCenter: `CC${faker.string.numeric(4)}`,
    createdAt: faker.date.past({ years: 3 }).toISOString(),
    updatedAt: faker.date.recent().toISOString()
  }))
}

export const mockDepartments = generateDepartments()