import { faker } from '@faker-js/faker'

export interface Goal {
  id: string
  employeeId: string
  title: string
  description: string
  category: 'performance' | 'development' | 'behavioral' | 'project'
  priority: 'low' | 'medium' | 'high' | 'critical'
  targetDate: string
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue'
  progress: number
  metrics: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PerformanceReview {
  id: string
  employeeId: string
  reviewerId: string
  period: string
  type: 'annual' | 'quarterly' | 'probation' | 'project'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  overallRating: number
  competencies: {
    name: string
    rating: number
    comments: string
  }[]
  goals: string[]
  feedback: {
    strengths: string[]
    improvements: string[]
    developmentPlan: string
  }
  selfAssessment: {
    achievements: string
    challenges: string
    goals: string
  } | null
  reviewDate: string
  createdAt: string
  updatedAt: string
}

export interface Feedback {
  id: string
  fromEmployeeId: string
  toEmployeeId: string
  type: '360' | 'peer' | 'upward' | 'downward' | 'self'
  category: 'performance' | 'collaboration' | 'leadership' | 'technical' | 'communication'
  rating: number
  comments: string
  anonymous: boolean
  status: 'draft' | 'submitted' | 'acknowledged'
  createdAt: string
  updatedAt: string
}

export interface PerformanceMetric {
  id: string
  employeeId: string
  period: string
  metrics: {
    productivity: number
    quality: number
    collaboration: number
    innovation: number
    leadership: number
    communication: number
  }
  kpis: {
    name: string
    target: number
    actual: number
    unit: string
  }[]
  calculatedAt: string
}

const competencyNames = [
  'Communication', 'Leadership', 'Problem Solving', 'Teamwork', 
  'Technical Skills', 'Innovation', 'Adaptability', 'Customer Focus',
  'Time Management', 'Decision Making', 'Conflict Resolution', 'Mentoring'
]

const goalCategories = ['performance', 'development', 'behavioral', 'project'] as const
const priorities = ['low', 'medium', 'high', 'critical'] as const
const feedbackTypes = ['360', 'peer', 'upward', 'downward', 'self'] as const
const feedbackCategories = ['performance', 'collaboration', 'leadership', 'technical', 'communication'] as const

export const generateGoals = (employeeIds: string[], count: number = 200): Goal[] => {
  return Array.from({ length: count }, () => {
    const progress = faker.number.int({ min: 0, max: 100 })
    const targetDate = faker.date.future({ years: 1 })
    const createdAt = faker.date.past({ years: 1 })
    
    let status: Goal['status'] = 'not_started'
    if (progress > 0 && progress < 100) status = 'in_progress'
    if (progress === 100) status = 'completed'
    if (targetDate < new Date() && progress < 100) status = 'overdue'
    
    return {
      id: faker.string.uuid(),
      employeeId: faker.helpers.arrayElement(employeeIds),
      title: faker.lorem.sentence({ min: 3, max: 7 }),
      description: faker.lorem.paragraph(),
      category: faker.helpers.arrayElement(goalCategories),
      priority: faker.helpers.arrayElement(priorities),
      targetDate: targetDate.toISOString(),
      status,
      progress,
      metrics: faker.helpers.arrayElements([
        'Completion rate', 'Quality score', 'Timeline adherence', 
        'Budget compliance', 'Stakeholder satisfaction', 'Team collaboration'
      ], { min: 1, max: 3 }),
      createdBy: faker.helpers.arrayElement(employeeIds),
      createdAt: createdAt.toISOString(),
      updatedAt: faker.date.recent().toISOString()
    }
  })
}

export const generatePerformanceReviews = (employeeIds: string[], count: number = 150): PerformanceReview[] => {
  return Array.from({ length: count }, () => {
    const overallRating = faker.number.float({ min: 1, max: 5, fractionDigits: 1 })
    
    return {
      id: faker.string.uuid(),
      employeeId: faker.helpers.arrayElement(employeeIds),
      reviewerId: faker.helpers.arrayElement(employeeIds),
      period: `${faker.date.past({ years: 1 }).getFullYear()}-Q${faker.number.int({ min: 1, max: 4 })}`,
      type: faker.helpers.weightedArrayElement([
        { weight: 40, value: 'quarterly' },
        { weight: 30, value: 'annual' },
        { weight: 20, value: 'project' },
        { weight: 10, value: 'probation' }
      ]),
      status: faker.helpers.weightedArrayElement([
        { weight: 60, value: 'completed' },
        { weight: 25, value: 'in_progress' },
        { weight: 10, value: 'pending' },
        { weight: 5, value: 'cancelled' }
      ]),
      overallRating,
      competencies: faker.helpers.arrayElements(competencyNames, { min: 5, max: 8 }).map(name => ({
        name,
        rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
        comments: faker.lorem.sentence()
      })),
      goals: faker.helpers.arrayElements(
        Array.from({ length: 10 }, () => faker.string.uuid()), 
        { min: 2, max: 5 }
      ),
      feedback: {
        strengths: faker.helpers.arrayElements([
          'Strong technical skills', 'Great team player', 'Excellent communication',
          'Proactive approach', 'Problem-solving abilities', 'Leadership potential',
          'Attention to detail', 'Customer-focused mindset'
        ], { min: 2, max: 4 }),
        improvements: faker.helpers.arrayElements([
          'Time management', 'Delegation skills', 'Public speaking',
          'Technical documentation', 'Cross-team collaboration', 'Strategic thinking',
          'Data analysis', 'Conflict resolution'
        ], { min: 1, max: 3 }),
        developmentPlan: faker.lorem.paragraph()
      },
      selfAssessment: faker.helpers.maybe(() => ({
        achievements: faker.lorem.paragraph(),
        challenges: faker.lorem.paragraph(),
        goals: faker.lorem.paragraph()
      }), { probability: 0.8 }),
      reviewDate: faker.date.past({ years: 1 }).toISOString(),
      createdAt: faker.date.past({ years: 1 }).toISOString(),
      updatedAt: faker.date.recent().toISOString()
    }
  })
}

export const generateFeedback = (employeeIds: string[], count: number = 300): Feedback[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    fromEmployeeId: faker.helpers.arrayElement(employeeIds),
    toEmployeeId: faker.helpers.arrayElement(employeeIds),
    type: faker.helpers.arrayElement(feedbackTypes),
    category: faker.helpers.arrayElement(feedbackCategories),
    rating: faker.number.int({ min: 1, max: 5 }),
    comments: faker.lorem.paragraph(),
    anonymous: faker.datatype.boolean({ probability: 0.3 }),
    status: faker.helpers.weightedArrayElement([
      { weight: 70, value: 'submitted' },
      { weight: 20, value: 'acknowledged' },
      { weight: 10, value: 'draft' }
    ]),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent().toISOString()
  }))
}

export const generatePerformanceMetrics = (employeeIds: string[]): PerformanceMetric[] => {
  return employeeIds.map(employeeId => ({
    id: faker.string.uuid(),
    employeeId,
    period: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
    metrics: {
      productivity: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
      quality: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
      collaboration: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
      innovation: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
      leadership: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
      communication: faker.number.float({ min: 1, max: 5, fractionDigits: 1 })
    },
    kpis: [
      {
        name: 'Tasks Completed',
        target: faker.number.int({ min: 20, max: 50 }),
        actual: faker.number.int({ min: 15, max: 55 }),
        unit: 'tasks'
      },
      {
        name: 'Quality Score',
        target: 90,
        actual: faker.number.int({ min: 75, max: 98 }),
        unit: '%'
      },
      {
        name: 'Customer Satisfaction',
        target: 4.5,
        actual: faker.number.float({ min: 3.8, max: 5.0, fractionDigits: 1 }),
        unit: 'rating'
      }
    ],
    calculatedAt: faker.date.recent().toISOString()
  }))
}