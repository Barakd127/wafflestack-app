# PopIn

"The Juice" entrance wrapper for 3D buildings (from `src/components/PopIn.tsx`): Townscaper-style elastic "plop" — scales a three.js `<group>` from 0 to 1 with overshoot plus a slight random Y-twist. Must be rendered inside a react-three-fiber `<Canvas>`.

```jsx
<PopIn delay={120}>
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#D4AF37" />
  </mesh>
</PopIn>
```

## Seams

- `[ds-extract]` replaced `@react-spring/three` `useSpring` + `animated.group` with a self-contained `requestAnimationFrame` spring integrator using the identical physics constants (tension 180, friction 12, mass 1, per-mount random twist `Math.random() * 0.2 - 0.1`, `delay` prop) driving a plain `<group>` — visual output unchanged.
- The `import * as THREE from 'three'` (only used for the ref type) was dropped with the type strip.

## CSS classes used

None — 3D component, no DOM classes.
