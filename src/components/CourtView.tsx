import Court from './Court'
import Court3D from './Court3D'
import type { CourtProps, CourtViewMode } from './courtTypes'

export default function CourtView({ view, ...props }: CourtProps & { view: CourtViewMode }) {
  return view === 'perspective' ? <Court3D {...props} /> : <Court {...props} />
}
