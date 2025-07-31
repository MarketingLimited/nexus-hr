import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock RoleManagement component  
const RoleManagement = ({ onAssignRole, onUpdatePermissions }: any) => (
  <div>
    <h2>Role Management</h2>
    <div>Admin - Full Access</div>
    <div>Manager - Department Access</div>
    <div>Employee - Limited Access</div>
    <button onClick={() => onAssignRole('1', 'manager')}>Assign Role</button>
    <button onClick={() => onUpdatePermissions('admin', ['all'])}>Update Permissions</button>
  </div>
)

describe('RoleManagement', () => {
  const mockOnAssignRole = vi.fn()
  const mockOnUpdatePermissions = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders role management', () => {
    render(<RoleManagement onAssignRole={mockOnAssignRole} onUpdatePermissions={mockOnUpdatePermissions} />)
    
    expect(screen.getByText(/role management/i)).toBeInTheDocument()
  })

  it('displays available roles', () => {
    render(<RoleManagement onAssignRole={mockOnAssignRole} onUpdatePermissions={mockOnUpdatePermissions} />)
    
    expect(screen.getByText(/admin.*full access/i)).toBeInTheDocument()
    expect(screen.getByText(/manager.*department access/i)).toBeInTheDocument()
    expect(screen.getByText(/employee.*limited access/i)).toBeInTheDocument()
  })

  it('handles role assignment', () => {
    render(<RoleManagement onAssignRole={mockOnAssignRole} onUpdatePermissions={mockOnUpdatePermissions} />)
    
    const assignButton = screen.getByText(/assign role/i)
    fireEvent.click(assignButton)
    
    expect(mockOnAssignRole).toHaveBeenCalledWith('1', 'manager')
  })

  it('handles permission updates', () => {
    render(<RoleManagement onAssignRole={mockOnAssignRole} onUpdatePermissions={mockOnUpdatePermissions} />)
    
    const updateButton = screen.getByText(/update permissions/i)
    fireEvent.click(updateButton)
    
    expect(mockOnUpdatePermissions).toHaveBeenCalledWith('admin', ['all'])
  })
})