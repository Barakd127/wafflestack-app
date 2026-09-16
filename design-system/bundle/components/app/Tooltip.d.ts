import * as React from 'react';

export interface TooltipProps {
  label: string;
  description?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Show delay in ms before the tooltip appears (default 400). */
  delay?: number;
  children: React.ReactElement;
}

export declare function Tooltip(props: TooltipProps): React.ReactElement;
