import { ROTATIONS, setterZone, type RotationNumber } from '../data/rotations'
import type { Zone } from '../data/court'

interface Props {
  value: RotationNumber
  onChange: (n: RotationNumber) => void
}

/** Six buttons laid out like the court zones: pick the zone the setter is in. */
export default function RotationDial({ value, onChange }: Props) {
  const byZone = new Map<Zone, RotationNumber>()
  for (const n of ROTATIONS) byZone.set(setterZone(n), n)
  const rows: Zone[][] = [
    [4, 3, 2],
    [5, 6, 1],
  ]
  return (
    <div className="dial" role="radiogroup" aria-label="Rotation, by the zone the setter is in">
      <span className="dial-net" aria-hidden="true" />
      {rows.map((row, i) => (
        <div className="dial-row" key={i}>
          {row.map((z) => {
            const n = byZone.get(z)!
            const on = n === value
            return (
              <button
                key={z}
                type="button"
                role="radio"
                aria-checked={on}
                className={`dial-cell${on ? ' dial-on' : ''}`}
                onClick={() => onChange(n)}
              >
                <span className="dial-rot">{n}</span>
                <span className="dial-zone">setter in {z}</span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
