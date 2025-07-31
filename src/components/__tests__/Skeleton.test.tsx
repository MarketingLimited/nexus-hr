import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton', () => {
  it('renders with default styling', () => {
    render(<Skeleton data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted')
  })

  it('applies custom className', () => {
    render(<Skeleton className="h-4 w-full" />)
    const skeleton = screen.getByRole('generic')
    expect(skeleton).toHaveClass('h-4', 'w-full')
  })

  it('forwards HTML attributes', () => {
    render(<Skeleton id="test-skeleton" data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('id', 'test-skeleton')
  })

  it('can be used for different content types', () => {
    render(
      <div>
        <Skeleton className="h-12 w-12 rounded-full" data-testid="avatar" />
        <Skeleton className="h-4 w-[250px]" data-testid="text-line" />
        <Skeleton className="h-4 w-[200px]" data-testid="text-line-2" />
      </div>
    )

    expect(screen.getByTestId('avatar')).toHaveClass('h-12', 'w-12', 'rounded-full')
    expect(screen.getByTestId('text-line')).toHaveClass('h-4', 'w-[250px]')
    expect(screen.getByTestId('text-line-2')).toHaveClass('h-4', 'w-[200px]')
  })
})