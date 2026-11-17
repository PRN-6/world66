import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  WORLDS,
  getWorldByIndex,
  getNextWorldIndex,
  getPreviousWorldIndex,
  findWorldById,
} from '../src/worlds/registry.ts'
import { CatShrineAdapter } from '../src/worlds/adapters/CatShrineAdapter.ts'
import { RobotConstructionAdapter } from '../src/worlds/adapters/RobotConstructionAdapter.ts'

test('world registry contains Cat Shrine (01) and Robot Construction (02)', () => {
  assert.equal(WORLDS.length, 2, 'Should have exactly two worlds in the collection')

  const [world1, world2] = WORLDS

  // World 01 — Cat Shrine
  assert.equal(world1.id, 'cat-shrine')
  assert.equal(world1.number, '01')
  assert.equal(world1.title, 'Cat Shrine')
  assert.equal(typeof world1.component, 'function')
  assert.ok(world1.buttonTheme.bg.length > 0)
  assert.ok(world1.buttonTheme.arrowColor.length > 0)

  // World 02 — Robot Construction World
  assert.equal(world2.id, 'robot-construction')
  assert.equal(world2.number, '02')
  assert.equal(world2.title, 'Robot Construction World')
  assert.equal(typeof world2.component, 'function')
  assert.ok(world2.buttonTheme.bg.length > 0)
  assert.ok(world2.buttonTheme.arrowColor.length > 0)
})

test('world lookup by index works correctly with wrap-around', () => {
  assert.equal(getWorldByIndex(0).id, 'cat-shrine')
  assert.equal(getWorldByIndex(1).id, 'robot-construction')

  // Wrap around positive
  assert.equal(getWorldByIndex(2).id, 'cat-shrine')
  assert.equal(getWorldByIndex(3).id, 'robot-construction')

  // Wrap around negative
  assert.equal(getWorldByIndex(-1).id, 'robot-construction')
  assert.equal(getWorldByIndex(-2).id, 'cat-shrine')
})

test('arrow navigation switches forward and backward with wrap-around', () => {
  let index = 0 // Initially loads Cat Shrine (World 01)
  assert.equal(getWorldByIndex(index).id, 'cat-shrine')

  // Right arrow: Switch to Robot Construction World (World 02)
  index = getNextWorldIndex(index)
  assert.equal(index, 1)
  assert.equal(getWorldByIndex(index).id, 'robot-construction')

  // Right arrow again: Wrap around back to Cat Shrine (World 01)
  index = getNextWorldIndex(index)
  assert.equal(index, 0)
  assert.equal(getWorldByIndex(index).id, 'cat-shrine')

  // Left arrow: Wrap around back to Robot Construction World (World 02)
  index = getPreviousWorldIndex(index)
  assert.equal(index, 1)
  assert.equal(getWorldByIndex(index).id, 'robot-construction')

  // Left arrow again: Back to Cat Shrine (World 01)
  index = getPreviousWorldIndex(index)
  assert.equal(index, 0)
  assert.equal(getWorldByIndex(index).id, 'cat-shrine')
})

test('adapters are valid callable React component functions', () => {
  assert.equal(typeof CatShrineAdapter, 'function')
  assert.equal(typeof RobotConstructionAdapter, 'function')
})
