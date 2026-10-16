import { ROLES, type Role } from '../data/roles'

const ORDER: Role[] = ['S', 'OH', 'MB', 'OPP', 'L']

export default function Legend() {
  return (
    <ul className="legend" aria-label="Player roles">
      {ORDER.map((r) => (
        <li key={r}>
          <span
            className="legend-swatch"
            style={{ background: ROLES[r].color, color: ROLES[r].text }}
            aria-hidden="true"
          >
            {r}
          </span>
          <span className="legend-name">{ROLES[r].name}</span>
        </li>
      ))}
    </ul>
  )
}
