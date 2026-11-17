import { BufferGeometry, Float32BufferAttribute, Matrix3, Vector3 } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { type Model, shapeLibrary } from '../../world/modeling.ts'

// Moving subassemblies use one vertex-coloured mesh per independently moving joint.
export class GeometryWorkshop {
  private shapes=shapeLibrary()
  private made:BufferGeometry[]=[]
  constructor(){
    this.shapes.soft.dispose()
    this.shapes.soft=new RoundedBoxGeometry(1,1,1,2,.215)
  }
  bake(model:Model){
    const positions:number[]=[],normals:number[]=[],colors:number[]=[],indices:number[]=[]
    const v=new Vector3(),nmat=new Matrix3()
    for(const p of model.parts){
      const source=this.shapes[p.shape],pos=source.getAttribute('position'),norm=source.getAttribute('normal')
      const start=positions.length/3
      nmat.getNormalMatrix(p.matrix)
      for(let i=0;i<pos.count;i++){
        v.fromBufferAttribute(pos,i).applyMatrix4(p.matrix);positions.push(v.x,v.y,v.z)
        v.fromBufferAttribute(norm,i).applyNormalMatrix(nmat);normals.push(v.x,v.y,v.z)
        colors.push(p.color.r,p.color.g,p.color.b)
      }
      const count=source.index?.count??pos.count
      for(let i=0;i<count;i++)indices.push(start+(source.index?.getX(i)??i))
    }
    const g=new BufferGeometry()
    for(const [key,data] of [['position',positions],['normal',normals],['color',colors]] as const)g.setAttribute(key,new Float32BufferAttribute(data,3))
    g.setIndex(indices);g.computeBoundingBox();g.computeBoundingSphere();this.made.push(g);return g
  }
  dispose(){Object.values(this.shapes).forEach(g=>g.dispose());this.made.forEach(g=>g.dispose());this.made.length=0}
}
