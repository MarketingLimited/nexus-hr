import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

const mockData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
]

const mockConfig = {
  value: {
    label: 'Value',
    color: 'hsl(var(--chart-1))',
  },
}

describe('Chart Components', () => {
  describe('ChartContainer', () => {
    it('renders with correct styling', () => {
      render(
        <ChartContainer config={mockConfig} data-testid="chart-container">
          <BarChart data={mockData}>
            <Bar dataKey="value" />
          </BarChart>
        </ChartContainer>
      )

      const container = screen.getByTestId('chart-container')
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('flex', 'aspect-video', 'justify-center', 'text-xs')
    })

    it('applies custom className', () => {
      render(
        <ChartContainer config={mockConfig} className="custom-chart">
          <BarChart data={mockData}>
            <Bar dataKey="value" />
          </BarChart>
        </ChartContainer>
      )

      const container = screen.getByRole('img', { hidden: true })?.parentElement
      expect(container).toHaveClass('custom-chart')
    })

    it('generates unique chart ID', () => {
      render(
        <ChartContainer config={mockConfig} id="test-chart">
          <BarChart data={mockData}>
            <Bar dataKey="value" />
          </BarChart>
        </ChartContainer>
      )

      const container = screen.getByRole('img', { hidden: true })?.parentElement
      expect(container).toHaveAttribute('data-chart', 'chart-test-chart')
    })

    it('renders chart style configuration', () => {
      render(
        <ChartContainer config={mockConfig}>
          <BarChart data={mockData}>
            <Bar dataKey="value" />
          </BarChart>
        </ChartContainer>
      )

      // Check that style element is rendered
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeInTheDocument()
    })

    it('provides chart context to children', () => {
      const TestComponent = () => {
        const { useChart } = require('@/components/ui/chart')
        const { config } = useChart()
        return <div data-testid="config-test">{config.value.label}</div>
      }

      render(
        <ChartContainer config={mockConfig}>
          <TestComponent />
        </ChartContainer>
      )

      expect(screen.getByTestId('config-test')).toHaveTextContent('Value')
    })
  })

  describe('ChartTooltipContent', () => {
    it('renders tooltip content when active', () => {
      const mockPayload = [
        {
          name: 'value',
          value: 400,
          dataKey: 'value',
          color: '#8884d8',
          payload: { name: 'Jan', value: 400 },
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={mockPayload}
            label="Jan"
            data-testid="tooltip-content"
          />
        </ChartContainer>
      )

      expect(screen.getByText('400')).toBeInTheDocument()
    })

    it('does not render when not active', () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={false}
            payload={[]}
            data-testid="tooltip-content"
          />
        </ChartContainer>
      )

      expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument()
    })

    it('hides label when hideLabel is true', () => {
      const mockPayload = [
        {
          name: 'value',
          value: 400,
          dataKey: 'value',
          color: '#8884d8',
          payload: { name: 'Jan', value: 400 },
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={mockPayload}
            label="Jan"
            hideLabel={true}
          />
        </ChartContainer>
      )

      expect(screen.queryByText('Jan')).not.toBeInTheDocument()
      expect(screen.getByText('400')).toBeInTheDocument()
    })

    it('supports different indicators', () => {
      const mockPayload = [
        {
          name: 'value',
          value: 400,
          dataKey: 'value',
          color: '#8884d8',
          payload: { name: 'Jan', value: 400 },
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={mockPayload}
            indicator="line"
            data-testid="tooltip-line"
          />
        </ChartContainer>
      )

      expect(screen.getByTestId('tooltip-line')).toBeInTheDocument()
    })
  })

  describe('ChartLegendContent', () => {
    it('renders legend items', () => {
      const mockPayload = [
        {
          value: 'value',
          color: '#8884d8',
          dataKey: 'value',
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={mockPayload} />
        </ChartContainer>
      )

      expect(screen.getByText('Value')).toBeInTheDocument()
    })

    it('does not render when payload is empty', () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={[]} data-testid="empty-legend" />
        </ChartContainer>
      )

      expect(screen.queryByTestId('empty-legend')).not.toBeInTheDocument()
    })

    it('supports hiding icons', () => {
      const mockPayload = [
        {
          value: 'value',
          color: '#8884d8',
          dataKey: 'value',
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={mockPayload} hideIcon={true} />
        </ChartContainer>
      )

      expect(screen.getByText('Value')).toBeInTheDocument()
    })

    it('applies vertical alignment styling', () => {
      const mockPayload = [
        {
          value: 'value',
          color: '#8884d8',
          dataKey: 'value',
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent
            payload={mockPayload}
            verticalAlign="top"
            data-testid="top-legend"
          />
        </ChartContainer>
      )

      const legend = screen.getByTestId('top-legend')
      expect(legend).toHaveClass('pb-3')
    })
  })

  describe('Complete Chart Structure', () => {
    it('renders a complete chart with all components', () => {
      render(
        <ChartContainer
          config={{
            sales: {
              label: 'Sales',
              color: 'hsl(var(--chart-1))',
            },
            profit: {
              label: 'Profit',
              color: 'hsl(var(--chart-2))',
            },
          }}
        >
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="value" fill="var(--color-sales)" />
          </BarChart>
        </ChartContainer>
      )

      // Check that the chart structure is rendered
      const chartContainer = screen.getByRole('img', { hidden: true })?.parentElement
      expect(chartContainer).toBeInTheDocument()
      expect(chartContainer).toHaveClass('flex', 'aspect-video')
    })

    it('handles complex chart configurations', () => {
      const complexConfig = {
        desktop: {
          label: 'Desktop',
          color: 'hsl(var(--chart-1))',
        },
        mobile: {
          label: 'Mobile',
          color: 'hsl(var(--chart-2))',
        },
        tablet: {
          label: 'Tablet',
          theme: {
            light: 'hsl(220, 70%, 50%)',
            dark: 'hsl(220, 70%, 60%)',
          },
        },
      }

      render(
        <ChartContainer config={complexConfig}>
          <BarChart data={mockData}>
            <Bar dataKey="value" />
          </BarChart>
        </ChartContainer>
      )

      const chartContainer = screen.getByRole('img', { hidden: true })?.parentElement
      expect(chartContainer).toBeInTheDocument()
    })
  })
})