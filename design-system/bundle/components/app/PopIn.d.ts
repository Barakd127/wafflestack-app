import * as React from 'react';

export interface PopInProps {
  children: React.ReactNode;
  /** Delay in ms before the spring entrance starts (default 0). */
  delay?: number;
}

/**
 * NOTE: renders a three.js <group>; must be used inside a
 * react-three-fiber <Canvas>.
 */
export declare function PopIn(props: PopInProps): React.ReactElement;
