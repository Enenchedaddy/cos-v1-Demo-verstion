/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Milestone, ShieldCheck, Map, Layers, FileCode, Search, ClipboardList, 
  HelpCircle, ArrowRight, CheckCircle, Info, Sparkles, AlertCircle, Copy
} from 'lucide-react';

export default function RoadmapSpecs() {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'permissions' | 'workflows' | 'datamodel' | 'prompts'>('roadmap');
  const [searchQuery, setSearchQuery] = useState('');

  // Prompt Pack Data
  const prompts = [
    { id: 'M01', type: 'Management', screen: 'CEO Dashboard', prompt: 'CEO dashboard with revenue, margins, orders, overdue invoices, customer risk, inventory risk and approval queue.' },
    { id: 'M02', type: 'Management', screen: 'Company Performance Dashboard', prompt: 'Company performance dashboard with revenue target, gross/net margin waterfalls and scorecards.' },
    { id: 'M03', type: 'Management', screen: 'Sales Performance Dashboard', prompt: 'Sales dashboard with rep leaderboard, revenue, margin, pipeline, coaching actions and approval alerts.' },
    { id: 'M04', type: 'Management', screen: 'Marketing Performance Dashboard', prompt: 'Marketing performance dashboard with ROI, CAC, funnel, campaign table and budget recommendations.' },
    { id: 'M05', type: 'Management', screen: 'Customer Performance Dashboard', prompt: 'Customer performance dashboard with top/bottom customers, dormant accounts, cohort table and reorder signals.' },
    { id: 'M06', type: 'Management', screen: 'Customer Account Intelligence', prompt: 'Customer account intelligence page with purchase history, profitability, invoices, complaints, cylinders and risk score.' },
    { id: 'M07', type: 'Management', screen: 'Product Performance Dashboard', prompt: 'Product performance dashboard with gas product table, margin, demand forecast, complaints and price actions.' },
    { id: 'M08', type: 'Management', screen: 'Order Dashboard', prompt: 'Order dashboard with lifecycle stages, order table, selected order drawer and approve/release button.' },
    { id: 'M09', type: 'Management', screen: 'Finance and Cash Collection Dashboard', prompt: 'Finance and cash collection dashboard with aged debt, collection tasks, payment promises and order release drawer.' },
    { id: 'M10', type: 'Management', screen: 'Inventory Dashboard', prompt: 'Inventory dashboard with stock by gas product, days cover, demand forecast, warehouse heatmap and stock alerts.' },
    { id: 'M11', type: 'Management', screen: 'Cylinder Tracking Dashboard', prompt: 'Cylinder tracking dashboard with cylinder counts, overdue return queue, risk levels and collection actions.' },
    { id: 'M12', type: 'Management', screen: 'Operations Dashboard', prompt: 'Operations dashboard with fulfilment workflow, bottleneck table, warehouse tasks and exception feed.' },
    { id: 'M13', type: 'Management', screen: 'Delivery Performance Dashboard', prompt: 'Delivery performance dashboard with route table, map, delivery detail drawer and delay alerts.' },
    { id: 'M14', type: 'Management', screen: 'Team Performance Dashboard', prompt: 'Team performance dashboard with team leaderboard, workload by role, bottleneck alerts and coaching actions.' },
    { id: 'M15', type: 'Management', screen: 'Sales Rep Scorecard', prompt: 'Sales rep scorecard with profile, grade, KPIs, trend charts, coaching notes and next 1:1 action.' },
    { id: 'M16', type: 'Management', screen: 'Risk and Exceptions Dashboard', prompt: 'Risk and exceptions dashboard with KPI risk cards, exception feed, heatmap and escalation actions.' },
    { id: 'M17', type: 'Management', screen: 'Approval Centre', prompt: 'Approval centre with pending approvals table, margin impact, credit risk warning and approve/reject buttons.' },
    { id: 'M18', type: 'Management', screen: 'Reports Centre', prompt: 'Reports centre with report library, scheduled reports and right-side report builder/export options.' },
    { id: 'M19', type: 'Management', screen: 'User Access Control', prompt: 'User access page with platform tags, role matrix, access request queue, restricted action log and audit events.' },
    { id: 'M20', type: 'Management', screen: 'Audit Logs', prompt: 'Audit logs screen with action table, filters, event detail drawer and export audit report button.' },
    { id: 'C01', type: 'Customer', screen: 'Secure Login', prompt: 'Customer login page with SSO, MFA code, account selector and security notice.' },
    { id: 'C02', type: 'Customer', screen: 'Home Dashboard', prompt: 'Customer home dashboard with quick reorder cards, open orders, invoices, cylinders, deliveries, tickets and notifications.' },
    { id: 'C03', type: 'Customer', screen: 'My Account', prompt: 'Customer My Account page with company profile, addresses, credit limit, contacts, safety certificates and documents.' },
    { id: 'C04', type: 'Customer', screen: 'Product Catalogue', prompt: 'Customer product catalogue with gas type filters, bottle size selector, agreed pricing and cart drawer.' },
    { id: 'C05', type: 'Customer', screen: 'Agreed Pricing', prompt: 'Customer agreed pricing page with contract summary, product price table, filters and confidential pricing notice.' },
    { id: 'C06', type: 'Customer', screen: 'Place Order', prompt: 'Customer order page showing gas selection, quantities, agreed prices, delivery/collection and credit hold warning.' },
    { id: 'C07', type: 'Customer', screen: 'Reorder Previous Items', prompt: 'Customer reorder page with previous orders table, saved templates, recommended items and reorder basket.' },
    { id: 'C08', type: 'Customer', screen: 'Order History and Status Tracking', prompt: 'Customer order history page with status table, selected order drawer, order timeline and invoice download.' },
    { id: 'C09', type: 'Customer', screen: 'Delivery Tracking', prompt: 'Customer delivery tracking page with ETA, delivery timeline, route map, driver details and support button.' },
    { id: 'C10', type: 'Customer', screen: 'Cylinder Balance and Return Request', prompt: 'Customer cylinder balance page with balances by gas and size, overdue returns, collection request form and movement table.' },
    { id: 'C11', type: 'Customer', screen: 'Invoices and Payments', prompt: 'Customer invoices and payments page with overdue alert, invoice table, pay now buttons and payment confirmation modal.' },
    { id: 'C12', type: 'Customer', screen: 'Account Statement', prompt: 'Customer account statement page with opening/closing balance, ageing summary, activity table and export buttons.' },
    { id: 'C13', type: 'Customer', screen: 'Support Tickets and Special Requests', prompt: 'Customer support tickets page with ticket table, create ticket form, upload area, SLA timeline and knowledge suggestions.' },
    { id: 'C14', type: 'Customer', screen: 'Recurring Orders', prompt: 'Customer recurring orders page with scheduled order table, create recurring form, reminders and calendar.' },
    { id: 'C15', type: 'Customer', screen: 'Company Users and Permissions', prompt: 'Customer company users and permissions page with role table, invite modal, permission drawer and audit trail.' },
    { id: 'C16', type: 'Customer', screen: 'Notifications and Help Centre', prompt: 'Customer notifications and help centre with preference toggles, alert feed, help article search and support CTA.' }
  ];

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
      {/* Sub Header / Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Specs & Docs
          </span>
          <h1 className="text-xl font-bold text-gray-900 font-sans tracking-tight">V1 Blueprint Explorer</h1>
        </div>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'roadmap', label: 'Build Roadmap' },
            { id: 'matrix', label: 'Role & Permissions Matrix' },
            { id: 'workflows', label: 'Workflow Library' },
            { id: 'prompts', label: 'SaaS Prompt Pack' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === tab.id ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* ROADMAP SECTION */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-xl text-white shadow-md">
              <h2 className="text-lg font-semibold">V1 Product Plan & Implementation Phasing</h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                The COS implementation sequence prioritizes shared data foundations and end-to-end loops before diving into platform-specific optimization. Follow the phased timeline below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Phase 0 */}
              <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-xs space-y-3">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Phase 0</span>
                  <span className="text-xs text-blue-600 font-semibold">Spine Foundation</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Data Spine & Security</h3>
                <ul className="space-y-2 text-xs text-gray-600 list-disc list-inside">
                  <li>Platform selector and main navigation shells</li>
                  <li>Unified tables: customers, products, prices, orders, invoices, cylinder assets</li>
                  <li>Granular role-scope logic and audit logging service</li>
                  <li>Integration pipeline maps and migration matrices</li>
                </ul>
              </div>

              {/* Phase 1 */}
              <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-xs space-y-3">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Phase 1</span>
                  <span className="text-xs text-blue-600 font-semibold">Commercial MVP</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Transactions & CRM</h3>
                <ul className="space-y-2 text-xs text-gray-600 list-disc list-inside">
                  <li>Sales & Marketing CRM, Pipelines, & Quotes overrides</li>
                  <li>Customer Login, Catalogues, Place Orders, Statements</li>
                  <li>Order-to-cash workflow pipelines & auto notifications</li>
                  <li>Standard dashboards: CEO, Orders, Inventory, Finance</li>
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-xs space-y-3">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Phase 2</span>
                  <span className="text-xs text-blue-600 font-semibold">Management Depth</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Operational Control</h3>
                <ul className="space-y-2 text-xs text-gray-600 list-disc list-inside">
                  <li>Newcastle & Sydney depot operations dashboards</li>
                  <li>Approval Centre with discount thresholds & credit blocks</li>
                  <li>Cash collection worklist & return automation rules</li>
                  <li>Governance boards, SOX reports, and PDF packs</li>
                </ul>
              </div>

            </div>

            {/* Quality Gates */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-1.5">
                <ShieldCheck size={16} className="text-blue-600" />
                <span>Non-Negotiable Quality Gates</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                  <span className="font-bold text-gray-900 block">Strict Data Isolation</span>
                  <p>Customer portal acts only as a restricted view of their company record. Customer users never see internal CRM notes or group margins.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                  <span className="font-bold text-gray-900 block">Transaction Veracity</span>
                  <p>Gas agreed pricing, list prices, and delivery schedules must come directly from the engine. Direct manual typing of portal prices is forbidden.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                  <span className="font-bold text-gray-900 block">SOX Compliance Audits</span>
                  <p>All sensitive overrides (credit hold releases, quote discount overrides) must write immutably to the audit logs before execution completes.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ROLES & PERMISSIONS */}
        {activeTab === 'finance' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-5 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">Platform Role Matrix</h3>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-semibold">
                    <th className="py-2">Role</th>
                    <th className="py-2">Target Platforms</th>
                    <th className="py-2">Authorized Actions</th>
                    <th className="py-2 text-red-500">Restricted Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 leading-normal">
                  {[
                    { role: 'Sales rep', platforms: 'S&M Platform', auth: 'Create deals, send quotes, log activities', rest: 'Cannot see company-wide margins, internal financial reports, or override discount policies (>15%)' },
                    { role: 'Marketing user', platforms: 'S&M Platform', auth: 'Create campaigns, upload creatives, track ROI', rest: 'Cannot approve credit holds, edit product catalog, or see customer invoice ledgers' },
                    { role: 'Manager / Leadership', platforms: 'Management Platform', auth: 'Approve overrides, view gross/net margin waterfalls, investigate exception feeds', rest: 'Customer portal access is not automatic; can only view data through Management' },
                    { role: 'Finance manager', platforms: 'Management Platform', auth: 'Put accounts on credit hold, release override blocks, manage collections', rest: 'Cannot modify campaigns, edit sales rep notes, or modify customer agreed contracts' },
                    { role: 'Customer company admin', platforms: 'Customer Platform', auth: 'Place orders, pay invoices, invite buyers, set spending thresholds', rest: 'Cannot view internal CRM, group margins, or audit logs' }
                  ].map((matrix, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-3 font-bold text-gray-900">{matrix.role}</td>
                      <td className="py-3 font-semibold text-blue-600">{matrix.platforms}</td>
                      <td className="py-3 text-green-700">{matrix.auth}</td>
                      <td className="py-3 text-red-600">{matrix.rest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: WORKFLOWS */}
        {activeTab === 'workflows' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-5 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">Cross-Platform Workflow Triggers</h3>
            <div className="space-y-4">
              {[
                { event: 'Customer Order Submitted', origin: 'Customer Platform', data: 'Creates order record, customer portal activity logs, updates inventory demands & dispatch workloads.', outputs: 'Fires sales signal task, updates management dashboards, dispatches customer email notification.' },
                { event: 'Credit Hold Enforcement', origin: 'Shared Automations', data: 'Overdue invoice > 30 days triggers Credit Hold status on Customer Profile.', outputs: 'Blicks customer checkout in portal, routes order overrides directly to the Finance Approval Centre.' },
                { event: 'Cylinder Overdue Return', origin: 'Management Platform', data: 'Checks days held on site > 90 days. Sets risk rating on account.', outputs: 'Creates collections demand task in S&M, logs exception in risk feed, sends customer return reminder.' },
                { event: 'Discount Limit Triggered', origin: 'S&M Platform', data: 'Quote builder discount override set to >15.0%. Policy margin violation flagged.', outputs: 'Locks quote status in Pending, routes exception override task directly to Manager Approval Centre.' }
              ].map((flow, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Event Trigger</span>
                    <span className="font-bold text-blue-600 block mt-0.5">{flow.event}</span>
                    <span className="text-gray-500 font-mono text-[10px]">Origin: {flow.origin}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Shared Data Written</span>
                    <p className="text-gray-700 mt-1 leading-normal">{flow.data}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold text-indigo-500">Downstream Outputs</span>
                    <p className="text-gray-600 mt-1 leading-normal">{flow.outputs}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: IMAGE GENERATION PROMPTS */}
        {activeTab === 'prompts' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Image-Generation SaaS UI Prompt Pack</h3>
                <p className="text-xs text-gray-400 mt-0.5">SOX/Design guidelines recommend using these exact structured prompt presets to generate matching high-fidelity visuals if the deck needs a refresh.</p>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search prompts (e.g. CEO)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prompts
                .filter(p => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    p.id.toLowerCase().includes(query) ||
                    p.screen.toLowerCase().includes(query) ||
                    p.prompt.toLowerCase().includes(query)
                  );
                })
                .map((p) => (
                  <div key={p.id} className="bg-white p-4 border border-gray-200 rounded-xl shadow-xs space-y-2 text-xs flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{p.id}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">{p.type} View</span>
                      </div>
                      <h4 className="font-bold text-gray-900">{p.screen}</h4>
                      <p className="text-gray-600 leading-normal bg-gray-50 p-2.5 rounded border border-gray-100 font-mono text-[11px] select-all">
                        {p.prompt}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(p.prompt);
                        alert(`Prompt copied successfully! Use this in Midjourney/DallE to generate exact ${p.screen} layouts.`);
                      }}
                      className="mt-3 bg-gray-100 hover:bg-gray-200 hover:text-blue-600 text-gray-600 transition py-1 rounded text-[10px] font-bold text-center flex items-center justify-center space-x-1"
                    >
                      <Copy size={12} />
                      <span>Copy Preset Prompt</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
