import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NotFound from '@/pages/NotFound'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('NotFound Page', () => {
  it('renders 404 error page', () => {
    renderWithRouter(<NotFound />)
    
    expect(screen.getByText(/404/)).toBeInTheDocument()
  })

  it('displays page not found message', () => {
    renderWithRouter(<NotFound />)
    
    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
  })

  it('shows helpful error description', () => {
    renderWithRouter(<NotFound />)
    
    expect(screen.getByText(/the page you are looking for/i)).toBeInTheDocument()
    expect(screen.getByText(/does not exist/i)).toBeInTheDocument()
  })

  it('provides navigation back to home', () => {
    renderWithRouter(<NotFound />)
    
    const homeLink = screen.getByText(/go home/i)
    expect(homeLink).toBeInTheDocument()
    expect(homeLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('includes back button', () => {
    renderWithRouter(<NotFound />)
    
    const backButton = screen.getByText(/go back/i)
    expect(backButton).toBeInTheDocument()
  })

  it('shows search functionality', () => {
    renderWithRouter(<NotFound />)
    
    expect(screen.getByText(/search/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search for pages/i)).toBeInTheDocument()
  })

  it('displays helpful links', () => {
    renderWithRouter(<NotFound />)
    
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/employees/i)).toBeInTheDocument()
    expect(screen.getByText(/reports/i)).toBeInTheDocument()
  })

  it('shows error illustration', () => {
    renderWithRouter(<NotFound />)
    
    const illustration = screen.getByRole('img', { name: /404 error/i })
    expect(illustration).toBeInTheDocument()
  })

  it('includes contact support option', () => {
    renderWithRouter(<NotFound />)
    
    expect(screen.getByText(/need help/i)).toBeInTheDocument()
    expect(screen.getByText(/contact support/i)).toBeInTheDocument()
  })

  it('has proper page title', () => {
    renderWithRouter(<NotFound />)
    
    expect(document.title).toContain('404')
  })

  it('provides breadcrumb navigation', () => {
    renderWithRouter(<NotFound />)
    
    expect(screen.getByText(/home/i)).toBeInTheDocument()
    expect(screen.getByText(/404 error/i)).toBeInTheDocument()
  })

  it('shows recent pages suggestion', () => {
    renderWithRouter(<NotFound />)
    
    expect(screen.getByText(/recent pages/i)).toBeInTheDocument()
  })

  it('displays appropriate error code', () => {
    renderWithRouter(<NotFound />)
    
    const errorCode = screen.getByText('404')
    expect(errorCode).toHaveClass('text-6xl', 'font-bold')
  })

  it('has responsive design', () => {
    renderWithRouter(<NotFound />)
    
    const container = screen.getByText('404').closest('div')
    expect(container).toHaveClass('text-center')
  })

  it('includes page metadata', () => {
    renderWithRouter(<NotFound />)
    
    expect(screen.getByText(/oops/i)).toBeInTheDocument()
  })
})