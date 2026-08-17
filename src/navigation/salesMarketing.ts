import {
  BarChart3, BriefcaseBusiness, FileText, Handshake, HeartHandshake, Home,
  Megaphone, Radio, Settings, ShoppingCart, Target, Users, Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { ExpandedRailItem } from './types';

export interface SalesMarketingNavigationArea {
  id: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  routes: readonly string[];
  groups: readonly { label: string; routes: readonly string[] }[];
}

const groups = (label: string, routes: readonly string[]) => [{ label, routes }] as const;

export const SALES_MARKETING_NAVIGATION_AREAS: readonly SalesMarketingNavigationArea[] = [
  { id: 'home', label: 'Home', shortLabel: 'Home', icon: Home, routes: ['My Work', 'Team View', 'Client View', 'Alerts', 'Approvals', 'Master Calendar'], groups: groups('Workspace', ['My Work', 'Team View', 'Client View', 'Alerts', 'Approvals', 'Master Calendar']) },
  { id: 'strategy', label: 'Strategy & Planning', shortLabel: 'Strategy', icon: Target, routes: ['Research', 'ICPs & Personas', 'Positioning', 'Product/Offer Strategy', 'Annual & Quarterly Plans', 'GTM Plans', 'Targets', 'KPIs', 'Budgets'], groups: [
    { label: 'Insights & Audience', routes: ['Research', 'ICPs & Personas'] },
    { label: 'Market Direction', routes: ['Positioning', 'Product/Offer Strategy'] },
    { label: 'Plans', routes: ['Annual & Quarterly Plans', 'GTM Plans'] },
    { label: 'Performance & Resources', routes: ['Targets', 'KPIs', 'Budgets'] },
  ] },
  { id: 'crm', label: 'CRM & Accounts', shortLabel: 'CRM', icon: Users, routes: ['Leads', 'Contacts', 'Accounts', 'Lead Capture', 'Scoring', 'Routing', 'Enrichment', 'Lists', 'Segments', 'Activity History'], groups: groups('Accounts & relationships', ['Leads', 'Contacts', 'Accounts', 'Lead Capture', 'Scoring', 'Routing', 'Enrichment', 'Lists', 'Segments', 'Activity History']) },
  { id: 'sales-execution', label: 'Sales Execution', shortLabel: 'Sales', icon: BriefcaseBusiness, routes: ['Prospecting', 'Inbox', 'Sequences', 'Calls', 'Meetings', 'Pipeline', 'Opportunities', 'Account Plans', 'Pricing', 'Quotes', 'Proposals', 'Tenders', 'Contracts', 'E-signature', 'Forecasts', 'Quotas', 'Commissions', 'Handoffs'], groups: groups('Commercial workflow', ['Prospecting', 'Inbox', 'Sequences', 'Calls', 'Meetings', 'Pipeline', 'Opportunities', 'Account Plans', 'Pricing', 'Quotes', 'Proposals', 'Tenders', 'Contracts', 'E-signature', 'Forecasts', 'Quotas', 'Commissions', 'Handoffs']) },
  { id: 'campaigns', label: 'Campaigns', shortLabel: 'Campaigns', icon: Megaphone, routes: ['Campaign Portfolio', 'Briefs', 'Calendar', 'Audiences', 'Offers', 'Channels', 'Timelines', 'Dependencies', 'Budgets', 'Experiments', 'Retrospectives'], groups: groups('Campaign management', ['Campaign Portfolio', 'Briefs', 'Calendar', 'Audiences', 'Offers', 'Channels', 'Timelines', 'Dependencies', 'Budgets', 'Experiments', 'Retrospectives']) },
  { id: 'content-social', label: 'Content & Social', shortLabel: 'Content', icon: FileText, routes: ['Overview', 'Planning & Briefs', 'Production Pipeline', 'Content Calendar', 'Approvals', 'Asset Library', 'Social Publisher', 'Community Inbox', 'Social Listening', 'Performance', 'Module Settings'], groups: groups('Content operations', ['Overview', 'Planning & Briefs', 'Production Pipeline', 'Content Calendar', 'Approvals', 'Asset Library', 'Social Publisher', 'Community Inbox', 'Social Listening', 'Performance', 'Module Settings']) },
  { id: 'paid-media', label: 'Paid Media', shortLabel: 'Paid Media', icon: Radio, routes: ['Media Plans', 'Campaigns', 'Audiences', 'Ads', 'Creative Testing', 'Budgets', 'Pacing', 'Optimisation', 'Conversion Tracking', 'Performance'], groups: groups('Media operations', ['Media Plans', 'Campaigns', 'Audiences', 'Ads', 'Creative Testing', 'Budgets', 'Pacing', 'Optimisation', 'Conversion Tracking', 'Performance']) },
  { id: 'lifecycle', label: 'Lifecycle & Customer Growth', shortLabel: 'Lifecycle', icon: HeartHandshake, routes: ['Customer Profiles', 'Email', 'SMS', 'WhatsApp', 'Journeys', 'Automation', 'Consent', 'Deliverability', 'Onboarding', 'Support', 'Reviews', 'Loyalty', 'Referrals', 'Customer Health', 'Renewals', 'Upselling'], groups: groups('Customer lifecycle', ['Customer Profiles', 'Email', 'SMS', 'WhatsApp', 'Journeys', 'Automation', 'Consent', 'Deliverability', 'Onboarding', 'Support', 'Reviews', 'Loyalty', 'Referrals', 'Customer Health', 'Renewals', 'Upselling']) },
  { id: 'commerce', label: 'Commerce & Conversion', shortLabel: 'Commerce', icon: ShoppingCart, routes: ['Products', 'Catalogue', 'Offers', 'Promotions', 'Landing Pages', 'Forms', 'Funnels', 'Storefronts', 'Merchandising', 'Marketplaces', 'Feed Health', 'SEO/GEO', 'CRO', 'Order Signals'], groups: groups('Conversion operations', ['Products', 'Catalogue', 'Offers', 'Promotions', 'Landing Pages', 'Forms', 'Funnels', 'Storefronts', 'Merchandising', 'Marketplaces', 'Feed Health', 'SEO/GEO', 'CRO', 'Order Signals']) },
  { id: 'partnerships', label: 'Creators & Partnerships', shortLabel: 'Partners', icon: Handshake, routes: ['Creator Discovery', 'Outreach', 'Negotiation', 'Influencers', 'UGC', 'Sponsorships', 'Affiliates', 'Channel Partners', 'PR & Media', 'Events', 'Agreements', 'Rights', 'Deliverables', 'Commissions', 'Payouts', 'Performance'], groups: groups('Partner operations', ['Creator Discovery', 'Outreach', 'Negotiation', 'Influencers', 'UGC', 'Sponsorships', 'Affiliates', 'Channel Partners', 'PR & Media', 'Events', 'Agreements', 'Rights', 'Deliverables', 'Commissions', 'Payouts', 'Performance']) },
  { id: 'analytics', label: 'Analytics & Intelligence', shortLabel: 'Analytics', icon: BarChart3, routes: ['Sales Analytics', 'Marketing Analytics', 'Campaign Analytics', 'Content Analytics', 'Paid Media Analytics', 'Partnership Analytics', 'Customer Analytics', 'Attribution', 'ROI', 'LTV', 'Cohorts', 'Profitability', 'Competitor Intelligence', 'Forecasts', 'Reports', 'Tracking Health'], groups: groups('Measurement & intelligence', ['Sales Analytics', 'Marketing Analytics', 'Campaign Analytics', 'Content Analytics', 'Paid Media Analytics', 'Partnership Analytics', 'Customer Analytics', 'Attribution', 'ROI', 'LTV', 'Cohorts', 'Profitability', 'Competitor Intelligence', 'Forecasts', 'Reports', 'Tracking Health']) },
  { id: 'commercial-ops', label: 'Commercial Operations', shortLabel: 'Operations', icon: Workflow, routes: ['Clients & Brands', 'Onboarding', 'Service Scopes', 'Requests', 'Projects', 'Tasks', 'Workload', 'Deliverables', 'SLAs', 'QA', 'Central Approvals', 'Time', 'Costs', 'Client Reporting', 'Profitability', 'SOPs'], groups: groups('Delivery & controls', ['Clients & Brands', 'Onboarding', 'Service Scopes', 'Requests', 'Projects', 'Tasks', 'Workload', 'Deliverables', 'SLAs', 'QA', 'Central Approvals', 'Time', 'Costs', 'Client Reporting', 'Profitability', 'SOPs']) },
  { id: 'settings', label: 'Settings & Governance', shortLabel: 'Settings', icon: Settings, routes: ['Users', 'Roles', 'Permissions', 'Integrations', 'Workflow Automation', 'Fields', 'Taxonomies', 'Claims Rules', 'Consent', 'Privacy', 'Notifications', 'Audit', 'Security'], groups: groups('Administration & governance', ['Users', 'Roles', 'Permissions', 'Integrations', 'Workflow Automation', 'Fields', 'Taxonomies', 'Claims Rules', 'Consent', 'Privacy', 'Notifications', 'Audit', 'Security']) },
];

export const SALES_MARKETING_RAIL_ITEMS: readonly ExpandedRailItem[] = SALES_MARKETING_NAVIGATION_AREAS.map((area) => ({
  id: area.id,
  label: area.label,
  icon: area.icon,
  children: area.routes.map((route) => ({ id: route, label: route })),
}));
