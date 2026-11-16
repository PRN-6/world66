import { Suspense, type ReactNode } from 'react'
import { Physics, type PhysicsProps } from '@react-three/rapier'

export interface PhysicsWorldProps extends Omit<PhysicsProps, 'children'> {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Scalable physics container wrapping Rapier Physics with Suspense handling
 * for asynchronous WebAssembly initialization.
 */
export function PhysicsWorld({
  children,
  gravity = [0, -9.81, 0],
  fallback = null,
  ...props
}: PhysicsWorldProps) {
  return (
    <Suspense fallback={fallback}>
      <Physics gravity={gravity} {...props}>
        {children}
      </Physics>
    </Suspense>
  )
}

