import type { LucideIcon } from 'lucide-react';

/** Shared navigation contract consumed by platform configuration and the sidebar renderer. */
export interface RailArea {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface ExpandedRailChild {
  id: string;
  label: string;
  icon?: LucideIcon;
  children?: readonly ExpandedRailChild[];
}

export interface ExpandedRailItem extends RailArea {
  children?: readonly ExpandedRailChild[];
}
