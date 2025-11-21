import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@nexushr.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      employee: {
        create: {
          employeeId: 'EMP001',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@nexushr.com',
          position: 'System Administrator',
          department: 'IT',
          location: 'Head Office',
          hireDate: new Date('2020-01-01'),
          status: 'ACTIVE',
          salary: 100000,
          skills: ['Management', 'System Administration'],
        },
      },
    },
  });

  // Create sample employees
  const employees = [
    {
      email: 'john.doe@nexushr.com',
      firstName: 'John',
      lastName: 'Doe',
      position: 'Software Engineer',
      department: 'Engineering',
      location: 'New York',
      salary: 85000,
      skills: ['JavaScript', 'React', 'Node.js'],
    },
    {
      email: 'jane.smith@nexushr.com',
      firstName: 'Jane',
      lastName: 'Smith',
      position: 'HR Manager',
      department: 'Human Resources',
      location: 'San Francisco',
      salary: 75000,
      skills: ['Recruitment', 'Employee Relations', 'Performance Management'],
    },
    {
      email: 'mike.johnson@nexushr.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      position: 'Product Manager',
      department: 'Product',
      location: 'Austin',
      salary: 90000,
      skills: ['Product Strategy', 'Agile', 'User Research'],
    },
  ];

  for (const [index, emp] of employees.entries()) {
    const password = await bcrypt.hash('password123', 10);

    await prisma.user.create({
      data: {
        email: emp.email,
        password,
        firstName: emp.firstName,
        lastName: emp.lastName,
        role: 'EMPLOYEE',
        employee: {
          create: {
            employeeId: `EMP00${index + 2}`,
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            position: emp.position,
            department: emp.department,
            location: emp.location,
            hireDate: new Date('2022-01-15'),
            status: 'ACTIVE',
            salary: emp.salary,
            skills: emp.skills,
          },
        },
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('Admin: admin@nexushr.com / admin123');
  console.log('Employee: john.doe@nexushr.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
