import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { vi, describe, it, expect } from 'vitest'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

function TestForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

describe('Form', () => {
  it('renders form with fields', () => {
    render(<TestForm />)

    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  it('displays form description', () => {
    render(<TestForm />)

    expect(screen.getByText('This is your public display name.')).toBeInTheDocument()
  })

  it('validates form fields on submit', async () => {
    render(<TestForm />)

    const submitButton = screen.getByRole('button', { name: 'Submit' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Username must be at least 2 characters')).toBeInTheDocument()
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })
  })

  it('validates single field on blur', async () => {
    render(<TestForm />)

    const usernameInput = screen.getByPlaceholderText('Enter username')
    
    fireEvent.focus(usernameInput)
    fireEvent.change(usernameInput, { target: { value: 'a' } })
    fireEvent.blur(usernameInput)

    await waitFor(() => {
      expect(screen.getByText('Username must be at least 2 characters')).toBeInTheDocument()
    })
  })

  it('clears validation errors when valid input is provided', async () => {
    render(<TestForm />)

    const usernameInput = screen.getByPlaceholderText('Enter username')
    const submitButton = screen.getByRole('button', { name: 'Submit' })
    
    // Trigger validation error
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Username must be at least 2 characters')).toBeInTheDocument()
    })

    // Fix the error
    fireEvent.change(usernameInput, { target: { value: 'validusername' } })

    await waitFor(() => {
      expect(screen.queryByText('Username must be at least 2 characters')).not.toBeInTheDocument()
    })
  })

  it('updates field values when user types', () => {
    render(<TestForm />)

    const usernameInput = screen.getByPlaceholderText('Enter username')
    const emailInput = screen.getByPlaceholderText('Enter email')

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    expect(usernameInput).toHaveValue('testuser')
    expect(emailInput).toHaveValue('test@example.com')
  })

  it('has proper accessibility attributes', () => {
    render(<TestForm />)

    const usernameInput = screen.getByPlaceholderText('Enter username')
    const emailInput = screen.getByPlaceholderText('Enter email')

    expect(usernameInput).toHaveAttribute('aria-describedby')
    expect(emailInput).toHaveAttribute('aria-describedby')
  })

  it('associates labels with inputs', () => {
    render(<TestForm />)

    const usernameLabel = screen.getByText('Username')
    const emailLabel = screen.getByText('Email')
    const usernameInput = screen.getByPlaceholderText('Enter username')
    const emailInput = screen.getByPlaceholderText('Enter email')

    expect(usernameLabel).toHaveAttribute('for')
    expect(emailLabel).toHaveAttribute('for')
    expect(usernameInput).toHaveAttribute('id')
    expect(emailInput).toHaveAttribute('id')
  })
})