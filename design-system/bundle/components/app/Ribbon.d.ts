import * as React from 'react';

export interface RibbonProps {
  label: string;
  /** When true, the label heading is hidden (icons only). Per user request
   *  2026-05-24: "שיקויים" and "חשבון" labels removed from the quiz topbar
   *  to reduce visual noise. Label is still passed for aria/title accessibility. */
  hideLabel?: boolean;
  children: React.ReactNode;
}

export declare function Ribbon(props: RibbonProps): React.ReactElement;
