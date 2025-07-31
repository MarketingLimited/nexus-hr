import { render, screen } from '@/test-utils'
import { vi, describe, it, expect } from 'vitest'
import { Progress } from '@/components/ui/progress'

describe('Progress', () => {
  it('renders progress bar', () => {
    render(<Progress value={50} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
  })

  it('sets correct value attribute', () => {
    render(<Progress value={75} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '75')
  })

  it('handles zero value', () => {
    render(<Progress value={0} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '0')
  })

  it('handles max value', () => {
    render(<Progress value={100} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '100')
  })

  it('applies custom className', () => {
    render(<Progress value={50} className="custom-progress" />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveClass('custom-progress')
  })

  it('sets max attribute', () => {
    render(<Progress value={50} max={200} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuemax', '200')
  })

  it('handles indeterminate state', () => {
    render(<Progress />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).not.toHaveAttribute('aria-valuenow')
  })

  it('applies correct styling classes', () => {
    render(<Progress value={50} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveClass('relative', 'h-4', 'w-full', 'overflow-hidden', 'rounded-full', 'bg-secondary')
  })

  it('renders progress indicator', () => {
    render(<Progress value={50} />)
    
    const progressBar = screen.getByRole('progressbar')
    const indicator = progressBar.querySelector('[data-state="loading"]')
    expect(indicator).toBeInTheDocument()
  })
})