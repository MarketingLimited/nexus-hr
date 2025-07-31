import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { vi, describe, it, expect } from 'vitest'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

describe('Tooltip', () => {
  it('renders tooltip trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('shows tooltip on hover', async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })
  })

  it('hides tooltip on mouse leave', async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    
    fireEvent.mouseEnter(trigger)
    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })

    fireEvent.mouseLeave(trigger)
    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
    })
  })

  it('shows tooltip on focus', async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Focus me</Button>
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Focus me')
    fireEvent.focus(trigger)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })
  })

  it('applies custom className to content', async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent className="custom-tooltip">
            Tooltip content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    await waitFor(() => {
      const tooltip = screen.getByText('Tooltip content')
      expect(tooltip).toHaveClass('custom-tooltip')
    })
  })

  it('supports different sides', async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent side="left">Left tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    await waitFor(() => {
      expect(screen.getByText('Left tooltip')).toBeInTheDocument()
    })
  })

  it('handles controlled open state', async () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger asChild>
            <Button>Always visible</Button>
          </TooltipTrigger>
          <TooltipContent>Always shown content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Always shown content')).toBeInTheDocument()
    })
  })

  it('respects delay settings', async () => {
    render(
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Delayed tooltip</Button>
          </TooltipTrigger>
          <TooltipContent>Delayed content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Delayed tooltip')
    fireEvent.mouseEnter(trigger)

    // Should not appear immediately
    expect(screen.queryByText('Delayed content')).not.toBeInTheDocument()

    // Should appear after delay
    await waitFor(() => {
      expect(screen.getByText('Delayed content')).toBeInTheDocument()
    }, { timeout: 600 })
  })
})