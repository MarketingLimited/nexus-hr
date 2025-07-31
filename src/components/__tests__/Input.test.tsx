import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test-utils'
import { Input } from '../ui/input'
import { createUser } from '../../test-utils/user-interactions'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders with default type text', () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByPlaceholderText(/enter text/i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('renders with specified type', () => {
      render(<Input type="email" placeholder="Enter email" />)
      const input = screen.getByPlaceholderText(/enter email/i)
      expect(input).toHaveAttribute('type', 'email')
    })

    it('applies default styling classes', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass(
        'flex',
        'h-10',
        'w-full',
        'rounded-md',
        'border',
        'border-input',
        'bg-background',
        'px-3',
        'py-2'
      )
    })

    it('applies custom className', () => {
      render(<Input className="custom-input" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('custom-input')
    })
  })

  describe('Input Types', () => {
    it('renders password input correctly', () => {
      render(<Input type="password" placeholder="Password" />)
      const input = screen.getByPlaceholderText(/password/i)
      expect(input).toHaveAttribute('type', 'password')
    })

    it('renders email input correctly', () => {
      render(<Input type="email" placeholder="Email" />)
      const input = screen.getByPlaceholderText(/email/i)
      expect(input).toHaveAttribute('type', 'email')
    })

    it('renders number input correctly', () => {
      render(<Input type="number" placeholder="Number" />)
      const input = screen.getByPlaceholderText(/number/i)
      expect(input).toHaveAttribute('type', 'number')
    })

    it('renders search input correctly', () => {
      render(<Input type="search" placeholder="Search" />)
      const input = screen.getByPlaceholderText(/search/i)
      expect(input).toHaveAttribute('type', 'search')
    })

    it('renders file input correctly', () => {
      render(<Input type="file" data-testid="file-input" />)
      const input = screen.getByTestId('file-input')
      expect(input).toHaveAttribute('type', 'file')
      expect(input).toHaveClass('file:border-0', 'file:bg-transparent', 'file:text-sm', 'file:font-medium')
    })
  })

  describe('Props and Attributes', () => {
    it('accepts and applies placeholder', () => {
      render(<Input placeholder="Custom placeholder" />)
      const input = screen.getByPlaceholderText(/custom placeholder/i)
      expect(input).toHaveAttribute('placeholder', 'Custom placeholder')
    })

    it('accepts and applies value', () => {
      render(<Input value="test value" readOnly />)
      const input = screen.getByDisplayValue(/test value/i)
      expect(input).toHaveValue('test value')
    })

    it('accepts and applies disabled state', () => {
      render(<Input disabled placeholder="Disabled input" />)
      const input = screen.getByPlaceholderText(/disabled input/i)
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('accepts and applies required attribute', () => {
      render(<Input required placeholder="Required input" />)
      const input = screen.getByPlaceholderText(/required input/i)
      expect(input).toHaveAttribute('required')
    })

    it('accepts and applies readonly attribute', () => {
      render(<Input readOnly placeholder="Readonly input" />)
      const input = screen.getByPlaceholderText(/readonly input/i)
      expect(input).toHaveAttribute('readonly')
    })

    it('accepts and applies id attribute', () => {
      render(<Input id="test-input" placeholder="Test input" />)
      const input = screen.getByPlaceholderText(/test input/i)
      expect(input).toHaveAttribute('id', 'test-input')
    })

    it('accepts and applies name attribute', () => {
      render(<Input name="test-name" placeholder="Named input" />)
      const input = screen.getByPlaceholderText(/named input/i)
      expect(input).toHaveAttribute('name', 'test-name')
    })

    it('accepts and applies aria attributes', () => {
      render(
        <Input
          aria-label="Accessible input"
          aria-describedby="help-text"
          placeholder="ARIA input"
        />
      )
      const input = screen.getByPlaceholderText(/aria input/i)
      expect(input).toHaveAttribute('aria-label', 'Accessible input')
      expect(input).toHaveAttribute('aria-describedby', 'help-text')
    })
  })

  describe('User Interactions', () => {
    it('accepts user input', async () => {
      const user = createUser()
      render(<Input placeholder="Type here" />)
      
      const input = screen.getByPlaceholderText(/type here/i)
      await user.type(input, 'Hello World')
      
      expect(input).toHaveValue('Hello World')
    })

    it('calls onChange when value changes', async () => {
      const handleChange = vi.fn()
      const user = createUser()
      
      render(<Input onChange={handleChange} placeholder="Change test" />)
      
      const input = screen.getByPlaceholderText(/change test/i)
      await user.type(input, 'a')
      
      expect(handleChange).toHaveBeenCalled()
    })

    it('calls onFocus when input is focused', async () => {
      const handleFocus = vi.fn()
      const user = createUser()
      
      render(<Input onFocus={handleFocus} placeholder="Focus test" />)
      
      const input = screen.getByPlaceholderText(/focus test/i)
      await user.click(input)
      
      expect(handleFocus).toHaveBeenCalled()
    })

    it('calls onBlur when input loses focus', async () => {
      const handleBlur = vi.fn()
      const user = createUser()
      
      render(
        <div>
          <Input onBlur={handleBlur} placeholder="Blur test" />
          <button>Other element</button>
        </div>
      )
      
      const input = screen.getByPlaceholderText(/blur test/i)
      const button = screen.getByRole('button')
      
      await user.click(input)
      await user.click(button)
      
      expect(handleBlur).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<Input placeholder="Focus styles test" />)
      const input = screen.getByPlaceholderText(/focus styles test/i)
      expect(input).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2'
      )
    })

    it('supports ARIA labelledby', () => {
      render(
        <div>
          <label id="input-label">Input Label</label>
          <Input aria-labelledby="input-label" />
        </div>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-labelledby', 'input-label')
    })

    it('supports ARIA invalid state', () => {
      render(<Input aria-invalid="true" placeholder="Invalid input" />)
      const input = screen.getByPlaceholderText(/invalid input/i)
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Forward Ref', () => {
    it('properly forwards ref to input element', () => {
      const ref = { current: null }
      render(<Input ref={ref} data-testid="ref-input" />)
      
      expect(ref.current).toBeTruthy()
      expect(ref.current).toBe(screen.getByTestId('ref-input'))
    })

    it('allows ref methods to be called', () => {
      const ref = { current: null }
      render(<Input ref={ref} placeholder="Ref methods test" />)
      
      expect(ref.current).toBeTruthy()
      expect(typeof ref.current.focus).toBe('function')
      expect(typeof ref.current.blur).toBe('function')
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive text size classes', () => {
      render(<Input data-testid="responsive-input" />)
      const input = screen.getByTestId('responsive-input')
      expect(input).toHaveClass('text-base', 'md:text-sm')
    })
  })
})