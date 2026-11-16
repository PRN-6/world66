# 3D Cat Shrine World - Development Foundation

A browser-based 3D environment project: a peaceful, cozy Japanese shrine garden populated by adorable cats.

This repository provides the core technical foundation and development environment, configured with React, TypeScript, Vite, Three.js, React Three Fiber, Drei, and Rapier Physics.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vite.dev/)
- **3D Graphics**: [Three.js](https://threejs.org/)
- **React 3D Renderer**: [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/)
- **R3F Ecosystem Helpers**: [@react-three/drei](https://github.com/pmndrs/drei)
- **Physics Engine**: [@react-three/rapier](https://github.com/pmndrs/react-three-rapier) (Rapier3D WebAssembly)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)

---

## Folder Structure

```
src/
├── assets/                 # Static 3D/audio assets
│   ├── audio/              # Sound effects, ambient sounds, music
│   ├── models/             # 3D assets (.gltf, .glb)
│   └── textures/           # PBR texture maps, skyboxes, decals
├── cats/                   # Cat subsystem
│   ├── ai/                 # Behavior trees, state machines, wandering logic
│   ├── animations/         # Skeletal animation controllers and blending
│   └── models/             # Cat 3D model loaders and variants
├── components/             # Reusable UI & 3D components
│   ├── LoadingFallback.tsx # Suspense fallback during asset/WASM loads
│   ├── Scene.tsx           # Primary 3D Canvas, lights, camera & controls
│   └── VerificationScene.tsx # Minimal physics & WebGL verification scene
├── hooks/                  # Custom React hooks (input, audio, game loop)
├── physics/                # Physics architecture and wrappers
│   ├── PhysicsWorld.tsx    # Configured Rapier Physics container with Suspense
│   └── index.ts            # Physics exports & hooks (useRapier, RigidBody)
├── systems/                # Core systems (audio manager, time of day, input)
├── types/                  # TypeScript interfaces and domain models
│   ├── cat.ts              # Cat behavior states and entities
│   ├── physics.ts          # Physics configuration and collision groups
│   ├── world.ts            # World settings and terrain bounds
│   └── index.ts            # Unified type exports
├── utils/                  # Math, coordinate conversion, and helper utilities
│   ├── math.ts             # Math helpers (degToRad, clamp)
│   └── index.ts
├── world/                  # 3D Environment systems
│   ├── architecture/       # Shrine buildings, torii gates, lanterns, bridges
│   ├── environment/        # Sky, lighting, fog, day/night cycle
│   ├── terrain/            # Ground mesh, stones, gravel paths
│   ├── vegetation/         # Cherry blossoms, bamboo, moss, foliage
│   └── water/              # Ponds, streams, reflection shaders
├── App.tsx                 # Root application component with status HUD
├── index.css               # Global Tailwind CSS and canvas layout styles
└── main.tsx                # React DOM root entry point
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+ (tested on npm v11)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The Vite dev server will launch at:
```
http://localhost:5173/
```

### 3. Build for Production

```bash
npm run build
```

Build artifacts will be emitted to `dist/`.

### 4. Preview Production Build

```bash
npm run preview
```

---

## Verification & Architecture Notes

### WebGL & R3F Rendering
- R3F `Canvas` configured in `src/components/Scene.tsx` with shadow mapping, responsive DPR `[1, 2]`, and Drei `OrbitControls` for smooth scene inspection.
- Ground reference grid is rendered via Drei `<Grid>` to assist coordinate alignment during world building.

### Rapier Physics Integration
- Rapier 3D WebAssembly physics is managed by `<PhysicsWorld>` in `src/physics/PhysicsWorld.tsx`.
- Because Rapier loads its WebAssembly binary asynchronously, it is safely enclosed within React `<Suspense>` boundaries.
- Collision filtering bitmasks are declared in `src/types/physics.ts` (`CollisionGroups`) for clean separation between terrain, architecture, and cats.
- A minimal dynamic physics cube falls under gravity onto a static platform to verify simulation stepping in real time.

### Extension Points for World & Cat Implementation
- **Shrine & Environment**: Build modules inside `src/world/` (`architecture/`, `environment/`, `terrain/`, `vegetation/`, `water/`).
- **Cat AI & Models**: Add models and behaviors inside `src/cats/` using the type definitions in `src/types/cat.ts`.
- **Global Systems**: Implement time-of-day or interaction controllers inside `src/systems/`.
