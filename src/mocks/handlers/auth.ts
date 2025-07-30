import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

// Mock user session
let currentUser = {
  id: faker.string.uuid(),
  email: 'admin@company.com',
  name: 'Admin User',
  role: 'Admin',
  permissions: ['read', 'write', 'delete', 'admin'],
  avatar: faker.image.avatar()
};

export const authHandlers = [
  // Login
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as any;
    const { email, password } = body;
    
    // Simulate authentication (accept any credentials for demo)
    if (email && password) {
      const token = faker.string.alphanumeric(32);
      return HttpResponse.json({
        user: currentUser,
        token,
        expiresIn: 3600
      });
    }

    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // Get current user
  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return HttpResponse.json(currentUser);
  }),

  // Logout
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Refresh token
  http.post('/api/auth/refresh', () => {
    const newToken = faker.string.alphanumeric(32);
    return HttpResponse.json({
      token: newToken,
      expiresIn: 3600
    });
  })
];