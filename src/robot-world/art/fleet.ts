import { DynamicDrawUsage, Group, InstancedMesh, Matrix4, MeshStandardMaterial, Object3D, Color } from 'three'
import type { Robot,Role } from '../crew/types'
import { droneRig,jointMotion,robotRig,type RobotJoint } from './robots.ts'
import type { GeometryWorkshop } from './bake'

export class FleetRenderer{
  private root=new Object3D()
  private local=new Object3D()
  private transform=new Matrix4()
  private batches:{robot:Robot[];joints:{part:RobotJoint;mesh:InstancedMesh}[]}[]=[]
  constructor(parent:Group,workshop:GeometryWorkshop,mat:MeshStandardMaterial,crew:Robot[]){
    for(const role of ['worker','engineer','transport','drone'] as Role[]){
      const robot=crew.filter(r=>r.role===role)
      const joints=(role==='drone'?droneRig():robotRig(role)).map(part=>{
        const mesh=new InstancedMesh(workshop.bake(part.model),mat,robot.length)
        mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(DynamicDrawUsage)
        robot.forEach((r,i)=>mesh.setColorAt(i,new Color(['#ffffff','#ffe5cf','#dbf5ee'][r.id%3])))
        parent.add(mesh);return {part,mesh}
      })
      this.batches.push({robot,joints})
    }
  }
  draw(time:number){
    for(const {robot,joints} of this.batches){
      robot.forEach((r,i)=>{
        const bob=r.role==='drone'?(r.duty==='charge'&&r.arrived?0:.042*Math.sin(time*3.6+r.phase)):r.role==='transport'?0:.041*Math.abs(Math.sin(r.stride))*Math.min(1,r.speed)
        this.root.position.set(r.pos[0],r.pos[1]+bob,r.pos[2])
        this.root.rotation.set(r.role==='drone'?.045*Math.min(1,r.speed):0,r.yaw,r.duty==='gather'?.045*Math.sin(time*2.7+r.phase):0)
        this.root.updateMatrix()
        for(const {part,mesh} of joints){
          this.local.position.set(...part.at)
          const angles=jointMotion(part,r,time)
          if(r.duty==='gather'&&part.joint==='arm'&&part.side===1)angles[2]=-2.31+.24*Math.sin(time*5+r.phase)
          this.local.rotation.set(...angles);this.local.updateMatrix()
          mesh.setMatrixAt(i,this.transform.multiplyMatrices(this.root.matrix,this.local.matrix))
        }
      })
      for(const {mesh} of joints)mesh.instanceMatrix.needsUpdate=true
    }
  }
  dispose(){for(const b of this.batches)for(const {mesh} of b.joints)mesh.dispose()}
}
