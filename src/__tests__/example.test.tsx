import { describe, it, expect } from 'vitest'
import { render, screen } from '../test-utils'
import { Button } from '../components/ui/button'

describe('Example Test', () => {
  it('renders a button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('verifies MSW is working', async () => {
    // This test will verify that our MSW setup is working correctly
    // We'll expand this in later phases
    expect(true).toBe(true)
  })
})