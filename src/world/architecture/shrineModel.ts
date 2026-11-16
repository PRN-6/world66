import { Model, surfaceGeometry, type V3 } from '../modeling'
import { ink, paperLamp, red, shimenawa, trim, wood } from './fixtures'

type Roof = { halfX:number; halfZ:number; ridge:number; base:number; rise:number; z:number; turn:boolean }
export const roofs: Roof[] = [
  { halfX:3.26, halfZ:2.18, ridge:1.92, base:3.43, rise:1.56, z:0, turn:false },
  { halfX:1.32, halfZ:1.64, ridge:1.25, base:2.73, rise:0.98, z:1.65, turn:true },
]
// Each slope sweeps from a lifted eave to a shorter ridge, forming a hipped tile roof.
function roofPoint(r: Roof, side:number, u:number, t:number): V3 {
  const corners=[[-1,-1],[1,-1],[1,1],[-1,1]]
  const a=corners[side], b=corners[(side+1)%4]
  const dx=a[0]+(b[0]-a[0])*u, dz=a[1]+(b[1]-a[1])*u
  const x=dx*(r.halfX*(1-t)+r.ridge*t), z=dz*r.halfZ*(1-t)
  const y=r.base+r.rise*t**1.6 + 0.28*(Math.abs(dx*dz)**3)*(1-t)**2
  return r.turn ? [z,y,r.z+x] : [x,y,z+r.z]
}
export function roofSkin(r: Roof) {
  const verts:number[]=[], indices:number[]=[]
  for(let side=0;side<4;side++){
    const base=verts.length/3,cols=24,rows=10
    for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)verts.push(...roofPoint(r,side,i/cols,j/rows))
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
      const a=base+j*(cols+1)+i
      indices.push(a,a+cols+1,a+1,a+1,a+cols+1,a+cols+2)
    }
  }
  return surfaceGeometry(verts,indices)
}
function tiles(m:Model,r:Roof) {
  for(let face=0;face<4;face++){
    const count=face%2===0?30:20
    for(let i=0;i<=count;i++){
      const u=i/count
      for(let j=0;j<6;j++){
        const a=roofPoint(r,face,u,j/6),b=roofPoint(r,face,u,(j+1)/6)
        m.beam(a,b,i%count===0?0.084:0.036,i%count===0?'#93a49a':i%3?'#627c7b':'#778a83')
      }
      const a=roofPoint(r,face,u,0)
      m.add('ball',a,[0.067,0.072,0.067],i%3?'#7a8b83':'#a9ad91')
      if(i===count)continue
      const b=roofPoint(r,face,(i+1)/count,0)
      a[1]-=0.11;b[1]-=0.11
      m.beam(a,b,0.115,'#574e45')
      a[1]+=0.06;b[1]+=0.06
      m.beam(a,b,0.053,'#d6a46a')
    }
  }
  const a=roofPoint(r,0,0,1),b=roofPoint(r,0,1,1)
  m.beam(a,b,0.16,'#435c60')
  a[1]+=0.12;b[1]+=0.12
  m.beam(a,b,0.065,'#bcae84')
  for(const p of [a,b])m.add('ball',p,[0.15,0.17,0.15],'#d1b377')
}
export function shrineBuilding() {
  const m=new Model()
  m.add('soft',[0,0.2,0.05],[5,0.4,3.7],'#9eaa94')
  m.add('soft',[0,0.45,0.18],[5.32,0.22,3.93],'#84583e')
  for(let i=0;i<25;i++)m.add('box',[(i-12)*0.213,0.59,0.18],[0.205,0.08,3.9],i%4?'#c28d61':'#d2a575')
  for(let j=0;j<3;j++){
    m.add('soft',[0,0.094*(3-j),2.19+j*0.255],[2.42+0.08*j,0.18*(3-j),0.31],j%2?'#b9b6a1':'#c8c6aa')
  }
  m.add('box',[0,1.96,-0.12],[4.52,2.68,2.75],'#eed7aa')
  for(const x of [-2.26,-1.35,0,1.35,2.26])for(const z of [-1.5,1.31]){
    m.add('box',[x,1.98,z],[0.19,2.76,0.2],red)
    m.add('box',[x,0.7,z],[0.24,0.22,0.24],'#58615a')
  }
  for(const side of [-1,1]){
    for(let i=0;i<6;i++)m.add('box',[side*2.27,1.96,-1.1+i*0.42],[0.065,2.46,0.047],wood)
    for(const y of [1.05,2.15,2.84])m.add('box',[side*2.28,y,-0.08],[0.06,0.08,2.76],wood)
    m.add('box',[side*0.55,1.71,1.323],[1.055,2.14,0.15],'#705544')
    m.add('box',[side*0.55,2.02,1.41],[0.88,1.22,0.04],'#edc788')
    for(let j=0;j<5;j++)m.add('box',[side*0.55+(j-2)*0.17,2.03,1.45],[0.045,1.3,0.045],wood)
    for(let j=0;j<4;j++)m.add('box',[side*0.55,1.52+j*0.32,1.46],[0.93,0.045,0.035],wood)
    for(const z of [-1.65,0,1.65])m.add('box',[side*2.52,0.93,z],[0.13,0.68,0.13],red)
    m.add('box',[side*2.52,1.23,0],[0.17,0.102,3.52],red)
    m.add('box',[side*2.52,0.93,0],[0.09,0.07,3.4],wood)
    m.add('box',[side*1.18,1.72,2.47],[0.17,2.22,0.17],red)
    m.add('box',[side*1.18,0.73,2.47],[0.22,0.21,0.22],ink)
    paperLamp(m,side*1.76,2.35,1.95,1.05)
  }
  for(const [y,h,c] of [[3.12,0.22,red],[3.30,0.14,trim],[3.4,0.12,wood]] as const)m.add('box',[0,y,0],[5.32,h,3.7],c)
  for(let i=-5;i<=5;i++)for(const s of [-1,1]){
    m.add('box',[i*0.48,3.16,s*1.78],[0.15,0.2,0.48],wood)
    m.add('box',[i*0.48,3.20,s*2],[0.13,0.11,0.06],trim)
  }
  m.add('box',[0,2.73,2.47],[2.75,0.19,0.25],wood)
  shimenawa(m,[-1.2,2.65,2.54],[1.2,2.65,2.54],0.18,5)
  for(let i=0;i<5;i++){
    m.add('soft',[(i-2)*0.38,2.62,1.66],[0.368,0.55,0.055],'#516377')
    m.add('ball',[(i-2)*0.38,2.63,1.697],[0.067,0.067,0.016],'#e3cea1')
  }
  // Braided bell pull and the slatted offertory box at the entrance.
  m.add('ball',[0,2.52,2.43],[0.155,0.14,0.155],'#c29c5d')
  for(let i=0;i<13;i++)m.add('rod',[0,2.35-i*0.084,2.45],[0.049,0.086,0.049],i%2?'#dca977':'#f2ce97')
  m.add('cone',[0,1.21,2.45],[0.1,0.24,0.1],red)
  m.add('soft',[0,0.9,2.1],[1.47,0.54,0.55],wood)
  for(let i=0;i<9;i++)m.add('box',[(i-4)*0.15,1.18,2.1],[0.09,0.066,0.59],trim)
  for(const r of roofs)tiles(m,r)
  return m
}
