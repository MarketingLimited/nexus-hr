import { factory, primaryKey } from '@mswjs/data';
import { faker } from '@faker-js/faker';

// Create employee data model
export const employeeModel = factory({
  employee: {
    id: primaryKey(() => faker.string.uuid()),
    firstName: () => faker.person.firstName(),
    lastName: () => faker.person.lastName(),
    email: () => faker.internet.email(),
    phone: () => faker.phone.number(),
    dateOfBirth: () => faker.date.birthdate().toISOString(),
    employeeId: () => faker.string.alphanumeric(6).toUpperCase(),
    position: () => faker.helpers.arrayElement([
      'Software Engineer', 'Senior Developer', 'Product Manager', 'Designer',
      'Data Analyst', 'HR Manager', 'Marketing Specialist', 'Sales Manager'
    ]),
    department: () => faker.helpers.arrayElement([
      'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance'
    ]),
    manager: () => faker.person.fullName(),
    startDate: () => faker.date.past({ years: 5 }).toISOString(),
    employmentType: () => faker.helpers.arrayElement(['Full-time', 'Part-time', 'Contract']),
    status: () => faker.helpers.arrayElement(['Active', 'Inactive', 'On Leave']),
    salary: () => faker.number.int({ min: 40000, max: 150000 }),
    location: () => faker.helpers.arrayElement(['Remote', 'Office', 'Hybrid']),
    avatar: () => faker.image.avatar(),
    bio: () => faker.lorem.paragraph()
  }
});

// Generate initial employee data
const generateEmployees = (count: number = 50) => {
  for (let i = 0; i < count; i++) {
    employeeModel.employee.create();
  }
};

// Initialize with sample data
generateEmployees();