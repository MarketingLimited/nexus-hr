import { render, screen, fireEvent } from '@/test-utils'
import { vi, describe, it, expect } from 'vitest'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

describe('Accordion', () => {
  it('renders accordion with items', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('expands item when trigger is clicked', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    fireEvent.click(screen.getByText('Item 1'))
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('collapses item when trigger is clicked again', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByText('Item 1')
    
    fireEvent.click(trigger)
    expect(screen.getByText('Content 1')).toBeInTheDocument()
    
    fireEvent.click(trigger)
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
  })

  it('handles multiple type accordion', () => {
    render(
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    fireEvent.click(screen.getByText('Item 1'))
    fireEvent.click(screen.getByText('Item 2'))
    
    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('handles default expanded value', () => {
    render(
      <Accordion type="single" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('applies custom className to accordion', () => {
    render(
      <Accordion type="single" className="custom-accordion">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const accordion = screen.getByRole('region')
    expect(accordion).toHaveClass('custom-accordion')
  })

  it('applies custom className to accordion item', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1" className="custom-item">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const item = screen.getByText('Item 1').closest('[data-state]')
    expect(item).toHaveClass('custom-item')
  })

  it('has proper accessibility attributes', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByRole('button', { name: 'Item 1' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('supports keyboard navigation', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByRole('button', { name: 'Item 1' })
    
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })
})