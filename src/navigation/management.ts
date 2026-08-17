import { Activity, AlertCircle, BarChart2, Briefcase, Settings, Shield, Sliders, Users } from 'lucide-react';
import type { ExpandedRailItem } from './types';

export const MANAGEMENT_RAIL_AREAS: readonly ExpandedRailItem[] = [
  { id: 'home', label: 'Command Home', icon: Activity, children: [
    { id: 'functional', label: 'Functional Home' }, { id: 'company', label: 'Company Home' }, { id: 'ceo', label: 'Main CEO Dashboard' },
  ] },
  { id: 'performance', label: 'Performance & Business Units', icon: BarChart2, children: [
    { id: 'bu', label: 'Overview & BU matrix' }, { id: 'dictionary', label: 'Metric Dictionary' }, { id: 'reports', label: 'Reports Centre' },
    { id: 'leaderboard', label: 'Team & Leaderboard' }, { id: 'finance', label: 'Finance & Cash' }, { id: 'inventory', label: 'Inventory / Stock' },
  ] },
  { id: 'governance', label: 'Governance & Audit', icon: Shield, children: [
    { id: 'policy', label: 'Approval Policy' }, { id: 'console', label: 'Governance Console' }, { id: 'access', label: 'Access & Elevation' }, { id: 'oversight', label: 'AI Oversight Control' },
  ] },
  { id: 'strategy', label: 'Strategy & Planning', icon: Sliders, children: [
    { id: 'goals', label: 'OKRs & Goals' }, { id: 'strategy-map', label: 'Strategy map' }, { id: 'meetings', label: 'Meetings & Cadence' }, { id: 'budgets', label: 'Budgets & Scenario' },
  ] },
  { id: 'organisation', label: 'Organisation & Headcount', icon: Users, children: [
    { id: 'org-chart', label: 'Org Chart' }, { id: 'plan-role', label: 'Plan / Role map' },
  ] },
  { id: 'acquisitions', label: 'M&A Acquisitions', icon: Briefcase, children: [
    { id: 'pipeline', label: 'M&A Pipeline Board' }, { id: 'day-100', label: 'Day-100 Workspace' },
  ] },
  { id: 'alerts', label: 'Alerts & Policies', icon: AlertCircle, children: [
    { id: 'rules', label: 'Notification Rules' }, { id: 'knowledge', label: 'Policy Hub & SOP' }, { id: 'feed', label: 'Announcements Feed' },
  ] },
  { id: 'group-admin', label: 'Entity Registry', icon: Settings, children: [
    { id: 'registry', label: 'Legal Registry' }, { id: 'profile', label: 'Capability Profiles' }, { id: 'evidence', label: 'Transfer-pricing' },
    { id: 'offtake', label: 'Offtake-contract' }, { id: 'hub', label: 'Intercompany Hub' },
  ] },
];
