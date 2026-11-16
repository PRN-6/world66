import { Colony, type ColonyProps } from '../cats/Colony'
import { GardenColliders } from './GardenColliders'
import { PhysicsWorld } from './PhysicsWorld'

export default function GardenSimulation(props: ColonyProps) {
  return (
    <PhysicsWorld timeStep={1 / 60} colliders={false}>
      <GardenColliders />
      <Colony {...props} />
    </PhysicsWorld>
  )
}
