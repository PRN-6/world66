export type CatBehaviorState =
  | 'idle' | 'roaming' | 'walking' | 'running' | 'sitting' | 'sleeping'
  | 'playing' | 'exploring' | 'following' | 'interacting' | 'grooming'

export interface CatEntity {
  id:string
  name?:string
  position:[number,number,number]
  rotation:[number,number,number]
  state:CatBehaviorState
}

