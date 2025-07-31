import { render, screen } from '@/test-utils'
import { vi, describe, it, expect } from 'vitest'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

describe('Alert', () => {
  it('renders alert with title and description', () => {
    render(
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>Alert description content</AlertDescription>
      </Alert>
    )

    expect(screen.getByText('Alert Title')).toBeInTheDocument()
    expect(screen.getByText('Alert description content')).toBeInTheDocument()
  })

  it('applies default variant styling', () => {
    render(
      <Alert>
        <AlertTitle>Default Alert</AlertTitle>
      </Alert>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('relative', 'w-full', 'rounded-lg', 'border', 'p-4')
  })

  it('applies destructive variant styling', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error Alert</AlertTitle>
      </Alert>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('border-destructive/50', 'text-destructive')
  })

  it('applies custom className', () => {
    render(
      <Alert className="custom-alert">
        <AlertTitle>Custom Alert</AlertTitle>
      </Alert>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('custom-alert')
  })

  it('renders with icon', () => {
    render(
      <Alert>
        <AlertCircle className="h-4 w-4" data-testid="alert-icon" />
        <AlertTitle>Alert with Icon</AlertTitle>
      </Alert>
    )

    expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
  })

  it('renders AlertTitle with correct styling', () => {
    render(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
      </Alert>
    )

    const title = screen.getByText('Alert Title')
    expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight')
  })

  it('renders AlertDescription with correct styling', () => {
    render(
      <Alert>
        <AlertDescription>Alert description</AlertDescription>
      </Alert>
    )

    const description = screen.getByText('Alert description')
    expect(description).toHaveClass('text-sm')
  })

  it('has proper semantic role', () => {
    render(
      <Alert>
        <AlertTitle>Semantic Alert</AlertTitle>
      </Alert>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
  })
})