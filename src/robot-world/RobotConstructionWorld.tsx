import { lazy,Suspense } from 'react'
import { Site } from './art/Site'
import type { RobotWorldProps } from './types'
const RunningYard=lazy(()=>import('./assembly/RunningYard'))
/** Mount in a lit R3F canvas. This island owns its physics world and simulation. */
export function RobotConstructionWorld(props:RobotWorldProps){
  return <><Site/><Suspense fallback={null}><RunningYard {...props}/></Suspense></>
}
