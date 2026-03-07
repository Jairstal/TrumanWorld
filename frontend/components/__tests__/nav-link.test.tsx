import { render, screen } from '@testing-library/react'
import { NavLink } from '@/components/nav-link'

describe('NavLink', () => {
  it('renders eyebrow, title and children', () => {
    render(
      <NavLink href="/test" eyebrow="Section" title="Test Link">
        Description text
      </NavLink>
    )

    expect(screen.getByText('Section')).toBeInTheDocument()
    expect(screen.getByText('Test Link')).toBeInTheDocument()
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })

  it('renders link with correct href', () => {
    const { container } = render(
      <NavLink href="/runs/123" eyebrow="Test" title="Link">
        Content
      </NavLink>
    )

    const link = container.querySelector('a')
    expect(link).toHaveAttribute('href', '/runs/123')
  })
})
