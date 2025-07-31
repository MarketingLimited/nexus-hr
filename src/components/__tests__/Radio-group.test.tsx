import { render, screen, fireEvent } from '@/test-utils'
import { vi, describe, it, expect } from 'vitest'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

describe('RadioGroup', () => {
  it('renders radio group with items', () => {
    render(
      <RadioGroup>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" />
          <Label htmlFor="option2">Option 2</Label>
        </div>
      </RadioGroup>
    )

    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('handles selection changes', () => {
    const onValueChange = vi.fn()
    
    render(
      <RadioGroup onValueChange={onValueChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" />
          <Label htmlFor="option2">Option 2</Label>
        </div>
      </RadioGroup>
    )

    fireEvent.click(screen.getByText('Option 1'))
    expect(onValueChange).toHaveBeenCalledWith('option1')
  })

  it('sets default value', () => {
    render(
      <RadioGroup defaultValue="option2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" />
          <Label htmlFor="option2">Option 2</Label>
        </div>
      </RadioGroup>
    )

    const option2 = screen.getByDisplayValue('option2')
    expect(option2).toBeChecked()
  })

  it('handles disabled state', () => {
    render(
      <RadioGroup disabled>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
      </RadioGroup>
    )

    const radioInput = screen.getByDisplayValue('option1')
    expect(radioInput).toBeDisabled()
  })

  it('applies custom className', () => {
    render(
      <RadioGroup className="custom-radio-group">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
      </RadioGroup>
    )

    const radioGroup = screen.getByRole('radiogroup')
    expect(radioGroup).toHaveClass('custom-radio-group')
  })
})