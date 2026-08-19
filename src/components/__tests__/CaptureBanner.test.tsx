import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import CaptureBanner from '../CaptureBanner'

afterEach(() => {
  cleanup()
})

describe('CaptureBanner', () => {
  it('announces a single-piece capture with singular phrasing', () => {
    render(<CaptureBanner capturingTeam="red" capturedTeam="blue" count={1} />)
    expect(screen.getByText(/captured/).textContent).toBe('Red captured a Blue piece!')
  })

  it('announces a stack capture with pluralized phrasing and count', () => {
    render(<CaptureBanner capturingTeam="blue" capturedTeam="red" count={2} />)
    expect(screen.getByText(/captured/).textContent).toBe('Blue captured 2 Red pieces!')
  })

  it('is announced to assistive tech via a polite status region', () => {
    render(<CaptureBanner capturingTeam="red" capturedTeam="blue" count={1} />)
    expect(screen.getByRole('status').getAttribute('aria-live')).toBe('polite')
  })

  it('applies the capturing team\'s accent border to the left side only', () => {
    render(<CaptureBanner capturingTeam="blue" capturedTeam="red" count={1} />)
    expect(screen.getByRole('status').className).toContain('border-l-blue-piece')
  })
})
