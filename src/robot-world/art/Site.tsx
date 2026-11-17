import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { CanvasTexture, Group, SRGBColorSpace } from 'three'
import { buildInstances, type V3 } from '../../world/modeling'
import { createSite } from './staticSite'
import { palette as P } from '../site/layout'
import { DeckPaint } from './DeckPaint'

function EnamelSign({at,width,height,title,caption,accent=P.lemon,turn=0}:{at:V3;width:number;height:number;title:string;caption:string;accent?:string;turn?:number}){
  const map=useMemo(()=>{
    const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*height/width)
    const g=c.getContext('2d')!
    g.fillStyle='#263e4c';g.fillRect(0,0,c.width,c.height)
    g.fillStyle=accent;g.fillRect(0,0,18,c.height)
    const lower=c.height*.69
    g.fillStyle='#fff0d3';g.font='900 '+Math.round(c.height*.51)+'px "Arial Black",system-ui,sans-serif'
    g.fillText(title,39,lower,c.width-80)
    g.fillStyle=accent;g.font='bold '+Math.round(c.height*.16)+'px monospace'
    g.fillText(caption,43,c.height*.91,c.width-82)
    for(const x of [25,1004])for(const y of [12,c.height-12]){g.beginPath();g.arc(x,y,3,0,Math.PI*2);g.fill()}
    const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;t.anisotropy=4;return t
  },[width,height,title,caption,accent])
  useEffect(()=>()=>map.dispose(),[map])
  return <mesh position={at} rotation-y={turn}><planeGeometry args={[width,height]}/><meshStandardMaterial map={map} roughness={.67}/></mesh>
}
export function Site(){
  const root=useRef<Group>(null)
  useLayoutEffect(()=>{
    const batch=buildInstances(createSite()),node=root.current!
    node.add(batch.group)
    return ()=>{node.remove(batch.group);batch.dispose()}
  },[])
  return <group name="Atlas assembly yard">
    <group ref={root}/><DeckPaint/>
    <EnamelSign at={[0,-.84,10.758]} width={5.15} height={.82} title="ATLAS WORKS" caption="HEAVY ROBOTICS    /    ASSEMBLY YARD 02"/>
    <group position={[-8.28,0,-6.76]} rotation-y={.1}><EnamelSign at={[0,2.12,2.14]} width={3.03} height={.41} title="SUPPLY" caption="COMPONENT FOUNDRY   /   01"/></group>
    <group position={[8.23,0,5.6]} rotation-y={-.14}><EnamelSign at={[0,1.64,1.61]} width={2.80} height={.36} title="SERVICE" caption="ROBOT REPAIR   /   03" accent={P.mint}/></group>
  </group>
}
