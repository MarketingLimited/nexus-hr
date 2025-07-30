import { factory, primaryKey } from '@mswjs/data';
import { faker } from '@faker-js/faker';

export const leaveModel = factory({
  leaveRequest: {
    id: primaryKey(() => faker.string.uuid()),
    employeeId: () => faker.string.uuid(),
    employeeName: () => faker.person.fullName(),
    type: () => faker.helpers.arrayElement(['Annual', 'Sick', 'Personal', 'Maternity', 'Paternity']),
    startDate: () => faker.date.future().toISOString(),
    endDate: () => faker.date.future().toISOString(),
    days: () => faker.number.int({ min: 1, max: 14 }),
    reason: () => faker.lorem.sentence(),
    status: () => faker.helpers.arrayElement(['Pending', 'Approved', 'Rejected']),
    appliedDate: () => faker.date.past().toISOString(),
    approver: () => faker.person.fullName(),
    comments: () => faker.lorem.paragraph()
  },
  leaveBalance: {
    id: primaryKey(() => faker.string.uuid()),
    employeeId: () => faker.string.uuid(),
    employeeName: () => faker.person.fullName(),
    annual: () => faker.number.int({ min: 10, max: 25 }),
    sick: () => faker.number.int({ min: 5, max: 12 }),
    personal: () => faker.number.int({ min: 3, max: 8 }),
    used: () => faker.number.int({ min: 0, max: 15 }),
    remaining: () => faker.number.int({ min: 5, max: 20 })
  }
});

// Generate sample leave data
for (let i = 0; i < 30; i++) {
  leaveModel.leaveRequest.create();
  leaveModel.leaveBalance.create();
}