import * as React from 'react';

export interface TutorFABProps {
  /**
   * [ds-extract seam] Replaces useTutorStore((s) => s.openDrawer).
   * Fired on tap. In the app it opens the AI-tutor drawer.
   */
  onClick?: () => void;
  /**
   * [ds-extract seam] Replaces useKeyboardOpen() (MathLive virtual-keyboard
   * global signal). true fades the FAB out (opacity 0, pointer-events none).
   * @default false
   */
  kbOpen?: boolean;
  /**
   * [ds-extract seam] Replaces getStackOffset('bl', 'tutor-fab').bottom
   * (BASE 20 + slot index 0 × STACK_STEP 72 = 20).
   * @default 20
   */
  bottom?: number;
  /**
   * [ds-extract seam] Replaces getStackOffset('bl', 'tutor-fab').left (BASE 20).
   * @default 20
   */
  left?: number;
}

export declare function TutorFAB(props: TutorFABProps): React.ReactElement;
