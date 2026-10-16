import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('opens on rotation basics and switches lessons', async () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Rotation basics' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Serve receive' }))
    expect(screen.getByRole('heading', { name: 'Serve receive' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /setter in 5/ })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Floor defense' }))
    expect(screen.getByRole('heading', { name: 'Floor defense' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: /Read: the set is up/ }))
    expect(screen.getByText(/block shadow/)).toBeInTheDocument()
  })

  it('switches between the perspective and whiteboard views', async () => {
    render(<App />)
    expect(screen.getByRole('img', { name: /in perspective/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: 'Whiteboard' }))
    expect(screen.getByRole('img', { name: /from above/ })).toBeInTheDocument()
    expect(window.localStorage.getItem('sideout.view')).toBe('top')
    await userEvent.click(screen.getByRole('radio', { name: 'Perspective' }))
    expect(screen.getByRole('img', { name: /in perspective/ })).toBeInTheDocument()
  })

  it('steps serve receive through its phases', async () => {
    window.location.hash = '#receive'
    render(<App />)
    await userEvent.click(screen.getByRole('tab', { name: /Set and attack/ }))
    expect(screen.getByText(/setter chooses a hitter/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Side-out: rotate' }))
    expect(screen.getByText(/Rotation 2, setter in 6/)).toBeInTheDocument()
  })
})
