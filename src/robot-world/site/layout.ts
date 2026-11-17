import type { V3 } from '../../world/modeling'

export const palette = {
  navy:'#243d50', ink:'#172e40', iron:'#587381', steel:'#99afac', white:'#f1e8cd',
  mint:'#69c5b1', teal:'#278d87', lemon:'#f3c05b', amber:'#dd943b', coral:'#e66d4c',
  shell:'#dfddc7', road:'#6c858b', blue:'#60b5c6', light:'#b8ffdf'
}
export const CENTRE:V3=[0,0,-1.18]
export const CRANE:V3=[-3.05,10.82,-3.91]
export const CRANE_REACH=10.0
export const YARD_HALF=10.8

export interface RoadPoint {x:number;z:number;dx:number;dz:number}
const points:[number,number][]=[]
const corners=[[-4.4,4.2,Math.PI,Math.PI/2],[4.4,4.2,Math.PI/2,0],[4.4,-4.2,0,-Math.PI/2],[-4.4,-4.2,-Math.PI/2,-Math.PI]]
for(const [x,z,a,b] of corners){
  for(let i=0;i<=16;i++){const t=a+(b-a)*i/16;points.push([x+1.42*Math.cos(t),z+1.42*Math.sin(t)])}
}
const lengths=[0]
for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length]
  lengths.push(lengths[i]+Math.hypot(b[0]-a[0],b[1]-a[1]))
}
export const ROAD_LENGTH=lengths.at(-1)!
export const wrapRoad=(s:number)=>((s%ROAD_LENGTH)+ROAD_LENGTH)%ROAD_LENGTH
export function roadAt(distance:number,offset=0):RoadPoint{
  const s=wrapRoad(distance)
  let lo=0,hi=points.length
  while(lo+1<hi){const mid=(lo+hi)>>1;if(lengths[mid]<=s)lo=mid;else hi=mid}
  const a=points[lo],b=points[(lo+1)%points.length],length=lengths[lo+1]-lengths[lo]
  const dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length
  return {x:a[0]+dx*(s-lengths[lo])+dz*offset,z:a[1]+dz*(s-lengths[lo])-dx*offset,dx,dz}
}
export interface Bay {id:string;s:number;offset:number;floor:number;point:V3}
export function makeBay(id:string,s:number,offset:number,floor=0):Bay{
  const p=roadAt(s,offset)
  return {id,s:wrapRoad(s),offset,floor,point:[p.x,floor,p.z]}
}
function nearestS(x:number,z:number){
  let best=0,d=Infinity
  for(let s=0;s<ROAD_LENGTH;s+=0.025){
    const p=roadAt(s),dist=Math.hypot(x-p.x,z-p.z)
    if(dist<d){best=s;d=dist}
  }
  return best
}
export const sources=[-3.4,-1.0,1.42].map((z,i)=>makeBay('stock-'+i,nearestS(-5.82,z),-1.56))
export const relays=[-3.62,-0.92,1.85].map((x,i)=>makeBay('relay-'+i,nearestS(x,5.62),-1.6))
export const docks=[-2.75,0,2.72].map((x,i)=>makeBay('dock-'+i,nearestS(x,5.62),1.64))
export const service=[3.76,1.72,-2.45].map((z,i)=>makeBay('service-'+i,nearestS(5.82,z),-1.42))
export const airPads:V3[]=Array.from({length:6},(_,i)=>[6.95+(i%2)*1.95,0.56,-7.95+Math.floor(i/2)*1.48])
export const upperDock:V3=[3.35,3.33,0.05]
export const upperInspector=makeBay('lift inspection',nearestS(5.82,0.05),1.47)
export const craneConsole=makeBay('crane controls',nearestS(-5.82,-4.12),1.35)
export const toolBays=[
  ...[-4.14,-2.49,-.8,.86,2.49,4.12].map(x=>nearestS(x,-5.62)),
  ...[-2.18,.19,2.78].map(z=>nearestS(-5.82,z)),
  ...[-3.85,-1.2,2.77].map(z=>nearestS(5.82,z)),
].map((s,i)=>makeBay('tools-'+i,s,i<6?-1.42:1.47))
export const platformHeight=0.68
