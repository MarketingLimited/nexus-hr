import { factory, primaryKey } from '@mswjs/data';
import { faker } from '@faker-js/faker';

export const attendanceModel = factory({
  attendanceRecord: {
    id: primaryKey(() => faker.string.uuid()),
    employeeId: () => faker.string.uuid(),
    employeeName: () => faker.person.fullName(),
    date: () => faker.date.recent().toISOString(),
    clockIn: () => faker.date.recent().toISOString(),
    clockOut: () => faker.date.recent().toISOString(),
    hoursWorked: () => faker.number.float({ min: 6, max: 10, fractionDigits: 2 }),
    status: () => faker.helpers.arrayElement(['Present', 'Late', 'Absent', 'Overtime']),
    location: () => faker.helpers.arrayElement(['Office', 'Remote', 'Client Site']),
    notes: () => faker.lorem.sentence()
  }
});

// Generate attendance records for the last 30 days
for (let i = 0; i < 100; i++) {
  attendanceModel.attendanceRecord.create();
}