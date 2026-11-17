import type { ConstructionEvent } from './assembly/coordination'
import type { STAGES } from './assembly/blueprint'
export interface RobotWorldProps {
  seed?:number
  /** Total workforce, including six aircraft. Supported range 24–48. */
  crewSize?:number
  onPhysicsReady?:()=>void
  onStageChange?:(stage:typeof STAGES[number])=>void
  onEvent?:(event:ConstructionEvent)=>void
  onComplete?:()=>void
}
