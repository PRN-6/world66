import { Shape } from 'three'
import { HALF, PATH, pondPoint } from '../layout'
import { Model, randomSource, TAU, type Point } from '../modeling'

export function topOutline() {
  const shape = new Shape()
  const h = HALF, r = 0.65
  shape.moveTo(-h+r,-h)
  shape.lineTo(h-r,-h); shape.quadraticCurveTo(h,-h,h,-h+r)
  shape.lineTo(h,h-r); shape.quadraticCurveTo(h,h,h-r,h)
  shape.lineTo(-h+r,h); shape.quadraticCurveTo(-h,h,-h,-h+r)
  shape.lineTo(-h,-h+r); shape.quadraticCurveTo(-h,-h,-h+r,-h)
  return shape
}
export function pondOutline(i: number) {
  const path = new Shape()
  for (let j=0; j<=96; j++) {
    const [x,z] = pondPoint(i, TAU*j/96)
    if (j === 0) path.moveTo(x,-z)
    else path.lineTo(x,-z)
  }
  path.closePath()
  return path
}
export function terrainDetails(m: Model) {
  const rand = randomSource(114)
  // A thin moss lip and courses of individually fitted, weathered foundation stone.
  m.add('soft',[0,-0.95,0],[15.92,1.25,15.92],'#626b67')
  m.add('soft',[0,-1.61,0],[15.5,0.22,15.5],'#5a6460')
  const stones = ['#85908a','#92938a','#788886','#a19e8b','#79817a','#9b9e8e']
  for(let side=0;side<4;side++) {
    const wall = new Model()
    for(let row=0;row<2;row++) {
      let x=-7.78
      while(x<7.75) {
        const w=Math.min(7.78-x,0.84+rand()*1.05)
        wall.add('soft',[x+w/2,-1.2+row*0.55,7.83],[w-0.025,0.53,0.32+rand()*0.12],stones[Math.floor(rand()*stones.length)],[0,0,(rand()-0.5)*0.035])
        x+=w
      }
    }
    wall.add('soft',[0,-0.24,7.84],[15.58,0.35,0.34],'#7e9458')
    for(let i=0;i<29;i++) wall.add('bloom',[-7.6+i*0.54,-0.1-rand()*0.08,7.8],[0.42,0.16+rand()*0.13,0.2],i%3?'#96ab61':'#aabb6b')
    m.place(wall,[0,0,0],side*Math.PI/2)
  }
  const pathColors=['#dfcfac','#c5bd9c','#e4d7b9','#cbc5ac','#d9cbae']
  for(let seg=0;seg<PATH.length-1;seg++){
    const [ax,az]=PATH[seg], [bx,bz]=PATH[seg+1]
    const dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz),rows=Math.ceil(len/0.49),angle=Math.atan2(dx,dz)
    for(let row=0;row<rows;row++){
      const t=(row+0.5)/rows,split=0.58+rand()*0.56
      let offset=-0.94
      for(const width of [split,1.88-split]){
        const middle=offset+width/2
        m.add('soft',[ax+dx*t+dz/len*middle,0.035,az+dz*t-dx/len*middle],[width-0.04,0.115,len/rows-0.032],pathColors[Math.floor(rand()*5)],[0,angle+(rand()-0.5)*0.045,0])
        offset+=width
      }
    }
  }
  const stepping: Point[]=[[0.12,2.0],[0.88,1.85],[1.55,1.77],[0.45,3.15],[0.95,3.8],[1.24,4.68],[1.62,5.34],[2.28,5.97],[2.9,6.28],[3.65,6.42],[-3.25,0.64],[-3.83,0.38]]
  stepping.forEach(([x,z],i)=>m.add('rock',[x,0.047,z],[0.47,0.09,0.34],pathColors[i%5],[0,i*1.3,0]))
}
