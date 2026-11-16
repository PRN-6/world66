import { Garden } from './Garden'
import { Colony, type ColonyProps } from '../cats/Colony'
import { GardenColliders } from '../physics/GardenColliders'
import { PhysicsWorld } from '../physics/PhysicsWorld'

export interface ShrineWorldProps extends ColonyProps {paused?:boolean}
/** Mount in a lit R3F canvas. The world owns its Rapier simulation. */
export function ShrineWorld({paused=false,...props}:ShrineWorldProps) {
  return <>
    <Garden/>
    <PhysicsWorld timeStep={1/60} colliders={false} paused={paused}>
      <GardenColliders/><Colony {...props}/>
    </PhysicsWorld>
  </>
}

