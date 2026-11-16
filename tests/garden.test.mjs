import assert from 'node:assert/strict'
import { test } from 'node:test'
import RAPIER from '@dimforge/rapier3d-compat'
import { Euler, Quaternion } from 'three'
import { GardenLife } from '../src/cats/ai/GardenLife.ts'
import { CAT_SPACING, clearLine, distance } from '../src/cats/ai/navigation.ts'
import { BRIDGE, QUIET, SIGHTS, surfaceHeight } from '../src/world/layout.ts'
import { walkable } from '../src/world/obstacles.ts'
import { gardenCollisionLayout } from '../src/physics/collisionLayout.ts'
import { GardenToys, TOY_MASS, TOY_RADIUS, toyStarts } from '../src/physics/toys.ts'
import { CollisionGroups as G } from '../src/types/physics.ts'

test('all destinations are connected and swept paths clear obstacles', () => {
  const { nav } = new GardenLife()
  for (const source of [...SIGHTS, ...QUIET]) {
    assert.ok(walkable(...source), 'Unwalkable destination ' + source)
    for (const target of [...SIGHTS, ...QUIET]) {
      const path = nav.route(source, target)
      assert.ok(path.length && distance(path.at(-1), target) < 0.001)
      let from = source
      for (const to of path) {
        assert.ok(clearLine(from, to))
        from = to
      }
    }
  }
  assert.ok(surfaceHeight(BRIDGE.x, BRIDGE.z) > 0.6)
  assert.equal(walkable(BRIDGE.x, BRIDGE.z + 1.2), false)
  const block = [-2.7, 4.1],
    from = [-2.7, 6.25],
    to = [-2.7, 2.55]
  const detour = nav.route(from, to, [block])
  assert.ok(detour.length > 1)
  let p = from
  for (const next of detour) {
    assert.ok(clearLine(p, next, [block]))
    p = next
  }
})

test('independent residents stay on land, yield to peers and use all active behaviors', () => {
  const seen = new Set()
  for (const seed of [66, 2026]) {
    const life = new GardenLife(seed),
      travel = life.cats.map(() => 0)
    const toys = { locations: toyStarts.map(([x, z]) => ({ x, z })), swat() {} }
    for (let frame = 0; frame < 60 * 240; frame++) {
      const before = life.cats.map((c) => [c.x, c.z])
      life.tick(1 / 60, toys)
      life.cats.forEach((c, i) => {
        seen.add(c.state)
        travel[i] += distance(before[i], [c.x, c.z])
        assert.ok(walkable(c.x, c.z), c.profile.id + ' entered an obstacle')
        for (const other of life.cats.slice(0, i))
          assert.ok(Math.hypot(c.x - other.x, c.z - other.z) >= CAT_SPACING - 0.0001)
      })
    }
    assert.ok(travel.every((length) => length > 2))
    life.pet(0)
    assert.equal(life.cats[0].state, 'interacting')
  }
  for (const state of [
    'idle',
    'walking',
    'running',
    'sitting',
    'sleeping',
    'playing',
    'following',
    'interacting',
    'roaming',
    'exploring',
  ])
    assert.ok(seen.has(state), state)
})

test('Rapier settles and contains toys, handles cat swats and recovers a lost ball', async () => {
  await RAPIER.init()
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 })
  try {
    const ground = world.createRigidBody(RAPIER.RigidBodyDesc.fixed())
    for (const c of gardenCollisionLayout()) {
      const shape =
        c.kind === 'box'
          ? RAPIER.ColliderDesc.cuboid(...c.args)
          : RAPIER.ColliderDesc.cylinder(...c.args)
      const rotation = new Quaternion().setFromEuler(new Euler(...c.rotation))
      world.createCollider(
        shape
          .setTranslation(...c.at)
          .setRotation(rotation)
          .setCollisionGroups(c.mask),
        ground,
      )
    }
    const life = new GardenLife(),
      toys = new GardenToys()
    const actors = life.cats.map((c) => {
      const b = world.createRigidBody(
        RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
          c.x,
          c.y + 0.36 * c.profile.size,
          c.z,
        ),
      )
      world.createCollider(
        RAPIER.ColliderDesc.ball(0.33 * c.profile.size).setCollisionGroups(
          (G.CATS << 16) | G.INTERACTABLES,
        ),
        b,
      )
      return b
    })
    toyStarts.forEach(([x, z], i) => {
      const b = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(x, 1.5, z)
          .setLinearDamping(0.72)
          .setAngularDamping(1.05)
          .setCcdEnabled(true),
      )
      world.createCollider(
        RAPIER.ColliderDesc.ball(TOY_RADIUS)
          .setMass(TOY_MASS)
          .setRestitution(0.42)
          .setFriction(0.72)
          .setCollisionGroups(
            (G.INTERACTABLES << 16) | G.CATS | G.TERRAIN | G.ARCHITECTURE | G.INTERACTABLES,
          ),
        b,
      )
      toys.register(i, b)
    })
    for (let i = 0; i < 240; i++) world.step()
    assert.ok(Math.abs(toys.bodies[0].translation().y - TOY_RADIUS) < 0.01)
    const x = toys.bodies[0].translation().x
    toys.swat(0, 1, 0)
    for (let i = 0; i < 20; i++) {
      world.step()
      toys.sync(1 / 60)
    }
    assert.ok(toys.locations[0].x > x + 0.1)
    let swats = 0
    const actions = {
      locations: toys.locations,
      swat(i, dx, dz) {
        swats++
        toys.swat(i, dx, dz)
      },
    }
    for (let i = 0; i < 60 * 300; i++) {
      toys.sync(1 / 60)
      life.tick(1 / 60, actions)
      life.cats.forEach((c, i) =>
        actors[i].setNextKinematicTranslation({ x: c.x, y: c.y + 0.36 * c.profile.size, z: c.z }),
      )
      world.step()
      for (const body of toys.bodies) {
        const { x, y, z } = body.translation()
        assert.ok(Math.max(Math.abs(x), Math.abs(z)) < 8 && y > 0.15)
      }
    }
    assert.ok(swats > 0, 'Residents never reached a physical toy')
    toys.bodies[0].setTranslation({ x: 9, y: -2, z: 0 }, true)
    toys.sync(1 / 60)
    assert.deepEqual(toys.locations[0], { x: toyStarts[0][0], z: toyStarts[0][1] })
  } finally {
    world.free()
  }
})
