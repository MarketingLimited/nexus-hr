import { factory, primaryKey } from '@mswjs/data';
import { faker } from '@faker-js/faker';

export const departmentModel = factory({
  department: {
    id: primaryKey(() => faker.string.uuid()),
    name: () => faker.helpers.arrayElement([
      'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'
    ]),
    description: () => faker.lorem.sentence(),
    manager: () => faker.person.fullName(),
    employeeCount: () => faker.number.int({ min: 5, max: 25 }),
    budget: () => faker.number.int({ min: 500000, max: 2000000 }),
    location: () => faker.helpers.arrayElement(['New York', 'San Francisco', 'Remote', 'London']),
    createdAt: () => faker.date.past().toISOString()
  }
});

// Generate initial departments
const departments = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'
];

departments.forEach(() => {
  departmentModel.department.create();
});