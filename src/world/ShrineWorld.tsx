import { lazy, Suspense } from 'react'
import { Garden } from './Garden'
import type { ColonyProps } from '../cats/Colony'

const GardenSimulation = lazy(() => import('../physics/GardenSimulation'))
export type ShrineWorldProps = ColonyProps
/** Mount in a lit R3F canvas. The garden renders while its physics engine loads. */
export function ShrineWorld(props: ShrineWorldProps) {
  return (
    <>
      <Garden />
      <Suspense fallback={null}>
        <GardenSimulation key={props.seed} {...props} />
      </Suspense>
    </>
  )
}
