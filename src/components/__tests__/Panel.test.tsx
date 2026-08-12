import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import Panel from '../Panel'

afterEach(() => {
  cleanup()
})

describe('Panel', () => {
  it('renders a title heading when one is provided', () => {
    render(<Panel title="Yut Sticks"><p>content</p></Panel>)
    expect(screen.getByRole('heading', { name: 'Yut Sticks' })).toBeTruthy()
  })

  it('renders no heading when title is omitted', () => {
    render(<Panel><p>content</p></Panel>)
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('always renders its children', () => {
    render(<Panel><p>tray content</p></Panel>)
    expect(screen.getByText('tray content')).toBeTruthy()
  })

  it('uses border-border as the default border color', () => {
    const { container } = render(<Panel>content</Panel>)
    const section = container.firstElementChild as HTMLElement
    expect(section.className).toContain('border-border')
  })

  it('replaces the default border color when borderClassName is provided, instead of stacking both', () => {
    const { container } = render(<Panel borderClassName="border-red-tray-border">content</Panel>)
    const section = container.firstElementChild as HTMLElement
    expect(section.className).toContain('border-red-tray-border')
    // must not also carry border-border — two border-color utilities on one
    // element race in the compiled stylesheet, not in className string order
    expect(section.className).not.toContain('border-border')
  })

  it('still appends className for non-border overrides', () => {
    const { container } = render(<Panel className="extra-class">content</Panel>)
    const section = container.firstElementChild as HTMLElement
    expect(section.className).toContain('border-border')
    expect(section.className).toContain('extra-class')
  })
})
