import { render, screen } from '@testing-library/react'
import { SectionCard } from '@/components/section-card'

describe('SectionCard', () => {
  it('renders title', () => {
    render(
      <SectionCard title="Test Title">
        <div>Content</div>
      </SectionCard>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <SectionCard title="Title" description="Test description">
        <div>Content</div>
      </SectionCard>
    )

    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    const { container } = render(
      <SectionCard title="Title">
        <div>Content</div>
      </SectionCard>
    )

    expect(container.querySelector('.text-sm.text-slate-600')).not.toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <SectionCard title="Title">
        <span data-testid="child">Child Content</span>
      </SectionCard>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
