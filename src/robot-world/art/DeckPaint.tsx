import { useEffect,useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { randomSource,TAU } from '../../world/modeling'
import { ROAD_LENGTH,roadAt,relays,toolBays } from '../site/layout'

function deckMap(){
  const c=document.createElement('canvas');c.width=c.height=2048
  const g=c.getContext('2d')!,size=21.55,unit=c.width/size,random=randomSource(4202)
  g.translate(c.width/2,c.height/2);g.scale(unit,unit)
  g.beginPath();g.roundRect(-size/2,-size/2,size,size,1.37);g.clip()
  g.fillStyle='#c5c9b5';g.fillRect(-11,-11,22,22)
  for(let i=0;i<30000;i++){
    g.fillStyle=i%2?'rgba(69,93,93,.08)':'rgba(255,245,211,.16)'
    g.fillRect((random()-.5)*22,(random()-.5)*22,.012+random()*.04,.009+random()*.023)
  }
  g.lineWidth=.019;g.strokeStyle='#9eaca0'
  for(let i=-10.5;i<11;i+=2.63){
    g.beginPath();g.moveTo(i,-11);g.lineTo(i,11);g.moveTo(-11,i);g.lineTo(11,i);g.stroke()
  }
  function line(offset:number,color:string,width:number,dash:number[]=[]){
    g.beginPath()
    for(let s=0;s<=ROAD_LENGTH;s+=.07){const p=roadAt(s,offset);if(s===0)g.moveTo(p.x,p.z);else g.lineTo(p.x,p.z)}
    g.closePath();g.strokeStyle=color;g.lineWidth=width;g.setLineDash(dash);g.stroke();g.setLineDash([])
  }
  line(0,'#e7dbc0',2.42);line(0,'#738994',2.28)
  line(-.88,'#c3bd97',.043);line(.88,'#c3bd97',.043)
  line(0,'#dfdfc8',.063,[.48,.69])
  for(let s=1;s<ROAD_LENGTH;s+=5.43){
    const p=roadAt(s,.56),angle=Math.atan2(p.dx,p.dz)
    g.save();g.translate(p.x,p.z);g.rotate(-angle);g.strokeStyle='#e3d6ad';g.lineWidth=.085
    g.beginPath();g.moveTo(-.2,-.16);g.lineTo(0,.13);g.lineTo(.2,-.16);g.stroke();g.restore()
  }
  for(const b of toolBays){
    const [x,,z]=b.point
    g.strokeStyle='#90a99b';g.lineWidth=.053;g.strokeRect(x-.58,z-.57,1.16,1.14)
  }
  g.font='900 .51px sans-serif';g.fillStyle='#778f8e'
  relays.forEach((b,i)=>g.fillText('T 0'+(i+1),b.point[0]-.45,b.point[2]+1.25))
  g.fillStyle='#899d97';g.font='900 1.1px sans-serif';g.fillText('02',-8.1,8.98)
  g.font='bold .24px monospace';g.fillText('MATERIAL TRANSFER',-8.08,9.39)
  for(const [x,z,r] of [[0,-1.18,3.8],[-8.28,-6.76,2.85],[8.23,5.6,2.39]]){
    const glow=g.createRadialGradient(x,z,r*.41,x,z,r*1.16)
    glow.addColorStop(0,'rgba(54,80,81,.32)');glow.addColorStop(1,'rgba(54,80,81,0)')
    g.fillStyle=glow;g.beginPath();g.arc(x,z,r*1.16,0,TAU);g.fill()
  }
  const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;t.anisotropy=8;return t
}
export function DeckPaint(){
  const map=useMemo(()=>deckMap(),[]);useEffect(()=>()=>map.dispose(),[map])
  return <mesh position-y={.024} rotation-x={-Math.PI/2} receiveShadow><planeGeometry args={[21.55,21.55]}/><meshStandardMaterial map={map} alphaTest={.5} roughness={.91}/></mesh>
}
