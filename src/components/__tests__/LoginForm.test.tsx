import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test-utils'
import { LoginForm } from '../auth/LoginForm'
import { createUser, loginUser } from '../../test-utils/user-interactions'
import { mockAuthResponse } from '../../test-utils/test-data'

// Mock the useAuth hook
const mockLogin = vi.fn()
const mockUseAuth = vi.fn(() => ({
  login: mockLogin,
  isLoading: false,
  user: null
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth
}))

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders login form with all required fields', () => {
      render(<LoginForm />)
      
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
      expect(screen.getByText(/sign in to your hrm account/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('shows demo credentials section', () => {
      render(<LoginForm />)
      
      expect(screen.getByText(/demo credentials/i)).toBeInTheDocument()
      expect(screen.getByText(/admin@company.com/)).toBeInTheDocument()
      expect(screen.getByText(/hr@company.com/)).toBeInTheDocument()
      expect(screen.getByText(/manager@company.com/)).toBeInTheDocument()
      expect(screen.getByText(/employee@company.com/)).toBeInTheDocument()
    })

    it('renders with default email and password values', () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveValue('admin@company.com')
      expect(passwordInput).toHaveValue('admin123')
    })
  })

  describe('Form Interactions', () => {
    it('updates email field when user types', async () => {
      const user = createUser()
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.clear(emailInput)
      await user.type(emailInput, 'test@example.com')
      
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('updates password field when user types', async () => {
      const user = createUser()
      render(<LoginForm />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      await user.clear(passwordInput)
      await user.type(passwordInput, 'newpassword')
      
      expect(passwordInput).toHaveValue('newpassword')
    })

    it('toggles password visibility', async () => {
      const user = createUser()
      render(<LoginForm />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Form Submission', () => {
    it('calls login function with correct credentials on submit', async () => {
      const user = createUser()
      mockLogin.mockResolvedValue(mockAuthResponse)
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.clear(emailInput)
      await user.type(emailInput, 'test@example.com')
      await user.clear(passwordInput)
      await user.type(passwordInput, 'testpassword')
      await user.click(submitButton)
      
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'testpassword')
    })

    it('prevents form submission when required fields are empty', async () => {
      const user = createUser()
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.clear(emailInput)
      await user.clear(passwordInput)
      await user.click(submitButton)
      
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('shows error message when login fails', async () => {
      const user = createUser()
      mockLogin.mockRejectedValue(new Error('Invalid credentials'))
      
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
      })
    })

    it('clears error message on new submission attempt', async () => {
      const user = createUser()
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))
      
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
      })
      
      mockLogin.mockResolvedValue(mockAuthResponse)
      await user.click(submitButton)
      
      expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading state during form submission', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: true,
        user: null
      })
      
      render(<LoginForm />)
      
      expect(screen.getByText(/signing in.../i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /signing in.../i })).toBeDisabled()
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
    })

    it('disables password toggle during loading', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: true,
        user: null
      })
      
      render(<LoginForm />)
      
      const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button
      expect(toggleButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and structure', () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveAttribute('id', 'email')
      expect(passwordInput).toHaveAttribute('id', 'password')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('required')
    })

    it('shows error in accessible way', async () => {
      const user = createUser()
      mockLogin.mockRejectedValue(new Error('Invalid credentials'))
      
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        const errorAlert = screen.getByRole('alert')
        expect(errorAlert).toBeInTheDocument()
        expect(errorAlert).toHaveTextContent(/invalid email or password/i)
      })
    })

    it('has proper heading hierarchy', () => {
      render(<LoginForm />)
      
      const mainHeading = screen.getByRole('heading', { name: /welcome back/i })
      expect(mainHeading).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('requires valid email format', () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('has proper placeholder text', () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email')
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password')
    })
  })
})