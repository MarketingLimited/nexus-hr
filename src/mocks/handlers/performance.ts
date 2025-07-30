import { http, HttpResponse } from 'msw';
import { performanceModel } from '../data/performance';

export const performanceHandlers = [
  // Get performance reviews
  http.get('/api/performance/reviews', ({ request }) => {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    
    let reviews = performanceModel.review.getAll();
    
    if (employeeId) {
      reviews = reviews.filter(review => review.employeeId === employeeId);
    }

    return HttpResponse.json({ reviews });
  }),

  // Submit performance review
  http.post('/api/performance/reviews', async ({ request }) => {
    const reviewData = await request.json() as any;
    const newReview = performanceModel.review.create({
      ...reviewData,
      status: 'Draft'
    });
    return HttpResponse.json(newReview, { status: 201 });
  }),

  // Update performance review
  http.put('/api/performance/reviews/:id', async ({ params, request }) => {
    const updates = await request.json() as any;
    const updatedReview = performanceModel.review.update({
      where: { id: { equals: params.id as string } },
      data: updates
    });

    if (!updatedReview) {
      return HttpResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return HttpResponse.json(updatedReview);
  }),

  // Get goals
  http.get('/api/performance/goals', ({ request }) => {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    
    let goals = performanceModel.goal.getAll();
    
    if (employeeId) {
      goals = goals.filter(goal => goal.employeeId === employeeId);
    }

    return HttpResponse.json({ goals });
  }),

  // Create goal
  http.post('/api/performance/goals', async ({ request }) => {
    const goalData = await request.json() as any;
    const newGoal = performanceModel.goal.create(goalData);
    return HttpResponse.json(newGoal, { status: 201 });
  }),

  // Update goal
  http.put('/api/performance/goals/:id', async ({ params, request }) => {
    const updates = await request.json() as any;
    const updatedGoal = performanceModel.goal.update({
      where: { id: { equals: params.id as string } },
      data: updates
    });

    if (!updatedGoal) {
      return HttpResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return HttpResponse.json(updatedGoal);
  })
];