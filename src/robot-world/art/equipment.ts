import { Model,TAU,type V3 } from '../../world/modeling.ts'
import { palette as P,toolBays,craneConsole } from '../site/layout.ts'

function tanks(m:Model,x:number,z:number){
  for(const s of [-1,1]){
    const px=x+s*.39
    m.add('rod',[px,.80,z],[.31,1.06,.31],P.teal)
    m.add('ball',[px,1.33,z],[.31,.23,.31],P.mint)
    for(const h of [.34,1.12])m.add('rod',[px,h,z],[.323,.105,.323],P.white)
    m.add('rod',[px,1.58,z],[.108,.18,.108],P.iron)
    m.beam([px,1.65,z],[px,1.79,z],.055,P.lemon)
    m.beam([px,1.79,z],[x,1.79,z],.055,P.lemon)
  }
  m.add('soft',[x,.12,z],[1.78,.23,.97],P.navy)
}
function robotArm(m:Model,at:V3,scale:number){
  const arm=new Model()
  arm.add('rod',[0,.15,0],[.36,.30,.36],P.navy)
  const joints:V3[]=[[0,.35,0],[-.28,1.04,0],[.32,1.49,.13],[.63,1.22,.19]]
  for(let i=0;i<3;i++){
    const a=joints[i],b=joints[i+1];arm.beam(a,b,i===2?.09:.15,P.lemon)
    arm.add('rod',a,[.18,.33,.18],P.iron,[Math.PI/2,0,0])
    arm.add('rod',[a[0],a[1],a[2]+.18],[.096,.032,.096],P.coral,[Math.PI/2,0,0])
  }
  arm.add('cone',[.66,1.1,.19],[.09,.27,.09],P.navy,[Math.PI,0,.11])
  m.place(arm,at,0,scale)
}
export function yardEquipment(m:Model){
  const [cx,,cz]=craneConsole.point
  m.add('soft',[cx+.63,.41,cz],[.42,.81,.78],P.teal)
  m.add('soft',[cx+.57,.9,cz],[.50,.16,.84],P.lemon,[0,0,-.25])
  m.add('soft',[cx+.52,1.10,cz-.19],[.19,.28,.42],P.navy)
  m.add('bud',[cx+.37,.99,cz+.17],[.062,.098,.062],P.coral)
  // The warehouse canopy follows rolled ribs like a vintage aircraft hangar.
  const base=new Model()
  for(let j=0;j<18;j++){
    const a=j*Math.PI/18,b=(j+1)*Math.PI/18
    const lift=(u:number):V3=>[1.85*Math.cos(u),2.68+.66*Math.sin(u),0]
    const p=lift(a),q=lift(b)
    base.beam(p,q,.12,j%4===0?'#73beb0':'#95cbb8','box',4.12)
    for(const z of [-1.99,-1.02,0,1.02,1.99]){
      p[2]=z;q[2]=z;base.beam(p,q,.042,P.white)
    }
  }
  m.place(base,[-8.28,0,-6.76],.1)
  tanks(m,9.0,2.35);tanks(m,-9.25,-3.75)
  for(const [x,z] of [[-8.71,3.63],[-9.03,6.92],[8.34,8.52],[4.0,-8.66]]){
    for(let i=0;i<5;i++)m.add('soft',[x+(i-2)*.27,.105,z],[.23,.13,1.33],'#b28c5c')
    for(const s of [-1,1])m.add('soft',[x,.052,z+s*.47],[1.48,.085,.19],'#9d805c')
    m.add('rod',[x-.33,.49,z],[.30,.68,.30],P.amber)
    m.add('rod',[x+.34,.49,z+.06],[.30,.68,.30],P.teal)
    for(const s of [-1,1])for(const h of [.3,.70])m.add('rod',[x+s*.335,h,z+(s>0?.06:0)],[.312,.061,.312],P.iron)
  }
  robotArm(m,[6.72,.03,7.89],1.04);robotArm(m,[-9.02,.06,1.86],1.08)
  // Tool carousels on the rear apron give the standby team real preparation stations.
  toolBays.slice(0,6).forEach((b,i)=>{
    const [x,,z]=b.point
    m.add('soft',[x,.4,z-.76],[1.06,.75,.56],i%2?P.iron:P.teal)
    m.add('soft',[x,.82,z-.76],[1.17,.11,.66],P.white)
    for(let k=0;k<3;k++)m.add('rod',[x+(k-1)*.27,.94,z-.75],[.106,.16,.106],k===1?P.lemon:P.navy)
    m.add('soft',[x,.48,z-.46],[.67,.12,.035],P.navy)
  })
  // Bundled conduits run along the fascia and return into the corner service boxes.
  for(const side of [-1,1]){
    const x=side*9.55
    for(let i=0;i<2;i++){
      const px=x+i*.17
      m.beam([px,.13,-8.76],[px,.13,-4.81],.061,i?P.lemon:P.iron)
      m.beam([px,.13,-4.81],[px,.56,-4.49],.061,i?P.lemon:P.iron)
    }
  }
  for(const x of [-6.7,6.7])for(let k=0;k<7;k++){
    m.add('soft',[x+(k-3)*.21,-.84,10.72],[.105,.36,.064],P.ink,[0,0,-.21])
  }
  for(let i=0;i<10;i++){
    const a=TAU*i/10
    m.add('soft',[3.50*Math.sin(a),.36,-1.18+3.50*Math.cos(a)],[.40,.082,.095],P.lemon,[0,a,0])
  }
}
