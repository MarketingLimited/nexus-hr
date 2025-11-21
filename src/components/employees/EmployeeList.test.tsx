import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeList } from './EmployeeList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Mock API calls
const mockGetEmployees = vi.fn();
vi.mock('@/lib/api', () => ({
  getEmployees: () => mockGetEmployees(),
}));

// Mock components to simplify testing
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}));

describe('EmployeeList', () => {
  let queryClient: QueryClient;

  const mockEmployees = [
    {
      id: 'emp-1',
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      position: 'Software Engineer',
      department: 'Engineering',
      status: 'ACTIVE',
      hireDate: '2024-01-01',
    },
    {
      id: 'emp-2',
      employeeId: 'EMP002',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      position: 'Product Manager',
      department: 'Product',
      status: 'ACTIVE',
      hireDate: '2024-02-01',
    },
    {
      id: 'emp-3',
      employeeId: 'EMP003',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      position: 'Designer',
      department: 'Design',
      status: 'INACTIVE',
      hireDate: '2023-12-01',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const renderEmployeeList = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EmployeeList />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders employee list with employee data', async () => {
    mockGetEmployees.mockResolvedValue({
      data: mockEmployees,
      meta: {
        total: 3,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    });

    renderEmployeeList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  it('displays loading state while fetching employees', () => {
    mockGetEmployees.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 100))
    );

    renderEmployeeList();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays error message on failed fetch', async () => {
    mockGetEmployees.mockRejectedValue(new Error('Failed to fetch employees'));

    renderEmployeeList();

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to fetch employees/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no employees exist', async () => {
    mockGetEmployees.mockResolvedValue({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      },
    });

    renderEmployeeList();

    await waitFor(() => {
      expect(screen.getByText(/no employees found/i)).toBeInTheDocument();
    });
  });

  it('filters employees by search query', async () => {
    mockGetEmployees.mockResolvedValue({
      data: mockEmployees.filter((emp) => emp.firstName.toLowerCase().includes('john')),
      meta: {
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    });

    renderEmployeeList();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search employees/i);
    await user.type(searchInput, 'John');

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('filters employees by department', async () => {
    mockGetEmployees.mockResolvedValue({
      data: mockEmployees.filter((emp) => emp.department === 'Engineering'),
      meta: {
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    });

    renderEmployeeList();
    const user = userEvent.setup();

    const departmentFilter = screen.getByRole('combobox', { name: /department/i });
    await user.selectOptions(departmentFilter, 'Engineering');

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('filters employees by status', async () => {
    mockGetEmployees.mockResolvedValue({
      data: mockEmployees.filter((emp) => emp.status === 'ACTIVE'),
      meta: {
        total: 2,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    });

    renderEmployeeList();
    const user = userEvent.setup();

    const statusFilter = screen.getByRole('combobox', { name: /status/i });
    await user.selectOptions(statusFilter, 'ACTIVE');

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });
  });

  it('displays employee information correctly', async () => {
    mockGetEmployees.mockResolvedValue({
      data: [mockEmployees[0]],
      meta: {
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    });

    renderEmployeeList();

    await waitFor(() => {
      const employeeRow = screen.getByText('John Doe').closest('tr');
      expect(employeeRow).toBeInTheDocument();

      if (employeeRow) {
        const cells = within(employeeRow).getAllByRole('cell');
        expect(cells[0]).toHaveTextContent('EMP001');
        expect(cells[1]).toHaveTextContent('John Doe');
        expect(cells[2]).toHaveTextContent('john.doe@example.com');
        expect(cells[3]).toHaveTextContent('Software Engineer');
        expect(cells[4]).toHaveTextContent('Engineering');
      }
    });
  });

  it('handles pagination correctly', async () => {
    mockGetEmployees.mockResolvedValue({
      data: mockEmployees.slice(0, 2),
      meta: {
        total: 3,
        page: 1,
        limit: 2,
        totalPages: 2,
      },
    });

    renderEmployeeList();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    const nextPageButton = screen.getByRole('button', { name: /next/i });
    expect(nextPageButton).toBeInTheDocument();
    expect(nextPageButton).not.toBeDisabled();

    mockGetEmployees.mockResolvedValue({
      data: [mockEmployees[2]],
      meta: {
        total: 3,
        page: 2,
        limit: 2,
        totalPages: 2,
      },
    });

    await user.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  it('displays employee count', async () => {
    mockGetEmployees.mockResolvedValue({
      data: mockEmployees,
      meta: {
        total: 3,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    });

    renderEmployeeList();

    await waitFor(() => {
      expect(screen.getByText(/showing 1-3 of 3 employees/i)).toBeInTheDocument();
    });
  });

  it('has "Add Employee" button for authorized users', async () => {
    mockGetEmployees.mockResolvedValue({
      data: mockEmployees,
      meta: {
        total: 3,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    });

    renderEmployeeList();

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add employee/i });
      expect(addButton).toBeInTheDocument();
    });
  });

  it('navigates to employee details on row click', async () => {
    mockGetEmployees.mockResolvedValue({
      data: [mockEmployees[0]],
      meta: {
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    });

    renderEmployeeList();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const employeeRow = screen.getByText('John Doe').closest('tr');
    if (employeeRow) {
      await user.click(employeeRow);
      // Verify navigation (would need to mock useNavigate properly)
      expect(window.location.pathname).toContain('/employees');
    }
  });
});
