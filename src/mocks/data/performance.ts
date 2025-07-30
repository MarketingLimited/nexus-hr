import { factory, primaryKey } from '@mswjs/data';
import { faker } from '@faker-js/faker';

export const performanceModel = factory({
  review: {
    id: primaryKey(() => faker.string.uuid()),
    employeeId: () => faker.string.uuid(),
    employeeName: () => faker.person.fullName(),
    reviewPeriod: () => `Q${faker.number.int({ min: 1, max: 4 })} ${faker.date.recent().getFullYear()}`,
    reviewer: () => faker.person.fullName(),
    overallRating: () => faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
    goals: () => faker.helpers.arrayElements([
      'Improve code quality', 'Learn new technology', 'Mentor junior developers',
      'Increase productivity', 'Enhance communication skills'
    ], { min: 2, max: 4 }),
    achievements: () => faker.lorem.paragraph(),
    areasForImprovement: () => faker.lorem.paragraph(),
    status: () => faker.helpers.arrayElement(['Draft', 'In Progress', 'Completed', 'Approved'])
  },
  goal: {
    id: primaryKey(() => faker.string.uuid()),
    employeeId: () => faker.string.uuid(),
    title: () => faker.lorem.words(3),
    description: () => faker.lorem.sentence(),
    category: () => faker.helpers.arrayElement(['Technical', 'Leadership', 'Communication', 'Business']),
    priority: () => faker.helpers.arrayElement(['High', 'Medium', 'Low']),
    progress: () => faker.number.int({ min: 0, max: 100 }),
    dueDate: () => faker.date.future().toISOString(),
    status: () => faker.helpers.arrayElement(['Not Started', 'In Progress', 'Completed', 'Overdue'])
  }
});

// Generate performance data
for (let i = 0; i < 40; i++) {
  performanceModel.review.create();
  performanceModel.goal.create();
}