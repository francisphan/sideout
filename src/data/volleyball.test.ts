import { describe, expect, it } from 'vitest'
import { seamArcs, seamPath } from './volleyball'

describe('volleyball seams', () => {
  it('has twelve cube edges and twelve strip lines', () => {
    expect(seamArcs()).toHaveLength(24)
  })

  it('draws every visible point inside the unit circle', () => {
    const d = seamPath()
    const nums = d.match(/-?\d+\.\d+/g)!.map(Number)
    expect(nums.length).toBeGreaterThan(100)
    for (let i = 0; i < nums.length; i += 2) {
      expect(Math.hypot(nums[i], nums[i + 1])).toBeLessThanOrEqual(1.001)
    }
  })

  it('hides the far hemisphere', () => {
    const d = seamPath()
    const moves = (d.match(/M /g) ?? []).length
    expect(moves).toBeGreaterThan(8)
    expect(moves).toBeLessThan(24)
  })
})
