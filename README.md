# Japanese Cat Shrine

An orbitable Japanese shrine garden built with React Three Fiber, Three.js and Rapier. Five articulated cats share two koi ponds, an arched bridge, a shrine path and two physical temari balls. All geometry, coats and textures are generated locally.

## Run the garden

Use the installed dependencies and Node 24.

```sh
npm run dev
```

Drag to orbit and scroll or pinch to zoom. Click or tap a cat to pet it. Click or tap a patterned ball to bat it across the garden.

## Embed the world

`Scene` supplies a responsive canvas, orthographic camera, lighting and orbit controls. Give its parent a height.

```tsx
import { Scene } from "./components/Scene";

export function GardenPanel() {
  return (
    <section style={{ height: "75vh" }}>
      <Scene seed={66} />
    </section>
  );
}
```

When the host already owns the R3F canvas and lighting, mount `ShrineWorld` from `src/world` inside that canvas. It owns its Rapier context. The garden spans 16 × 16 units with ground at `y = 0`, and the front gate faces positive Z. The existing verification scene remains available from `src/components`.

Both entries accept the following optional props.

| Prop               | Behavior                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| `seed`             | Seeds behavioral choices. Changing it starts a fresh colony and resets the toys. Defaults to 66. |
| `onPhysicsReady()` | Fires after the first physics step of each simulation.                                           |
| `onCatPet(name)`   | Reports the resident that the visitor petted.                                                    |

## Systems

- `src/world/layout.ts` and `obstacles.ts` describe landmarks, pond banks, paths and clearance. Navigation and physics share this layout.
- `src/world/architecture`, `terrain` and `vegetation` construct the miniature. Repeated parts are instanced, with painted ground shading and a cached directional shadow map in the standalone scene.
- `src/world/water` and `environment` animate koi, reflections, ripples, wind and drifting petals.
- `src/cats/profiles.ts` defines appearances and personality weights. `models/catRig.ts` builds one skinned mesh per resident, and `animations/pose.ts` blends poses.
- `src/cats/ai` chooses destinations and uses a shared grid, swept edges and A* routes. Movement runs at a fixed timestep. Each cat makes decisions on a staggered schedule and replans around blocked passages.
- `src/physics` owns fixed colliders and dynamic toys. Kinematic cat colliders follow the animated residents. The Rapier bundle loads after the environment can render.

## Verification

```sh
npm run lint
npm test
npm run build
npm run preview
```

The Node tests use the production navigation, decision model, collider layout and Rapier WASM. They exercise all garden destinations, peer avoidance, independent behavior, physical swats, containment and lost-toy recovery.
