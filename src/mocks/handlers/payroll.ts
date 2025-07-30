import { http, HttpResponse } from 'msw'
import { 
  generateSalaryStructures,
  generatePayslips,
  mockTaxBrackets,
  mockPayrollRuns,
  SalaryStructure,
  Payslip,
  PayrollRun
} from '../data/payroll'
import { mockEmployees } from '../data/employees'

let salaryStructures = generateSalaryStructures(mockEmployees.map(emp => emp.id))
let payslips = generatePayslips(mockEmployees.map(emp => emp.id))
let payrollRuns = [...mockPayrollRuns]

export const payrollHandlers = [
  // Salary Structures
  http.get('/api/payroll/salary-structures', ({ request }) => {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')

    let filteredStructures = salaryStructures

    if (employeeId) {
      filteredStructures = filteredStructures.filter(structure => structure.employeeId === employeeId)
    }

    return HttpResponse.json({ data: filteredStructures })
  }),

  http.get('/api/payroll/salary-structures/:id', ({ params }) => {
    const structure = salaryStructures.find(s => s.id === params.id)
    if (!structure) {
      return HttpResponse.json({ error: 'Salary structure not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: structure })
  }),

  http.post('/api/payroll/salary-structures', async ({ request }) => {
    const newStructureData = await request.json() as Partial<SalaryStructure>
    const newStructure: SalaryStructure = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newStructureData
    } as SalaryStructure

    salaryStructures.push(newStructure)
    return HttpResponse.json({ data: newStructure }, { status: 201 })
  }),

  http.put('/api/payroll/salary-structures/:id', async ({ params, request }) => {
    const structureIndex = salaryStructures.findIndex(s => s.id === params.id)
    if (structureIndex === -1) {
      return HttpResponse.json({ error: 'Salary structure not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<SalaryStructure>
    salaryStructures[structureIndex] = {
      ...salaryStructures[structureIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: salaryStructures[structureIndex] })
  }),

  // Payslips
  http.get('/api/payroll/payslips', ({ request }) => {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const payPeriod = url.searchParams.get('payPeriod')
    const status = url.searchParams.get('status')
    const year = url.searchParams.get('year')

    let filteredPayslips = payslips

    if (employeeId) {
      filteredPayslips = filteredPayslips.filter(payslip => payslip.employeeId === employeeId)
    }

    if (payPeriod) {
      filteredPayslips = filteredPayslips.filter(payslip => payslip.payPeriod === payPeriod)
    }

    if (status) {
      filteredPayslips = filteredPayslips.filter(payslip => payslip.status === status)
    }

    if (year) {
      filteredPayslips = filteredPayslips.filter(payslip => 
        new Date(payslip.payDate).getFullYear() === parseInt(year)
      )
    }

    return HttpResponse.json({ data: filteredPayslips })
  }),

  http.get('/api/payroll/payslips/:id', ({ params }) => {
    const payslip = payslips.find(p => p.id === params.id)
    if (!payslip) {
      return HttpResponse.json({ error: 'Payslip not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: payslip })
  }),

  http.post('/api/payroll/payslips', async ({ request }) => {
    const newPayslipData = await request.json() as Partial<Payslip>
    const newPayslip: Payslip = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newPayslipData
    } as Payslip

    payslips.push(newPayslip)
    return HttpResponse.json({ data: newPayslip }, { status: 201 })
  }),

  http.put('/api/payroll/payslips/:id', async ({ params, request }) => {
    const payslipIndex = payslips.findIndex(p => p.id === params.id)
    if (payslipIndex === -1) {
      return HttpResponse.json({ error: 'Payslip not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<Payslip>
    payslips[payslipIndex] = {
      ...payslips[payslipIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: payslips[payslipIndex] })
  }),

  // Tax Calculation
  http.get('/api/payroll/tax-brackets', () => {
    return HttpResponse.json({ data: mockTaxBrackets })
  }),

  http.post('/api/payroll/calculate-tax', async ({ request }) => {
    const { grossSalary } = await request.json() as { grossSalary: number }
    
    let tax = 0
    let remainingIncome = grossSalary

    for (const bracket of mockTaxBrackets) {
      if (remainingIncome <= 0) break

      const taxableInThisBracket = bracket.maxIncome 
        ? Math.min(remainingIncome, bracket.maxIncome - bracket.minIncome + 1)
        : remainingIncome

      if (grossSalary > bracket.minIncome) {
        tax += Math.max(0, taxableInThisBracket) * bracket.rate
        remainingIncome -= Math.max(0, taxableInThisBracket)
      }
    }

    return HttpResponse.json({ 
      data: { 
        grossSalary, 
        tax: Math.round(tax), 
        netSalary: grossSalary - Math.round(tax) 
      } 
    })
  }),

  // Payroll Runs
  http.get('/api/payroll/runs', ({ request }) => {
    const url = new URL(request.url)
    const year = url.searchParams.get('year')
    const status = url.searchParams.get('status')

    let filteredRuns = payrollRuns

    if (year) {
      filteredRuns = filteredRuns.filter(run => 
        new Date(run.startDate).getFullYear() === parseInt(year)
      )
    }

    if (status) {
      filteredRuns = filteredRuns.filter(run => run.status === status)
    }

    return HttpResponse.json({ data: filteredRuns })
  }),

  http.get('/api/payroll/runs/:id', ({ params }) => {
    const run = payrollRuns.find(r => r.id === params.id)
    if (!run) {
      return HttpResponse.json({ error: 'Payroll run not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: run })
  }),

  http.post('/api/payroll/runs', async ({ request }) => {
    const newRunData = await request.json() as Partial<PayrollRun>
    const newRun: PayrollRun = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completedAt: null,
      ...newRunData
    } as PayrollRun

    payrollRuns.push(newRun)
    return HttpResponse.json({ data: newRun }, { status: 201 })
  }),

  http.put('/api/payroll/runs/:id', async ({ params, request }) => {
    const runIndex = payrollRuns.findIndex(r => r.id === params.id)
    if (runIndex === -1) {
      return HttpResponse.json({ error: 'Payroll run not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<PayrollRun>
    payrollRuns[runIndex] = {
      ...payrollRuns[runIndex],
      ...updates
    }

    return HttpResponse.json({ data: payrollRuns[runIndex] })
  }),

  // Payroll Statistics
  http.get('/api/payroll/stats', ({ request }) => {
    const url = new URL(request.url)
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString())
    const month = url.searchParams.get('month')

    let filteredPayslips = payslips.filter(p => 
      new Date(p.payDate).getFullYear() === year
    )

    if (month) {
      filteredPayslips = filteredPayslips.filter(p => 
        new Date(p.payDate).getMonth() === parseInt(month) - 1
      )
    }

    const stats = {
      totalGrossSalary: filteredPayslips.reduce((sum, p) => sum + p.grossSalary, 0),
      totalNetSalary: filteredPayslips.reduce((sum, p) => sum + p.netSalary, 0),
      totalDeductions: filteredPayslips.reduce((sum, p) => sum + p.totalDeductions, 0),
      totalAllowances: filteredPayslips.reduce((sum, p) => sum + p.totalAllowances, 0),
      averageSalary: filteredPayslips.length > 0 
        ? filteredPayslips.reduce((sum, p) => sum + p.grossSalary, 0) / filteredPayslips.length 
        : 0,
      employeeCount: new Set(filteredPayslips.map(p => p.employeeId)).size
    }

    return HttpResponse.json({ data: stats })
  })
]