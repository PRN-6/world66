import type { V3 } from '../../world/modeling'
import type { Bay } from '../site/layout'
export type Role='worker'|'transport'|'engineer'|'drone'
export type Duty='patrol'|'standby'|'operate'|'search'|'collect'|'handoff'|'haul'|'deliver'|'inspect'|'assemble'|'repair'|'charge'|'gather'
export interface Robot{
  id:number;role:Role;duty:Duty;pos:V3;yaw:number;speed:number;stride:number;phase:number
  s:number;offset:number;lane:number;slot:number;bay:Bay|null;berth:Bay|null;entry:Bay|null;departure:Bay|null;parked:boolean;leaving:boolean
  order:number;scan:number;wait:number;charge:number;flight:V3[];pad:number;arrived:boolean;tool:number
}
