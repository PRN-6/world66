import { BoxGeometry, Color, CylinderGeometry, DynamicDrawUsage, Group, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Vector3 } from 'three'
import { Model, type V3 } from '../../world/modeling.ts'
import { CRANE, palette as P, sources } from '../site/layout.ts'
import { armPivot,headPivot } from '../assembly/blueprint.ts'
import type { ConstructionSite } from '../assembly/coordination'
import type { CargoHull } from '../physics/FreightYard'
import { GeometryWorkshop } from './bake.ts'
import { giantFrame,moduleModel } from './giant.ts'
import { FleetRenderer } from './fleet.ts'
import { craneModels,generatorRotor } from './machinery.ts'

export class YardRenderer{
  root=new Group()
  hulls:CargoHull[]=[]
  private workshop=new GeometryWorkshop()
  private paint=new MeshStandardMaterial({vertexColors:true,roughness:.64,metalness:.12})
  private eyePaint=this.paint.clone()
  private emission=new MeshBasicMaterial({color:'#baffdb',toneMapped:false})
  private sparkPaint=new MeshBasicMaterial({toneMapped:false})
  private arms=[new Group(),new Group()]
  private head=new Group()
  private eyeLights:Mesh[]=[]
  private modules:Mesh[]=[]
  private fleet:FleetRenderer
  private jib:Mesh;private trolley:Mesh;private hook:Mesh;private cable:Mesh
  private sparks:InstancedMesh
  private belts:InstancedMesh
  private grips:InstancedMesh
  private gripStart=new Vector3()
  private gripAxis=new Vector3()
  private up=new Vector3(0,1,0)
  private rotors:Mesh[]=[]
  private lamps:Mesh[]=[]
  private signalColors=[new MeshBasicMaterial({color:'#4d686c'}),new MeshBasicMaterial({color:'#ffc66c',toneMapped:false}),new MeshBasicMaterial({color:'#a5ffe0',toneMapped:false})]
  private cube=new BoxGeometry(1,1,1)
  private wire=new CylinderGeometry(.021,.021,1,8)
  private wireMat=new MeshStandardMaterial({color:P.navy,roughness:.7})
  private marker=new Object3D()
  constructor(site:ConstructionSite){
    this.root.name='Robot assembly simulation'
    this.mesh(giantFrame())
    this.head.position.set(...headPivot);this.root.add(this.head)
    this.arms.forEach((a,i)=>{a.position.set(...armPivot(i===0?-1:1));this.root.add(a)})
    for(const o of site.orders){
      const m=this.mesh(moduleModel(o.spec));m.name=o.spec.id;m.visible=false
      if(o.spec.kind==='eye'||o.spec.kind==='reactor')m.material=this.eyePaint
      this.modules.push(m)
      const b=m.geometry.boundingBox!
      this.hulls.push({half:b.getSize(new Vector3()).multiplyScalar(.5).toArray() as V3,center:b.getCenter(new Vector3()).toArray() as V3})
      if(o.spec.kind==='eye'){
        const g=new Mesh(this.cube,this.emission)
        g.scale.set(.26,.145,.014)
        g.position.set(o.spec.socket[0]-headPivot[0],o.spec.socket[1]-headPivot[1],o.spec.socket[2]-headPivot[2]+.087)
        g.visible=false;this.head.add(g);this.eyeLights.push(g)
      }
    }
    this.fleet=new FleetRenderer(this.root,this.workshop,this.paint,site.crew)
    const crane=craneModels()
    this.jib=this.mesh(crane.jib);this.jib.position.set(...CRANE)
    this.trolley=this.mesh(crane.trolley);this.hook=this.mesh(crane.hook)
    this.cable=new Mesh(this.wire,this.wireMat);this.root.add(this.cable)
    this.grips=new InstancedMesh(this.wire,this.wireMat,site.crew.length*2)
    this.grips.frustumCulled=false;this.root.add(this.grips)
    const rotor=this.workshop.bake(generatorRotor())
    for(const x of [-9.14,-7.72]){
      const m=new Mesh(rotor,this.paint);m.position.set(x,3.42,-6.82);this.rotors.push(m);this.root.add(m)
    }
    this.belts=new InstancedMesh(this.cube,this.sparkPaint,3*5);this.belts.frustumCulled=false;this.root.add(this.belts)
    for(let i=0;i<15;i++)this.belts.setColorAt(i,new Color(P.mint))
    for(let i=0;i<6;i++){
      const lamp=new Mesh(this.cube,this.signalColors[0])
      lamp.position.set(-.89+i*.36,.43,2.36);lamp.scale.set(.239,.1,.059);this.lamps.push(lamp);this.root.add(lamp)
    }
    this.sparks=new InstancedMesh(this.cube,this.sparkPaint,72);this.sparks.instanceMatrix.setUsage(DynamicDrawUsage);this.sparks.frustumCulled=false
    for(let i=0;i<72;i++)this.sparks.setColorAt(i,new Color(i%2?'#ffb446':'#fff5ac'))
    this.root.add(this.sparks)
    this.draw(site)
  }
  private mesh(model:Model){const m=new Mesh(this.workshop.bake(model),this.paint);m.castShadow=m.receiveShadow=true;this.root.add(m);return m}
  private drawSparks(site:ConstructionSite){
    const origins:V3[]=[]
    if(site.crane.job>=0&&site.crane.step>=3)origins.push(site.orders[site.crane.job].pos)
    for(const r of site.crew)if(r.tool&&r.arrived){
      const weld:V3=[r.pos[0]+Math.sin(r.yaw)*.35,r.pos[1]+.59,r.pos[2]+Math.cos(r.yaw)*.35]
      origins.push(weld)
    }
    const n=Math.min(72,origins.length*9),o=this.marker
    for(let i=0;i<n;i++){
      const p=origins[Math.floor(i/9)],age=(site.time*2.5+i*.173)%1,a=i*2.4
      o.position.set(p[0]+age*.38*Math.cos(a),p[1]+.14+age*.64-age*age*.72,p[2]+age*.38*Math.sin(a))
      o.rotation.set(.5,a,.6);o.scale.setScalar(.034*(1-age));o.scale.y*=2.7;o.updateMatrix();this.sparks.setMatrixAt(i,o.matrix)
    }
    this.sparks.count=n;this.sparks.instanceMatrix.needsUpdate=true
  }
  draw(site:ConstructionSite){
    this.fleet.draw(site.time)
    let gripCount=0
    for(const o of site.orders){
      const m=this.modules[o.index];m.visible=o.mode!=='hidden'
      if(!m.visible)continue
      if(o.mode==='attached'){
        const joint=o.spec.joint==='head'?this.head:o.spec.joint==='left-arm'?this.arms[0]:o.spec.joint==='right-arm'?this.arms[1]:this.root
        if(m.parent!==joint)joint.add(m)
        m.position.set(...o.spec.socket)
        if(joint!==this.root)m.position.sub(joint.position)
      }else m.position.set(...o.pos)
      if(o.mode==='gripped'&&o.owner>=0){
        const r=site.crew[o.owner],air=r.role==='drone',width=Math.min(.38,this.hulls[o.index].half[0]*.74)
        for(const s of [-1,1]){
          const dx=s*Math.cos(r.yaw),dz=-s*Math.sin(r.yaw)
          this.gripStart.set(r.pos[0]+dx*.22,r.pos[1]+(air?.04:.52),r.pos[2]+dz*.22)
          this.gripAxis.set(o.pos[0]+dx*width,o.pos[1]+(air?o.top:-o.under),o.pos[2]+dz*width).sub(this.gripStart)
          this.marker.position.copy(this.gripStart).addScaledVector(this.gripAxis,.5)
          this.marker.scale.set(air?.83:2.6,this.gripAxis.length(),air?.83:2.6)
          this.marker.quaternion.setFromUnitVectors(this.up,this.gripAxis.normalize());this.marker.updateMatrix()
          this.grips.setMatrixAt(gripCount++,this.marker.matrix)
        }
      }
    }
    this.grips.count=gripCount;this.grips.instanceMatrix.needsUpdate=true
    const t=site.activation,blend=Math.min(1,t/1.4)
    this.head.rotation.set(.07*blend*Math.sin(t*1.4),.38*blend*Math.sin(t*.93),.049*blend*Math.sin(t*1.2))
    this.arms[0].rotation.set(-.24*blend*(1+Math.sin(t*1.4)),0,-.15*blend)
    this.arms[1].rotation.set(-.53*blend,.08*blend,(.63+.19*Math.sin(t*2.6))*blend)
    this.eyePaint.emissive.setRGB(.09*blend,.55*blend,.43*blend)
    this.eyeLights.forEach(eye=>{eye.visible=site.completed})
    const [x,y,z]=site.crane.hook,ceil=CRANE[1]-.26
    this.jib.rotation.y=Math.atan2(x-CRANE[0],z-CRANE[2]);this.trolley.position.set(x,CRANE[1],z)
    this.trolley.rotation.y=this.jib.rotation.y;this.hook.position.set(x,y,z)
    this.cable.position.set(x,(ceil+y+.26)/2,z);this.cable.scale.y=Math.max(.05,ceil-y-.26)
    this.rotors.forEach((r,i)=>r.rotation.y=site.time*(site.machines[i].wear>.94?1.3:4.4))
    this.lamps.forEach((l,i)=>{l.material=this.signalColors[i<site.stage?2:i===site.stage?1:0]})
    for(let i=0;i<15;i++){
      const source=Math.floor(i/5),p=sources[source].point,phase=(site.time*.68+(i%5)/5)%1
      this.marker.position.set(p[0]-1.8+phase*1.83,.624,p[2]+.63);this.marker.rotation.set(0,0,0)
      this.marker.scale.set(.12,.027,.14);this.marker.updateMatrix();this.belts.setMatrixAt(i,this.marker.matrix)
    }
    this.belts.instanceMatrix.needsUpdate=true;this.drawSparks(site)
  }
  dispose(){
    this.fleet.dispose();this.sparks.dispose();this.belts.dispose();this.grips.dispose();this.workshop.dispose()
    this.cube.dispose();this.wire.dispose();this.wireMat.dispose();this.paint.dispose();this.eyePaint.dispose()
    this.signalColors.forEach(m=>m.dispose());this.emission.dispose();this.sparkPaint.dispose();this.root.clear()
  }
}
