import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import Assets from '../Assets'

// Mock the asset hooks
vi.mock('@/hooks/useAssets', () => ({
  useAssetStats: () => ({
    data: {
      totalAssets: 856,
      assignedAssets: 652,
      availableAssets: 174,
      maintenanceAssets: 30,
      monthlyGrowth: 12,
      utilizationRate: 76,
      maintenanceDueThisWeek: 5
    },
    isLoading: false
  }),
  useAssetCategories: () => ({
    data: [],
    isLoading: false
  }),
  useAssets: () => ({
    data: { data: [] },
    isLoading: false
  })
}))

describe('Assets Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the assets page with header and main sections', () => {
      render(<Assets />)

      expect(screen.getByText('Asset Management')).toBeInTheDocument()
      expect(screen.getByText('Track and manage company assets')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add asset/i })).toBeInTheDocument()
    })

    it('displays asset statistics cards', () => {
      render(<Assets />)

      expect(screen.getByText('Total Assets')).toBeInTheDocument()
      expect(screen.getByText('856')).toBeInTheDocument()
      expect(screen.getByText('Assigned')).toBeInTheDocument()
      expect(screen.getByText('652')).toBeInTheDocument()
      expect(screen.getByText('Available')).toBeInTheDocument()
      expect(screen.getByText('174')).toBeInTheDocument()
      expect(screen.getByText('Under Maintenance')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
    })
  })
})