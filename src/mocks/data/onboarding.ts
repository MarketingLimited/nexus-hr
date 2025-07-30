import { faker } from '@faker-js/faker'

export interface OnboardingWorkflow {
  id: string
  name: string
  description: string
  departmentId: string
  duration: number // days
  tasks: OnboardingTask[]
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface OnboardingTask {
  id: string
  title: string
  description: string
  type: 'document' | 'meeting' | 'training' | 'setup' | 'review'
  category: 'hr' | 'it' | 'department' | 'compliance' | 'culture'
  dueDate: number // days from start
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo: 'employee' | 'manager' | 'hr' | 'it' | string // employee ID
  dependencies: string[] // task IDs
  resources: {
    documents: string[]
    links: string[]
    contacts: string[]
  }
  estimatedHours: number
  isRequired: boolean
  createdAt: string
}

export interface OnboardingSession {
  id: string
  employeeId: string
  workflowId: string
  startDate: string
  expectedEndDate: string
  actualEndDate: string | null
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  progress: number // 0-100
  currentPhase: string
  assignedMentor: string | null
  tasks: OnboardingTaskProgress[]
  feedback: OnboardingFeedback[]
  createdAt: string
  updatedAt: string
}

export interface OnboardingTaskProgress {
  taskId: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'overdue'
  startedAt: string | null
  completedAt: string | null
  assignedTo: string
  notes: string | null
  attachments: string[]
  feedback: string | null
  hoursSpent: number
}

export interface OnboardingFeedback {
  id: string
  sessionId: string
  type: 'weekly' | 'milestone' | 'completion' | 'issue'
  rating: number // 1-5
  comments: string
  submittedBy: string
  submittedAt: string
  areas: {
    clarity: number
    support: number
    resources: number
    timeline: number
    overall: number
  }
}

export interface OnboardingChecklist {
  id: string
  name: string
  items: {
    id: string
    title: string
    description: string
    category: 'documentation' | 'access' | 'equipment' | 'training' | 'introduction'
    isRequired: boolean
    completedBy: string | null
    completedAt: string | null
  }[]
  departmentId: string
  createdAt: string
  updatedAt: string
}

const taskTypes = ['document', 'meeting', 'training', 'setup', 'review'] as const
const categories = ['hr', 'it', 'department', 'compliance', 'culture'] as const
const priorities = ['low', 'medium', 'high', 'critical'] as const

export const generateOnboardingTasks = (count: number = 20): OnboardingTask[] => {
  const tasks: OnboardingTask[] = []
  
  for (let i = 0; i < count; i++) {
    tasks.push({
      id: faker.string.uuid(),
      title: faker.helpers.arrayElement([
        'Complete Employee Handbook Review',
        'IT Equipment Setup',
        'Security Training Module',
        'Department Introduction Meeting',
        'Benefits Enrollment',
        'Workspace Setup',
        'Team Introduction',
        'Company Culture Training',
        'Compliance Training',
        'Project Assignment',
        'Mentor Introduction',
        'First Week Check-in',
        'Performance Goals Setting',
        'System Access Setup',
        'Emergency Procedures Training'
      ]),
      description: faker.lorem.paragraph(),
      type: faker.helpers.arrayElement(taskTypes),
      category: faker.helpers.arrayElement(categories),
      dueDate: faker.number.int({ min: 1, max: 30 }),
      priority: faker.helpers.arrayElement(priorities),
      assignedTo: faker.helpers.arrayElement(['employee', 'manager', 'hr', 'it']),
      dependencies: i > 0 ? faker.helpers.arrayElements(
        tasks.slice(0, i).map(t => t.id), 
        { min: 0, max: 2 }
      ) : [],
      resources: {
        documents: faker.helpers.arrayElements([
          'Employee Handbook', 'IT Policies', 'Security Guidelines',
          'Benefits Guide', 'Organization Chart', 'Project Documentation'
        ], { min: 1, max: 3 }),
        links: faker.helpers.arrayElements([
          'https://company-portal.com/onboarding',
          'https://training.company.com/security',
          'https://benefits.company.com/enrollment'
        ], { min: 0, max: 2 }),
        contacts: faker.helpers.arrayElements([
          'HR Team', 'IT Support', 'Direct Manager', 'Mentor'
        ], { min: 1, max: 2 })
      },
      estimatedHours: faker.number.float({ min: 0.5, max: 8, fractionDigits: 1 }),
      isRequired: faker.datatype.boolean({ probability: 0.7 }),
      createdAt: faker.date.past({ years: 1 }).toISOString()
    })
  }
  
  return tasks
}

export const generateOnboardingWorkflows = (departmentIds: string[]): OnboardingWorkflow[] => {
  return departmentIds.map(departmentId => ({
    id: faker.string.uuid(),
    name: `${faker.helpers.arrayElement(['Standard', 'Executive', 'Remote', 'Intern'])} Onboarding`,
    description: faker.lorem.paragraph(),
    departmentId,
    duration: faker.number.int({ min: 14, max: 90 }),
    tasks: generateOnboardingTasks(faker.number.int({ min: 10, max: 25 })),
    isActive: faker.datatype.boolean({ probability: 0.8 }),
    createdBy: faker.string.uuid(),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent().toISOString()
  }))
}

export const generateOnboardingSessions = (
  employeeIds: string[], 
  workflowIds: string[], 
  count: number = 30
): OnboardingSession[] => {
  return Array.from({ length: count }, () => {
    const startDate = faker.date.past({ years: 1 })
    const workflow = faker.helpers.arrayElement(workflowIds)
    const duration = faker.number.int({ min: 14, max: 60 })
    const expectedEndDate = new Date(startDate)
    expectedEndDate.setDate(expectedEndDate.getDate() + duration)
    
    const status = faker.helpers.weightedArrayElement([
      { weight: 40, value: 'completed' },
      { weight: 30, value: 'in_progress' },
      { weight: 15, value: 'not_started' },
      { weight: 10, value: 'on_hold' },
      { weight: 5, value: 'cancelled' }
    ])
    
    const progress = status === 'completed' ? 100 :
                    status === 'in_progress' ? faker.number.int({ min: 10, max: 90 }) :
                    status === 'not_started' ? 0 :
                    faker.number.int({ min: 5, max: 50 })
    
    // Generate task progress for workflow tasks
    const taskCount = faker.number.int({ min: 8, max: 15 })
    const taskProgress: OnboardingTaskProgress[] = Array.from({ length: taskCount }, () => {
      const taskStatus = faker.helpers.weightedArrayElement([
        { weight: 50, value: 'completed' },
        { weight: 20, value: 'in_progress' },
        { weight: 15, value: 'pending' },
        { weight: 10, value: 'overdue' },
        { weight: 5, value: 'skipped' }
      ])
      
      return {
        taskId: faker.string.uuid(),
        status: taskStatus,
        startedAt: taskStatus !== 'pending' ? faker.date.between({ from: startDate, to: new Date() }).toISOString() : null,
        completedAt: taskStatus === 'completed' ? faker.date.between({ from: startDate, to: new Date() }).toISOString() : null,
        assignedTo: faker.helpers.arrayElement(employeeIds),
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }),
        attachments: faker.helpers.arrayElements([
          'signed_handbook.pdf', 'id_verification.jpg', 'emergency_contact.pdf'
        ], { min: 0, max: 2 }),
        feedback: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
        hoursSpent: faker.number.float({ min: 0, max: 8, fractionDigits: 1 })
      }
    })
    
    // Generate feedback
    const feedback: OnboardingFeedback[] = Array.from({ 
      length: faker.number.int({ min: 1, max: 4 }) 
    }, () => ({
      id: faker.string.uuid(),
      sessionId: faker.string.uuid(),
      type: faker.helpers.arrayElement(['weekly', 'milestone', 'completion', 'issue']),
      rating: faker.number.int({ min: 1, max: 5 }),
      comments: faker.lorem.paragraph(),
      submittedBy: faker.helpers.arrayElement(employeeIds),
      submittedAt: faker.date.between({ from: startDate, to: new Date() }).toISOString(),
      areas: {
        clarity: faker.number.int({ min: 1, max: 5 }),
        support: faker.number.int({ min: 1, max: 5 }),
        resources: faker.number.int({ min: 1, max: 5 }),
        timeline: faker.number.int({ min: 1, max: 5 }),
        overall: faker.number.int({ min: 1, max: 5 })
      }
    }))
    
    return {
      id: faker.string.uuid(),
      employeeId: faker.helpers.arrayElement(employeeIds),
      workflowId: workflow,
      startDate: startDate.toISOString(),
      expectedEndDate: expectedEndDate.toISOString(),
      actualEndDate: status === 'completed' ? faker.date.between({ from: startDate, to: expectedEndDate }).toISOString() : null,
      status,
      progress,
      currentPhase: faker.helpers.arrayElement(['Preparation', 'First Week', 'Department Integration', 'Skills Training', 'Final Review']),
      assignedMentor: faker.helpers.maybe(() => faker.helpers.arrayElement(employeeIds), { probability: 0.8 }),
      tasks: taskProgress,
      feedback,
      createdAt: startDate.toISOString(),
      updatedAt: faker.date.recent().toISOString()
    }
  })
}

export const generateOnboardingChecklists = (departmentIds: string[]): OnboardingChecklist[] => {
  return departmentIds.map(departmentId => ({
    id: faker.string.uuid(),
    name: `${faker.company.name()} Onboarding Checklist`,
    items: [
      {
        id: faker.string.uuid(),
        title: 'Complete I-9 Form',
        description: 'Verify work authorization documents',
        category: 'documentation',
        isRequired: true,
        completedBy: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.8 }),
        completedAt: faker.helpers.maybe(() => faker.date.recent().toISOString(), { probability: 0.8 })
      },
      {
        id: faker.string.uuid(),
        title: 'Setup Laptop and Accounts',
        description: 'Configure work laptop and create necessary accounts',
        category: 'equipment',
        isRequired: true,
        completedBy: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.9 }),
        completedAt: faker.helpers.maybe(() => faker.date.recent().toISOString(), { probability: 0.9 })
      },
      {
        id: faker.string.uuid(),
        title: 'Security Badge Assignment',
        description: 'Issue security badge for building access',
        category: 'access',
        isRequired: true,
        completedBy: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.85 }),
        completedAt: faker.helpers.maybe(() => faker.date.recent().toISOString(), { probability: 0.85 })
      },
      {
        id: faker.string.uuid(),
        title: 'Complete Safety Training',
        description: 'Complete mandatory safety and security training',
        category: 'training',
        isRequired: true,
        completedBy: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.7 }),
        completedAt: faker.helpers.maybe(() => faker.date.recent().toISOString(), { probability: 0.7 })
      },
      {
        id: faker.string.uuid(),
        title: 'Meet Team Members',
        description: 'Introduction meeting with immediate team',
        category: 'introduction',
        isRequired: false,
        completedBy: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.9 }),
        completedAt: faker.helpers.maybe(() => faker.date.recent().toISOString(), { probability: 0.9 })
      }
    ],
    departmentId,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent().toISOString()
  }))
}