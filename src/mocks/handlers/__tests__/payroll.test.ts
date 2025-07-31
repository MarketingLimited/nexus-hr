import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { payrollHandlers } from '../payroll'

const server = setupServer(...payrollHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Payroll Handlers', () => {
  describe('GET /api/payroll/salary-structures', () => {
    it('should return salary structures', async () => {
      const response = await fetch('/api/payroll/salary-structures')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const structure = data.data[0]
        expect(structure.id).toBeDefined()
        expect(structure.employeeId).toBeDefined()
        expect(structure.baseSalary).toBeDefined()
        expect(structure.allowances).toBeDefined()
        expect(structure.deductions).toBeDefined()
      }
    })
  })

  describe('POST /api/payroll/salary-structures', () => {
    it('should create new salary structure', async () => {
      const newStructure = {
        employeeId: 'emp-001',
        baseSalary: 60000,
        allowances: {
          housing: 10000,
          transport: 5000,
          medical: 3000
        },
        deductions: {
          tax: 8000,
          insurance: 2000
        },
        effectiveDate: '2024-01-01'
      }

      const response = await fetch('/api/payroll/salary-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStructure)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.data.id).toBeDefined()
      expect(data.data.employeeId).toBe(newStructure.employeeId)
      expect(data.data.baseSalary).toBe(newStructure.baseSalary)
    })
  })

  describe('GET /api/payroll/payslips', () => {
    it('should return payslips', async () => {
      const response = await fetch('/api/payroll/payslips')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const payslip = data.data[0]
        expect(payslip.id).toBeDefined()
        expect(payslip.employeeId).toBeDefined()
        expect(payslip.payPeriod).toBeDefined()
        expect(payslip.grossSalary).toBeDefined()
        expect(payslip.netSalary).toBeDefined()
      }
    })

    it('should filter payslips by employee ID', async () => {
      const response = await fetch('/api/payroll/payslips?employeeId=emp-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter payslips by pay period', async () => {
      const response = await fetch('/api/payroll/payslips?payPeriod=2024-01')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter payslips by status', async () => {
      const response = await fetch('/api/payroll/payslips?status=processed')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter payslips by year', async () => {
      const response = await fetch('/api/payroll/payslips?year=2024')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('POST /api/payroll/payslips', () => {
    it('should create new payslip', async () => {
      const newPayslip = {
        employeeId: 'emp-001',
        payPeriod: '2024-02',
        grossSalary: 5000,
        allowances: {
          housing: 1000,
          transport: 500
        },
        deductions: {
          tax: 750,
          insurance: 200
        },
        netSalary: 4550,
        workingDays: 22,
        overtimeHours: 0
      }

      const response = await fetch('/api/payroll/payslips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayslip)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.data.id).toBeDefined()
      expect(data.data.employeeId).toBe(newPayslip.employeeId)
      expect(data.data.payPeriod).toBe(newPayslip.payPeriod)
      expect(data.data.netSalary).toBe(newPayslip.netSalary)
    })
  })

  describe('GET /api/payroll/tax-brackets', () => {
    it('should return tax brackets', async () => {
      const response = await fetch('/api/payroll/tax-brackets')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data.length).toBeGreaterThan(0)
      
      const bracket = data.data[0]
      expect(bracket.minIncome).toBeDefined()
      expect(bracket.maxIncome).toBeDefined()
      expect(bracket.rate).toBeDefined()
    })
  })

  describe('POST /api/payroll/calculate-tax', () => {
    it('should calculate tax for given salary', async () => {
      const request = {
        grossSalary: 60000
      }

      const response = await fetch('/api/payroll/calculate-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.grossSalary).toBe(request.grossSalary)
      expect(data.data.totalTax).toBeGreaterThanOrEqual(0)
      expect(data.data.netSalary).toBeLessThan(request.grossSalary)
      expect(Array.isArray(data.data.taxBreakdown)).toBe(true)
    })
  })

  describe('GET /api/payroll/runs', () => {
    it('should return payroll runs', async () => {
      const response = await fetch('/api/payroll/runs')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const run = data.data[0]
        expect(run.id).toBeDefined()
        expect(run.payPeriod).toBeDefined()
        expect(run.status).toBeDefined()
        expect(run.employeeCount).toBeDefined()
        expect(run.totalGross).toBeDefined()
        expect(run.totalNet).toBeDefined()
      }
    })

    it('should filter runs by year', async () => {
      const response = await fetch('/api/payroll/runs?year=2024')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter runs by status', async () => {
      const response = await fetch('/api/payroll/runs?status=completed')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('POST /api/payroll/runs', () => {
    it('should create new payroll run', async () => {
      const newRun = {
        payPeriod: '2024-03',
        description: 'March 2024 Payroll',
        cutoffDate: '2024-03-31'
      }

      const response = await fetch('/api/payroll/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRun)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.data.id).toBeDefined()
      expect(data.data.payPeriod).toBe(newRun.payPeriod)
      expect(data.data.status).toBe('draft')
      expect(data.data.employeeCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('GET /api/payroll/stats', () => {
    it('should return payroll statistics', async () => {
      const response = await fetch('/api/payroll/stats')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.totalGrossSalary).toBeGreaterThanOrEqual(0)
      expect(data.data.totalNetSalary).toBeGreaterThanOrEqual(0)
      expect(data.data.totalDeductions).toBeGreaterThanOrEqual(0)
      expect(data.data.totalAllowances).toBeGreaterThanOrEqual(0)
      expect(data.data.averageSalary).toBeGreaterThanOrEqual(0)
      expect(data.data.employeeCount).toBeGreaterThanOrEqual(0)
    })

    it('should filter stats by year', async () => {
      const response = await fetch('/api/payroll/stats?year=2024')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data).toBeDefined()
    })

    it('should filter stats by month', async () => {
      const response = await fetch('/api/payroll/stats?year=2024&month=1')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data).toBeDefined()
    })
  })
})