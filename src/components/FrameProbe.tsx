import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
export function FrameProbe(){
  const frames=useRef<number[]>([]),start=useRef(-1),last=useRef(0)
  useFrame(({gl})=>{
    const now=performance.now()
    if(start.current<0){start.current=now;last.current=now;return}
    if(frames.current.length<0)return
    if(now-start.current>2000)frames.current.push(now-last.current)
    last.current=now
    if(frames.current.length>=180 || (now-start.current>12500 && frames.current.length)){
      const a=frames.current.sort((x,y)=>x-y),ctx=gl.getContext(),ext=ctx.getExtension('WEBGL_debug_renderer_info')
      console.info('Shrine rendering sample',JSON.stringify({frames:a.length,medianMs:a[Math.floor(a.length/2)],p95Ms:a[Math.floor(a.length*.95)],draws:gl.info.render.calls,triangles:gl.info.render.triangles,geometries:gl.info.memory.geometries,renderer:ext?ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unknown',pixels:[gl.domElement.width,gl.domElement.height]}))
      start.current=now;frames.current=[]
    }
  })
  return null
}

