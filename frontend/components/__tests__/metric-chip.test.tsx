import { render, screen } from '@testing-library/react'
import { MetricChip } from '@/components/metric-chip'

describe('MetricChip', () => {
  it('renders label and value', () => {
    render(<MetricChip label="Time" value="12:00" />)

    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('12:00')).toBeInTheDocument()
  })

  it('renders numeric value', () => {
    render(<MetricChip label="Agents" value={5} />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('applies correct classes', () => {
    const { container } = render(<MetricChip label="Test" value="10" />)
    const div = container.firstChild as HTMLElement

    expect(div).toHaveClass('rounded-2xl', 'bg-mist', 'px-4', 'py-3')
  })
})
