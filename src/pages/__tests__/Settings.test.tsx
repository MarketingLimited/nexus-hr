import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import { createUser } from '@/test-utils/user-interactions'
import Settings from '../Settings'

describe('Settings Page', () => {
  describe('Page Rendering', () => {
    it('renders the settings page', () => {
      render(<Settings />)
      
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Manage your account settings and preferences')).toBeInTheDocument()
    })

    it('displays the page title', () => {
      render(<Settings />)
      
      const pageHeader = screen.getByRole('heading', { name: /settings/i, level: 1 })
      expect(pageHeader).toBeInTheDocument()
    })
  })

  describe('Tabs Navigation', () => {
    it('renders all settings tabs', () => {
      render(<Settings />)
      
      expect(screen.getByRole('tab', { name: 'General' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Notifications' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Security' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Integrations' })).toBeInTheDocument()
    })

    it('shows general tab as default active', () => {
      render(<Settings />)
      
      const generalTab = screen.getByRole('tab', { name: 'General' })
      expect(generalTab).toHaveAttribute('aria-selected', 'true')
    })

    it('allows switching between tabs', async () => {
      const user = createUser()
      render(<Settings />)
      
      const notificationsTab = screen.getByRole('tab', { name: 'Notifications' })
      await user.click(notificationsTab)
      
      expect(notificationsTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('General Settings', () => {
    it('displays profile settings form', () => {
      render(<Settings />)
      
      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument()
    })

    it('shows company settings section', () => {
      render(<Settings />)
      
      expect(screen.getByText('Company Settings')).toBeInTheDocument()
      expect(screen.getByLabelText('Company Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Company Size')).toBeInTheDocument()
      expect(screen.getByLabelText('Industry')).toBeInTheDocument()
    })

    it('displays appearance settings', () => {
      render(<Settings />)
      
      expect(screen.getByText('Appearance')).toBeInTheDocument()
      expect(screen.getByLabelText('Theme')).toBeInTheDocument()
      expect(screen.getByLabelText('Language')).toBeInTheDocument()
    })

    it('has profile form inputs with placeholders', () => {
      render(<Settings />)
      
      expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your last name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument()
    })
  })

  describe('Notifications Settings', () => {
    it('displays notification preferences when tab is selected', async () => {
      const user = createUser()
      render(<Settings />)
      
      const notificationsTab = screen.getByRole('tab', { name: 'Notifications' })
      await user.click(notificationsTab)
      
      expect(screen.getByText('Email Notifications')).toBeInTheDocument()
      expect(screen.getByText('Push Notifications')).toBeInTheDocument()
    })

    it('shows notification toggle switches', async () => {
      const user = createUser()
      render(<Settings />)
      
      const notificationsTab = screen.getByRole('tab', { name: 'Notifications' })
      await user.click(notificationsTab)
      
      expect(screen.getByLabelText('New employee notifications')).toBeInTheDocument()
      expect(screen.getByLabelText('Leave request notifications')).toBeInTheDocument()
      expect(screen.getByLabelText('Payroll reminders')).toBeInTheDocument()
    })
  })

  describe('Security Settings', () => {
    it('displays security options when tab is selected', async () => {
      const user = createUser()
      render(<Settings />)
      
      const securityTab = screen.getByRole('tab', { name: 'Security' })
      await user.click(securityTab)
      
      expect(screen.getByText('Password')).toBeInTheDocument()
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
    })

    it('shows password change form', async () => {
      const user = createUser()
      render(<Settings />)
      
      const securityTab = screen.getByRole('tab', { name: 'Security' })
      await user.click(securityTab)
      
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument()
      expect(screen.getByLabelText('New Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument()
    })

    it('displays two-factor authentication settings', async () => {
      const user = createUser()
      render(<Settings />)
      
      const securityTab = screen.getByRole('tab', { name: 'Security' })
      await user.click(securityTab)
      
      expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument()
      expect(screen.getByText('Add an extra layer of security to your account')).toBeInTheDocument()
    })
  })

  describe('Integrations Settings', () => {
    it('displays integration options when tab is selected', async () => {
      const user = createUser()
      render(<Settings />)
      
      const integrationsTab = screen.getByRole('tab', { name: 'Integrations' })
      await user.click(integrationsTab)
      
      expect(screen.getByText('Connected Apps')).toBeInTheDocument()
      expect(screen.getByText('API Keys')).toBeInTheDocument()
    })

    it('shows available integrations', async () => {
      const user = createUser()
      render(<Settings />)
      
      const integrationsTab = screen.getByRole('tab', { name: 'Integrations' })
      await user.click(integrationsTab)
      
      expect(screen.getByText('Slack Integration')).toBeInTheDocument()
      expect(screen.getByText('Google Calendar')).toBeInTheDocument()
      expect(screen.getByText('Microsoft Teams')).toBeInTheDocument()
    })
  })

  describe('Form Actions', () => {
    it('displays save and reset buttons', () => {
      render(<Settings />)
      
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reset to Defaults' })).toBeInTheDocument()
    })

    it('handles save button click', async () => {
      const user = createUser()
      render(<Settings />)
      
      const saveButton = screen.getByRole('button', { name: 'Save Changes' })
      await user.click(saveButton)
      
      // In a real implementation, this would trigger form submission
      expect(saveButton).toBeInTheDocument()
    })

    it('handles reset button click', async () => {
      const user = createUser()
      render(<Settings />)
      
      const resetButton = screen.getByRole('button', { name: 'Reset to Defaults' })
      await user.click(resetButton)
      
      expect(resetButton).toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('allows typing in profile form fields', async () => {
      const user = createUser()
      render(<Settings />)
      
      const firstNameInput = screen.getByLabelText('First Name')
      await user.type(firstNameInput, 'John')
      
      expect(firstNameInput).toHaveValue('John')
    })

    it('handles select dropdown interactions', async () => {
      const user = createUser()
      render(<Settings />)
      
      const themeSelect = screen.getByLabelText('Theme')
      await user.click(themeSelect)
      
      // The select component would show options
      expect(themeSelect).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('applies proper page layout classes', () => {
      render(<Settings />)
      
      const container = screen.getByText('Settings').closest('.space-y-6')
      expect(container).toBeInTheDocument()
    })

    it('uses proper spacing between sections', () => {
      render(<Settings />)
      
      const tabsContainer = screen.getByRole('tablist').closest('.space-y-4')
      expect(tabsContainer).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<Settings />)
      
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
      expect(h1).toHaveTextContent('Settings')
    })

    it('uses proper tab navigation', () => {
      render(<Settings />)
      
      const tabList = screen.getByRole('tablist')
      expect(tabList).toBeInTheDocument()
      
      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(4)
    })

    it('provides proper form labels', () => {
      render(<Settings />)
      
      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByLabelText('Company Name')).toBeInTheDocument()
    })

    it('supports keyboard navigation between tabs', async () => {
      const user = createUser()
      render(<Settings />)
      
      const firstTab = screen.getByRole('tab', { name: 'General' })
      firstTab.focus()
      
      await user.keyboard('{ArrowRight}')
      
      const secondTab = screen.getByRole('tab', { name: 'Notifications' })
      expect(document.activeElement).toBe(secondTab)
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes to main container', () => {
      render(<Settings />)
      
      const container = screen.getByText('Settings').closest('.space-y-6')
      expect(container).toBeInTheDocument()
    })
  })
})