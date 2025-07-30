import { faker } from '@faker-js/faker'

export interface SalaryStructure {
  id: string
  employeeId: string
  baseSalary: number
  allowances: {
    housing: number
    transport: number
    medical: number
    food: number
    other: number
  }
  deductions: {
    tax: number
    social: number
    pension: number
    insurance: number
    other: number
  }
  effectiveDate: string
  createdAt: string
  updatedAt: string
}

export interface Payslip {
  id: string
  employeeId: string
  payPeriod: string
  payDate: string
  grossSalary: number
  netSalary: number
  totalAllowances: number
  totalDeductions: number
  allowances: {
    housing: number
    transport: number
    medical: number
    food: number
    overtime: number
    bonus: number
  }
  deductions: {
    tax: number
    social: number
    pension: number
    insurance: number
    loan: number
  }
  workingDays: number
  actualDays: number
  overtimeHours: number
  status: 'draft' | 'approved' | 'paid'
  createdAt: string
  updatedAt: string
}

export interface TaxBracket {
  id: string
  minIncome: number
  maxIncome: number | null
  rate: number
  description: string
}

export interface PayrollRun {
  id: string
  period: string
  startDate: string
  endDate: string
  status: 'in_progress' | 'completed' | 'cancelled'
  totalEmployees: number
  totalGross: number
  totalNet: number
  totalDeductions: number
  processedBy: string
  createdAt: string
  completedAt: string | null
}

export const generateSalaryStructures = (employeeIds: string[]): SalaryStructure[] => {
  return employeeIds.map(employeeId => {
    const baseSalary = faker.number.int({ min: 40000, max: 200000 })
    
    return {
      id: faker.string.uuid(),
      employeeId,
      baseSalary,
      allowances: {
        housing: baseSalary * 0.2,
        transport: baseSalary * 0.05,
        medical: baseSalary * 0.1,
        food: baseSalary * 0.03,
        other: baseSalary * 0.02
      },
      deductions: {
        tax: baseSalary * 0.15,
        social: baseSalary * 0.08,
        pension: baseSalary * 0.05,
        insurance: baseSalary * 0.02,
        other: baseSalary * 0.01
      },
      effectiveDate: faker.date.past({ years: 1 }).toISOString(),
      createdAt: faker.date.past({ years: 2 }).toISOString(),
      updatedAt: faker.date.recent().toISOString()
    }
  })
}

export const generatePayslips = (employeeIds: string[], count: number = 300): Payslip[] => {
  const payslips: Payslip[] = []
  
  for (let i = 0; i < count; i++) {
    const employeeId = faker.helpers.arrayElement(employeeIds)
    const grossSalary = faker.number.int({ min: 3000, max: 20000 })
    const workingDays = 22
    const actualDays = faker.number.int({ min: 18, max: 22 })
    const overtimeHours = faker.number.int({ min: 0, max: 20 })
    
    const allowances = {
      housing: grossSalary * 0.2,
      transport: grossSalary * 0.05,
      medical: grossSalary * 0.1,
      food: grossSalary * 0.03,
      overtime: overtimeHours * 50,
      bonus: faker.helpers.maybe(() => faker.number.int({ min: 500, max: 5000 }), { probability: 0.2 }) || 0
    }
    
    const deductions = {
      tax: grossSalary * 0.15,
      social: grossSalary * 0.08,
      pension: grossSalary * 0.05,
      insurance: grossSalary * 0.02,
      loan: faker.helpers.maybe(() => faker.number.int({ min: 200, max: 1000 }), { probability: 0.3 }) || 0
    }
    
    const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0)
    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0)
    const netSalary = grossSalary + totalAllowances - totalDeductions
    
    const payDate = faker.date.past({ years: 1 })
    
    payslips.push({
      id: faker.string.uuid(),
      employeeId,
      payPeriod: `${payDate.getFullYear()}-${String(payDate.getMonth() + 1).padStart(2, '0')}`,
      payDate: payDate.toISOString(),
      grossSalary,
      netSalary,
      totalAllowances,
      totalDeductions,
      allowances,
      deductions,
      workingDays,
      actualDays,
      overtimeHours,
      status: faker.helpers.weightedArrayElement([
        { weight: 10, value: 'draft' },
        { weight: 20, value: 'approved' },
        { weight: 70, value: 'paid' }
      ]),
      createdAt: faker.date.past({ years: 1 }).toISOString(),
      updatedAt: faker.date.recent().toISOString()
    })
  }
  
  return payslips
}

export const mockTaxBrackets: TaxBracket[] = [
  { id: faker.string.uuid(), minIncome: 0, maxIncome: 10000, rate: 0, description: 'Tax-free threshold' },
  { id: faker.string.uuid(), minIncome: 10001, maxIncome: 37000, rate: 0.19, description: 'Basic rate' },
  { id: faker.string.uuid(), minIncome: 37001, maxIncome: 80000, rate: 0.32, description: 'Higher rate' },
  { id: faker.string.uuid(), minIncome: 80001, maxIncome: 180000, rate: 0.37, description: 'Additional rate' },
  { id: faker.string.uuid(), minIncome: 180001, maxIncome: null, rate: 0.45, description: 'Top rate' }
]

export const generatePayrollRuns = (count: number = 12): PayrollRun[] => {
  return Array.from({ length: count }, (_, index) => {
    const startDate = new Date(2024, index, 1)
    const endDate = new Date(2024, index, 30)
    const totalEmployees = faker.number.int({ min: 45, max: 55 })
    const totalGross = totalEmployees * faker.number.int({ min: 5000, max: 15000 })
    const totalDeductions = totalGross * 0.31
    
    return {
      id: faker.string.uuid(),
      period: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: index < 10 ? 'completed' : faker.helpers.arrayElement(['in_progress', 'completed']),
      totalEmployees,
      totalGross,
      totalNet: totalGross - totalDeductions,
      totalDeductions,
      processedBy: faker.person.fullName(),
      createdAt: startDate.toISOString(),
      completedAt: index < 10 ? faker.date.between({ from: startDate, to: endDate }).toISOString() : null
    }
  })
}

export const mockPayrollRuns = generatePayrollRuns()