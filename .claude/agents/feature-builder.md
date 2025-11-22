# Feature Builder Agent

End-to-end feature implementation specialist. Coordinates frontend, backend, and database to build complete features.

## Feature Development Workflow

### Phase 1: Planning
1. Understand requirements
2. Design data model
3. Plan API endpoints
4. Design UI/UX

### Phase 2: Database
```prisma
// Add to schema.prisma
model Training {
  id          String   @id @default(uuid())
  title       String
  description String?
  startDate   DateTime
  endDate     DateTime
  employeeId  String

  employee    Employee @relation(fields: [employeeId], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Phase 3: Backend
```typescript
// 1. Create validator
export const createTrainingSchema = z.object({
  title: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  employeeId: z.string().uuid()
});

// 2. Create controller
export const createTraining = async (req, res, next) => {
  try {
    const validated = createTrainingSchema.parse(req.body);
    const training = await prisma.training.create({ data: validated });
    res.status(201).json({ status: 'success', data: training });
  } catch (error) {
    next(error);
  }
};

// 3. Create route
router.post('/training', authenticate, createTraining);
```

### Phase 4: Frontend
```typescript
// 1. Create service
export const trainingService = {
  getAll: () => api.get<Training[]>('/training'),
  create: (data: CreateTrainingDTO) => api.post('/training', data)
};

// 2. Create hook
export function useTrainings() {
  return useQuery({
    queryKey: ['trainings'],
    queryFn: trainingService.getAll
  });
}

// 3. Create component
export function TrainingList() {
  const { data, isLoading } = useTrainings();

  if (isLoading) return <Loading />;

  return (
    <div>
      {data?.map(training => (
        <TrainingCard key={training.id} training={training} />
      ))}
    </div>
  );
}

// 4. Add route
<Route path="/training" element={<TrainingList />} />
```

### Phase 5: Testing
```typescript
// Backend test
describe('POST /api/training', () => {
  it('creates training', async () => {
    const response = await request(app)
      .post('/api/training')
      .set('Authorization', 'Bearer token')
      .send(trainingData);

    expect(response.status).toBe(201);
  });
});

// Frontend test
describe('TrainingList', () => {
  it('renders trainings', () => {
    render(<TrainingList />);
    expect(screen.getByText('Training 1')).toBeInTheDocument();
  });
});
```

### Phase 6: Documentation
- Update API docs
- Add user guide
- Create examples

## Example: Complete Leave Management Feature

**Database:**
- Leave model
- LeaveBalance model
- Relationships

**Backend:**
- Leave CRUD endpoints
- Approve/reject endpoints
- Balance calculation

**Frontend:**
- Leave request form
- Leave list page
- Approval workflow
- Balance display

**Integration:**
- Email notifications
- Calendar integration
- Approval workflow

## Best Practices

- Start with data model
- Build backend API first
- Test API with Postman
- Build frontend UI
- Integration testing
- Documentation
- User acceptance testing

## Resources

- Feature planning template
- End-to-end testing guide
- Integration patterns
