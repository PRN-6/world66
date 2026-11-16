import { BAMBOO, inPond, LANTERNS, PATH, pondPoint, ROCKS, TREES } from '../layout'
import { Model, randomSource, TAU, type Point, type V3 } from '../modeling'

const greens=['#839f54','#94ad5b','#668d56','#adba69','#5c895f']
export function cherryTree(size:number,pink:boolean,seed:number) {
  const m=new Model(),rand=randomSource(seed)
  const bark=pink?'#785849':'#6d5c4a'
  const branch=(a:V3,b:V3,r:number)=>m.beam(a,b,r,bark,'taper')
  branch([0,0,0],[-0.1,1.04,0.08],0.36)
  branch([-0.1,1.02,0.08],[0.24,2.15,-0.08],0.27)
  for(let i=0;i<6;i++){
    const a=i*TAU/6
    branch([Math.cos(a)*0.74,0.04,Math.sin(a)*0.67],[0,0.32,0],0.145)
  }
  const bright=pink?['#ed9faf','#ffbac7','#f6adb8','#ffcccf','#e99aa9']:['#87ac6d','#95b477','#769e69','#b2be80','#85ae78']
  const shade=pink?['#d68699','#dc90a4','#e099a8']:['#608965','#72936a','#739b69']
  const crowns:V3[]=[[-1.42,3.05,0.52],[1.37,3.45,0.1],[-0.5,4.13,-0.65],[0.53,4.5,-0.2],[-0.5,3.7,0.86],[-1.25,3.78,-0.64],[1.08,3.89,-0.85]]
  crowns.forEach(([x,y,z],i)=>{
    const fork:V3=[x*0.62,y-0.92,z*0.65]
    branch([0.14,1.7+i*0.09,0],fork,0.17-i*0.008)
    branch(fork,[x,y-0.12,z],0.117)
    for(let j=0;j<7;j++){
      const a=TAU*j/7+rand()*0.3, dist=j===0?0:0.61+rand()*0.28
      const px=x+Math.cos(a)*dist, pz=z+Math.sin(a)*dist, py=y+rand()*0.31+(j===0?0.28:0)
      if(j%2===0)branch(fork,[px,py-0.08,pz],0.052)
      const w=0.6+rand()*0.29
      m.add('bloom',[px,py,pz],[w,0.43+rand()*0.18,w*0.89],shade[j%3],[rand(),rand(),rand()*0.18])
      m.add('bloom',[px-0.045,py+0.18,pz+0.035],[w*0.97,0.43,w*0.86],bright[Math.floor(rand()*bright.length)],[0,rand()*3,rand()*0.2])
      // Small petal clusters break the silhouette and catch the light.
      for(let k=0;k<16;k++){
        const b=rand()*TAU,elev=rand()*1.5,s=Math.cos(elev)
        const blossomSize=0.069+rand()*0.073
        m.add(pink?'blossom':'pebble',[px+s*Math.cos(b)*w,py+0.2+Math.sin(elev)*0.44,pz+s*Math.sin(b)*w*0.9],
          [blossomSize,0.046,blossomSize],pink?(k%3?'#ffd0d3':'#f0a3b7'):bright[k%5],[Math.cos(elev)*Math.sin(b),rand()*2, -Math.cos(elev)*Math.cos(b)])
      }
    }
  })
  const tree=new Model();tree.place(m,[0,0,0],0,size);return tree
}
export function flower(m:Model,x:number,z:number,height:number,color:string,a:number) {
  m.beam([x,0.06,z],[x,height,z],0.017,'#647d49')
  m.add('pebble',[x+0.04,height*0.55,z],[0.098,0.035,0.047],'#83a457',[0,a,0.45])
  for(let i=0;i<5;i++){
    const r=a+i*TAU/5
    m.add('ball',[x+0.068*Math.cos(r),height,z+0.068*Math.sin(r)],[0.066,0.046,0.057],color,[0,-r,0])
  }
  m.add('ball',[x,height+0.035,z],[0.047,0.04,0.047],'#f4c36d')
}
function distanceToPath(x:number,z:number) {
  return PATH.slice(1).reduce((best,[bx,bz],i)=>{
    const [ax,az]=PATH[i],dx=bx-ax,dz=bz-az
    const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)))
    return Math.min(best,Math.hypot(x-ax-t*dx,z-az-t*dz))
  },Infinity)
}
export function planting(m:Model) {
  const rand=randomSource(765341)
  TREES.forEach((t,i)=>m.place(cherryTree(t.size,t.pink,i+3),[t.x,0,t.z],t.turn))
  BAMBOO.forEach(([x,z])=>{
    for(let i=0;i<11;i++){
      const a=rand()*TAU,r=rand()*0.79
      const bx=x+r*Math.cos(a),bz=z+r*Math.sin(a),h=2.35+rand()*2.1,lean=(rand()-0.5)*0.65
      const point=(t:number):V3=>[bx+lean*t,h*t,bz+0.15*t]
      m.beam(point(0),point(1),0.078,i%3?'#8aab65':'#a5b574')
      for(let j=1;j<=6;j++){
        const t=j/7
        m.beam(point(t),point(t+0.013),0.091,'#648657')
        if(j<3)continue
        const p=point(t),b=rand()*TAU
        const end:V3=[p[0]+0.49*Math.cos(b),p[1]+0.24,p[2]+0.49*Math.sin(b)]
        m.beam(p,end,0.024,'#76945b')
        for(let k=0;k<4;k++)m.add('pebble',[end[0]+0.15*Math.cos(b+k),end[1]+0.05*k,end[2]+0.15*Math.sin(b+k)],[0.27,0.052,0.085],greens[(i+k)%5],[0,b+k,0.35])
      }
    }
  })
  const beds:Point[]=[[-5.4,5.8],[-6.25,1.35],[-4.4,-2.85],[1.64,4.08],[5.42,5.84],[6.7,-1.35],[3.1,-4.9],[-4.5,-5.6],[0.55,6.83],[-6.3,-6.23]]
  beds.forEach(([x,z],i)=>{
    for(let j=0;j<10;j++){
      const a=rand()*TAU,px=x+Math.cos(a)*rand()*0.95,pz=z+Math.sin(a)*rand()*0.63
      if(inPond(px,pz,0.08))continue
      const s=0.21+rand()*0.32
      m.add('bloom',[px,s*0.34,pz],[s*1.14,s*0.78,s],greens[(j+i)%5],[0,a,0])
    }
    for(let j=0;j<22;j++){
      const px=x+(rand()-0.5)*2,pz=z+(rand()-0.5)*1.5
      if(!inPond(px,pz,0.12)&&distanceToPath(px,pz)>1.0)flower(m,px,pz,0.29+rand()*0.24,['#fff0c2','#e8938f','#d9b8e2','#f3bf66'][i%4],rand()*TAU)
    }
  })
  ROCKS.forEach(([x,z,s],i)=>{
    m.add('rock',[x,s*0.46,z],[s*1.33,s,s*0.92],i%2?'#929b92':'#7c8982',[0,i,0.23])
    m.add('bloom',[x,s*1.05,z],[s*1.06,s*0.29,s*0.79],'#8fa362',[0,i,0.12])
    m.add('rock',[x+0.52,s*0.17,z+0.24],[s*0.67,s*0.46,s*0.62],'#a3a793',[0,i+1,0])
  })
  for(let p=0;p<2;p++)for(let j=0;j<(p?46:73);j++){
    const [x,z]=pondPoint(p,j*TAU/(p?46:73),1.0)
    if(p===0&&Math.abs(z-1.8)<0.82)continue
    const s=0.13+rand()*0.23
    m.add('rock',[x,0.012+rand()*0.065,z],[s*1.2,s*0.58,s],['#8d9e88','#a5af96','#b3b59b','#899a77'][j%4],[0,rand()*3,rand()*0.24])
  }
  for(let i=0;i<670;i++){
    const x=(rand()-0.5)*15.45,z=(rand()-0.5)*15.45
    if(inPond(x,z,0.22)||distanceToPath(x,z)<1.17||(Math.abs(x)<2.9&&z<-1.1)||LANTERNS.some(([lx,lz])=>Math.hypot(x-lx,z-lz)<0.4))continue
    const a=rand()*TAU
    for(let k=0;k<3;k++)m.add('pebble',[x+k*0.035,0.081,z+0.045*Math.sin(k)],[0.042,0.11+rand()*0.095,0.031],greens[i%5],[0,a,-0.4+k*0.4])
  }
  // A drift of windblown petals collects around the cherry trees and on the path.
  for(const t of TREES.filter(t=>t.pink))for(let i=0;i<98;i++){
    const r=rand()*3.2,a=rand()*TAU,x=t.x+r*Math.cos(a),z=t.z+r*Math.sin(a)
    if(Math.max(Math.abs(x),Math.abs(z))>7.85||inPond(x,z))continue
    m.add('pebble',[x,distanceToPath(x,z)<1?0.101:0.021,z],[0.066,0.018,0.041],i%3?'#f6b8bc':'#f7d1c7',[0,a,0])
  }
}

