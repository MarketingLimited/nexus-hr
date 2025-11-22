# Data Pipeline Engineer Agent

ETL processes, data transformation, and data workflows for Nexus HR.

## ETL Patterns

### Extract

**From CSV:**
```typescript
import fs from 'fs';
import csv from 'csv-parser';

export async function extractFromCSV(filePath: string) {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}
```

**From API:**
```typescript
export async function extractFromAPI(endpoint: string) {
  const response = await fetch(endpoint);
  return response.json();
}
```

### Transform

**Data Transformation:**
```typescript
export function transformEmployeeData(rawData: any[]) {
  return rawData.map(row => ({
    firstName: row.first_name?.trim(),
    lastName: row.last_name?.trim(),
    email: row.email?.toLowerCase(),
    hireDate: new Date(row.hire_date),
    salary: parseFloat(row.salary)
  }));
}
```

**Validation:**
```typescript
import { z } from 'zod';

const employeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email()
});

export function validateData(data: any[]) {
  return data.filter(row => {
    try {
      employeeSchema.parse(row);
      return true;
    } catch {
      console.error('Invalid row:', row);
      return false;
    }
  });
}
```

### Load

**Batch Insert:**
```typescript
export async function loadEmployees(employees: Employee[]) {
  await prisma.employee.createMany({
    data: employees,
    skipDuplicates: true
  });
}
```

**Incremental Load:**
```typescript
export async function loadIncremental(data: any[]) {
  for (const row of data) {
    await prisma.employee.upsert({
      where: { email: row.email },
      update: row,
      create: row
    });
  }
}
```

## Data Import/Export

**Import Employees:**
```typescript
export async function importEmployees(filePath: string) {
  // Extract
  const rawData = await extractFromCSV(filePath);

  // Transform
  const transformedData = transformEmployeeData(rawData);

  // Validate
  const validData = validateData(transformedData);

  // Load
  await loadEmployees(validData);

  return {
    total: rawData.length,
    imported: validData.length,
    skipped: rawData.length - validData.length
  };
}
```

**Export Data:**
```typescript
import { stringify } from 'csv-stringify';

export async function exportEmployees(filters: any) {
  const employees = await prisma.employee.findMany({
    where: filters
  });

  return new Promise((resolve, reject) => {
    stringify(employees, {
      header: true
    }, (err, output) => {
      if (err) reject(err);
      else resolve(output);
    });
  });
}
```

## Scheduled Jobs

**Using Bull Queue:**
```typescript
import Bull from 'bull';

const exportQueue = new Bull('data-export', process.env.REDIS_URL);

// Schedule daily export
exportQueue.add('daily-export', {}, {
  repeat: { cron: '0 0 * * *' }  // Midnight daily
});

// Process job
exportQueue.process('daily-export', async () => {
  const data = await exportEmployees({});
  await uploadToS3(data);
});
```

## Resources

- ETL scripts: `server/src/jobs/`
- Import templates: `templates/`
