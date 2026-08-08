import * as React from 'react';

export interface TopBarProps {
  /** Page title shown at the start (right in RTL). Default 'דף הבית'. */
  title?: string;
  /** When provided, renders the ↩ יציאה logout button in the account ribbon. */
  onLogout?: () => void;
  darkMode?: boolean;
  /** When provided, renders the ☾/☀ dark-mode toggle inside the topbar
   *  (per user 2026-05-24). */
  onToggleDark?: () => void;
  /** Nav controls rendered next to the title (e.g. back button, מפה/רשימה toggle). */
  contextControls?: React.ReactNode;
  /** Greeting name. Replaces localStorage.getItem('userName'). Default 'Student'. */
  userName?: string;
  /** XP shown in the התקדמות ribbon. Replaces useLearningStore(s => s.xp). Default 0. */
  xp?: number;
  /** Content of the שיקויים ribbon. Replaces <PotionInventory />. Default null. */
  potionsSlot?: React.ReactNode;
  /** Guided-tours launcher in the account ribbon. Replaces <TourLauncher />. Default null. */
  tourLauncherSlot?: React.ReactNode;
}

/** 70px glass topbar (ws-topbar): title + context controls on the start side,
 *  ribbon strip (XP / potions / account) on the end side, gold hairline via
 *  --sh-topbar-border over --sh-topbar-bg. */
export declare function TopBar(props: TopBarProps): React.ReactElement;
