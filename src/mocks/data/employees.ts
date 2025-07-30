import { faker } from '@faker-js/faker'

export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string
  position: string
  department: string
  manager: string | null
  startDate: string
  status: 'active' | 'inactive' | 'terminated'
  salary: number
  location: string
  skills: string[]
  emergency: {
    name: string
    phone: string
    relationship: string
  }
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: string
  updatedAt: string
}

const departments = ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Legal']
const positions = [
  'Software Engineer', 'Senior Developer', 'Team Lead', 'Product Manager',
  'HR Manager', 'Recruiter', 'Financial Analyst', 'Accountant',
  'Marketing Manager', 'Content Creator', 'Sales Manager', 'Sales Representative',
  'Operations Manager', 'Legal Counsel', 'DevOps Engineer', 'QA Engineer'
]
const locations = ['New York', 'San Francisco', 'London', 'Toronto', 'Sydney', 'Remote']
const skills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'AWS',
  'Leadership', 'Project Management', 'Communication', 'Analytics', 'Marketing',
  'Finance', 'Legal', 'HR', 'Operations', 'Design', 'DevOps'
]

export const generateEmployees = (count: number = 50): Employee[] => {
  const employees: Employee[] = []
  
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const department = faker.helpers.arrayElement(departments)
    
    employees.push({
      id: faker.string.uuid(),
      employeeId: `EMP${faker.string.numeric(4)}`,
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: faker.phone.number(),
      avatar: faker.image.avatar(),
      position: faker.helpers.arrayElement(positions),
      department,
      manager: i > 0 ? faker.helpers.maybe(() => employees[faker.number.int({ min: 0, max: i - 1 })].id) : null,
      startDate: faker.date.past({ years: 5 }).toISOString(),
      status: faker.helpers.weightedArrayElement([
        { weight: 85, value: 'active' as const },
        { weight: 10, value: 'inactive' as const },
        { weight: 5, value: 'terminated' as const }
      ]),
      salary: faker.number.int({ min: 40000, max: 200000 }),
      location: faker.helpers.arrayElement(locations),
      skills: faker.helpers.arrayElements(skills, { min: 2, max: 6 }),
      emergency: {
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        relationship: faker.helpers.arrayElement(['Spouse', 'Parent', 'Sibling', 'Friend'])
      },
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      },
      createdAt: faker.date.past({ years: 2 }).toISOString(),
      updatedAt: faker.date.recent().toISOString()
    })
  }
  
  return employees
}

export const mockEmployees = generateEmployees(50)