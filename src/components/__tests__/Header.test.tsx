import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test-utils'
import { Header } from '../layout/Header'
import { createUser } from '../../test-utils/user-interactions'
import { mockUser } from '../../test-utils/test-data'

// Mock the useAuth hook
const mockLogout = vi.fn()
const mockUseAuth = vi.fn(() => ({
  user: mockUser,
  logout: mockLogout
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth
}))

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders search input', () => {
      render(<Header />)
      
      const searchInput = screen.getByPlaceholderText(/search employees, documents/i)
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveClass('pl-10') // Has search icon padding
    })

    it('renders notification button with badge', () => {
      render(<Header />)
      
      const notificationButton = screen.getByRole('button', { name: /3/i })
      expect(notificationButton).toBeInTheDocument()
      
      const badge = screen.getByText('3')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('absolute', '-top-1', '-right-1')
    })

    it('renders user avatar and name', () => {
      render(<Header />)
      
      const userName = screen.getByText(`${mockUser.name}`)
      expect(userName).toBeInTheDocument()
      
      // Check for avatar
      const avatar = screen.getByRole('img', { name: `@${mockUser.name.split(' ')[0]}` })
      expect(avatar).toBeInTheDocument()
    })

    it('renders user dropdown trigger', () => {
      render(<Header />)
      
      const dropdownTrigger = screen.getByText(mockUser.name).closest('button')
      expect(dropdownTrigger).toBeInTheDocument()
      expect(dropdownTrigger).toHaveClass('flex', 'items-center')
    })
  })

  describe('Search Functionality', () => {
    it('has proper search input structure', () => {
      render(<Header />)
      
      const searchContainer = screen.getByPlaceholderText(/search employees, documents/i).closest('.relative')
      expect(searchContainer).toBeInTheDocument()
      
      const searchInput = screen.getByPlaceholderText(/search employees, documents/i)
      expect(searchInput).toHaveAttribute('type', 'search')
      expect(searchInput).toHaveClass('w-full', 'pl-10', 'pr-4')
    })

    it('allows user to type in search input', async () => {
      const user = createUser()
      render(<Header />)
      
      const searchInput = screen.getByPlaceholderText(/search employees, documents/i)
      await user.type(searchInput, 'john doe')
      
      expect(searchInput).toHaveValue('john doe')
    })
  })

  describe('User Profile Dropdown', () => {
    it('shows user information when dropdown is opened', async () => {
      const user = createUser()
      render(<Header />)
      
      const dropdownTrigger = screen.getByText(mockUser.name)
      await user.click(dropdownTrigger)
      
      expect(screen.getByText(mockUser.email)).toBeInTheDocument()
      expect(screen.getByText(/role:/i)).toBeInTheDocument()
    })

    it('shows profile menu items', async () => {
      const user = createUser()
      render(<Header />)
      
      const dropdownTrigger = screen.getByText(mockUser.name)
      await user.click(dropdownTrigger)
      
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Log out')).toBeInTheDocument()
    })

    it('calls logout function when logout is clicked', async () => {
      const user = createUser()
      render(<Header />)
      
      const dropdownTrigger = screen.getByText(mockUser.name)
      await user.click(dropdownTrigger)
      
      const logoutButton = screen.getByText('Log out')
      await user.click(logoutButton)
      
      expect(mockLogout).toHaveBeenCalledTimes(1)
    })
  })

  describe('Notifications', () => {
    it('renders notification bell icon', () => {
      render(<Header />)
      
      const notificationButton = screen.getByRole('button', { name: /3/i })
      const bellIcon = notificationButton.querySelector('svg')
      expect(bellIcon).toBeInTheDocument()
    })

    it('shows notification count badge', () => {
      render(<Header />)
      
      const badge = screen.getByText('3')
      expect(badge).toBeInTheDocument()
      expect(badge.closest('.absolute')).toBeInTheDocument()
    })

    it('notification button is clickable', async () => {
      const user = createUser()
      render(<Header />)
      
      const notificationButton = screen.getByRole('button', { name: /3/i })
      await user.click(notificationButton)
      
      // Button should be clickable (no error thrown)
      expect(notificationButton).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('hides user name on small screens', () => {
      render(<Header />)
      
      const userName = screen.getByText(mockUser.name)
      expect(userName.closest('.hidden')).toBeInTheDocument()
      expect(userName.closest('.lg\\:flex')).toBeInTheDocument()
    })

    it('shows separator only on large screens', () => {
      render(<Header />)
      
      const separator = document.querySelector('.lg\\:block.lg\\:h-6.lg\\:w-px')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveClass('hidden')
    })

    it('applies responsive search container styles', () => {
      render(<Header />)
      
      const searchContainer = screen.getByPlaceholderText(/search employees, documents/i).closest('.max-w-lg')
      expect(searchContainer).toBeInTheDocument()
    })
  })

  describe('Styling and Layout', () => {
    it('applies proper header styling', () => {
      render(<Header />)
      
      const header = screen.getByRole('banner')
      expect(header).toHaveClass(
        'sticky',
        'top-0',
        'z-40',
        'flex',
        'h-16',
        'items-center',
        'border-b',
        'border-border'
      )
    })

    it('applies backdrop blur effect', () => {
      render(<Header />)
      
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('backdrop-blur', 'supports-[backdrop-filter]:bg-card/60')
    })

    it('has proper flex layout', () => {
      render(<Header />)
      
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('flex', 'items-center', 'gap-x-4')
    })
  })

  describe('Accessibility', () => {
    it('has proper header landmark', () => {
      render(<Header />)
      
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
    })

    it('has accessible search input', () => {
      render(<Header />)
      
      const searchInput = screen.getByPlaceholderText(/search employees, documents/i)
      expect(searchInput).toHaveAttribute('type', 'search')
      expect(searchInput).toHaveAttribute('placeholder')
    })

    it('has accessible dropdown menu', async () => {
      const user = createUser()
      render(<Header />)
      
      const dropdownTrigger = screen.getByText(mockUser.name)
      await user.click(dropdownTrigger)
      
      const menu = screen.getByRole('menu')
      expect(menu).toBeInTheDocument()
      
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems.length).toBeGreaterThan(0)
    })

    it('has proper ARIA attributes for avatar', () => {
      render(<Header />)
      
      const avatar = screen.getByRole('img', { name: `@${mockUser.name.split(' ')[0]}` })
      expect(avatar).toHaveAttribute('alt')
    })
  })

  describe('User Data Handling', () => {
    it('handles missing user data gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        logout: mockLogout
      })
      
      render(<Header />)
      
      // Should still render header without crashing
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
    })

    it('displays user initials when avatar fails to load', () => {
      render(<Header />)
      
      const avatarFallback = screen.getByText(
        mockUser.name.split(' ').map(n => n[0]).join('')
      )
      expect(avatarFallback).toBeInTheDocument()
    })
  })
})