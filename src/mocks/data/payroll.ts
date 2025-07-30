import { factory, primaryKey } from '@mswjs/data';
import { faker } from '@faker-js/faker';

export const payrollModel = factory({
  payslip: {
    id: primaryKey(() => faker.string.uuid()),
    employeeId: () => faker.string.uuid(),
    employeeName: () => faker.person.fullName(),
    month: () => faker.date.month(),
    year: () => faker.date.recent().getFullYear(),
    basicSalary: () => faker.number.int({ min: 3000, max: 12000 }),
    allowances: () => faker.number.int({ min: 500, max: 2000 }),
    deductions: () => faker.number.int({ min: 200, max: 1000 }),
    tax: () => faker.number.int({ min: 500, max: 2500 }),
    netSalary: () => faker.number.int({ min: 2500, max: 10000 }),
    status: () => faker.helpers.arrayElement(['Processed', 'Pending', 'Draft'])
  },
  salaryStructure: {
    id: primaryKey(() => faker.string.uuid()),
    position: () => faker.helpers.arrayElement([
      'Software Engineer', 'Senior Developer', 'Product Manager', 'Designer'
    ]),
    level: () => faker.helpers.arrayElement(['Junior', 'Mid', 'Senior', 'Lead']),
    minSalary: () => faker.number.int({ min: 40000, max: 80000 }),
    maxSalary: () => faker.number.int({ min: 80000, max: 200000 }),
    currency: () => 'USD'
  }
});

// Generate payroll data
for (let i = 0; i < 50; i++) {
  payrollModel.payslip.create();
}

for (let i = 0; i < 10; i++) {
  payrollModel.salaryStructure.create();
}