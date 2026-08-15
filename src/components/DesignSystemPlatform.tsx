/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, LayoutGrid, Sparkles, ShieldAlert, Award, FileCode, CheckCircle2,
  Trash2, Send, ChevronRight, HelpCircle, KeyRound, Check, X, Bell, ArrowRight, Download, 
  Plus, ShieldCheck, Database, Activity, Info, Copy, Clock, Search, RefreshCw, Lock, Eye, AlertCircle, Play, Sliders,
  Menu
} from 'lucide-react';
import COSLogo from './COSLogo';

interface DesignSystemPlatformProps {
  onLogoutToGateway: () => void;
}

export default function DesignSystemPlatform({ onLogoutToGateway }: DesignSystemPlatformProps) {
  const [activeSection, setActiveTab] = useState<'cover' | 'brand' | 'type' | 'layout' | 'icons' | 'components' | 'patterns' | 'audit'>('cover');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [density, setDensity] = useState<'comfortable' | 'compact' | 'dense'>('compact');
  
  // Interactive pattern states:
  const [killSwitchHold, setKillSwitchHold] = useState(0); // 0 to 100%
  const [killSwitchPressed, setKillSwitchPressed] = useState(false);
  const [killSwitchTriggered, setKillSwitchTriggered] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showWhyPanel, setShowWhyPanel] = useState(false);
  const [aiClass, setAiClass] = useState<'auto' | 'draft' | 'recommend' | 'gated' | 'blocked'>('recommend');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Toast timer helper:
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 8000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // Kill Switch long press hold simulation (2 seconds = 20 intervals of 100ms)
  useEffect(() => {
    let interval: any;
    if (killSwitchPressed && !killSwitchTriggered) {
      interval = setInterval(() => {
        setKillSwitchHold(prev => {
          if (prev >= 100) {
            setKillSwitchTriggered(true);
            setToastMessage("Governed Kill Switch Activated. Feature 'Automatic Dispatch Engine' is disabled.");
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    } else {
      setKillSwitchHold(prev => {
        if (!killSwitchTriggered) return 0;
        return prev;
      });
    }
    return () => clearInterval(interval);
  }, [killSwitchPressed, killSwitchTriggered]);

  const handleCopy = (token: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  // Color tokens data
  const colors = [
    { name: 'ink', hex: '#15202B', role: 'Primary text and chart anchors' },
    { name: 'cos-navy', hex: '#183153', role: 'Navigation and brand surfaces' },
    { name: 'paper', hex: '#FCFBF7', role: 'Warm application canvas' },
    { name: 'panel', hex: '#FFFFFF', role: 'Focused work surfaces' },
    { name: 'rule', hex: '#D8D6CE', role: 'Dividers and input boundaries' },
    { name: 'signal', hex: '#C84F2A', role: 'Primary action and AI provenance' },
    { name: 'muted', hex: '#5E6872', role: 'Secondary copy and metadata' },
    { name: 'navy-soft', hex: '#DDE6EF', role: 'Information and selection tint' },
    { name: 'signal-soft', hex: '#F7E7DF', role: 'Recommendation and attention tint' },
    { name: 'success', hex: '#246B4A', role: 'Verified and complete' },
    { name: 'warning', hex: '#8A5A12', role: 'At risk and approaching threshold' },
    { name: 'danger', hex: '#A63A32', role: 'Breach and destructive action' }
  ];

  // Icon registry database
  const iconsRegistry = [
    { key: 'dashboard', val: 'layout-dashboard' },
    { key: 'company', val: 'building-2' },
    { key: 'analytics', val: 'chart-no-axes-combined' },
    { key: 'trend', val: 'chart-spline' },
    { key: 'people', val: 'users' },
    { key: 'contact', val: 'contact' },
    { key: 'target', val: 'target' },
    { key: 'route', val: 'route' },
    { key: 'tasks', val: 'list-todo' },
    { key: 'list', val: 'list-filter' },
    { key: 'search', val: 'search' },
    { key: 'command', val: 'command' },
    { key: 'notification', val: 'bell' },
    { key: 'ai', val: 'sparkles' },
    { key: 'copilot', val: 'bot' },
    { key: 'user', val: 'circle-user-round' },
    { key: 'settings', val: 'settings' },
    { key: 'help', val: 'circle-help' },
    { key: 'platform', val: 'grid-3x3' },
    { key: 'menu', val: 'menu' },
    { key: 'next', val: 'chevron-right' },
    { key: 'expand', val: 'chevron-down' },
    { key: 'add', val: 'plus' },
    { key: 'edit', val: 'pencil' },
    { key: 'delete', val: 'trash-2' },
    { key: 'download', val: 'download' },
    { key: 'upload', val: 'upload' },
    { key: 'share', val: 'share-2' },
    { key: 'filter', val: 'filter' },
    { key: 'columns', val: 'columns-3' },
    { key: 'secure', val: 'shield-check' },
    { key: 'risk', val: 'shield-alert' },
    { key: 'approved', val: 'circle-check' },
    { key: 'rejected', val: 'circle-x' },
    { key: 'warning', val: 'triangle-alert' },
    { key: 'status', val: 'circle-dot' },
    { key: 'clock', val: 'clock' },
    { key: 'sla', val: 'hourglass' },
    { key: 'confidence', val: 'badge-check' },
    { key: 'workflow', val: 'workflow' },
    { key: 'branch', val: 'git-branch' },
    { key: 'activity', val: 'activity' },
    { key: 'invoice', val: 'receipt' },
    { key: 'product', val: 'package' },
    { key: 'inventory', val: 'boxes' },
    { key: 'delivery', val: 'truck' },
    { key: 'warehouse', val: 'warehouse' },
    { key: 'manufacturing', val: 'factory' },
    { key: 'marketing', val: 'megaphone' },
    { key: 'send', val: 'send' },
    { key: 'click', val: 'mouse-pointer-click' },
    { key: 'drawer', val: 'panel-right-open' },
    { key: 'collapse', val: 'panel-left-close' },
    { key: 'more', val: 'ellipsis' },
    { key: 'arrow', val: 'move-right' },
    { key: 'undo', val: 'undo-2' },
    { key: 'redo', val: 'redo-2' },
    { key: 'refresh', val: 'refresh-cw' },
    { key: 'loading', val: 'loader-circle' },
    { key: 'info', val: 'info' },
    { key: 'close', val: 'x' },
    { key: 'critical', val: 'octagon-x' }
  ];

  return (
    <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden text-slate-100 font-sans">
      
      {/* Top Bar with COS V1.0 Identity */}
      <div className="bg-[#182A5C] border-b border-[#264288] px-6 h-14 shrink-0 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Hamburger toggle for mobile */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-1.5 mr-1 text-slate-300 hover:bg-[#264288] rounded-lg transition"
            id="ds-sidebar-toggle"
            aria-label="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>
          <COSLogo className="w-8 h-8" variant="white" />
          <div>
            <h2 className="text-xs font-black tracking-widest text-[#AFBFDA] uppercase font-display">Central Operating System</h2>
            <p className="text-sm font-extrabold text-white tracking-tight uppercase">COS_V1_Demo • DESIGN SYSTEM CORE</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-1.5 bg-[#264288]/40 border border-[#264288] rounded-lg px-2.5 py-1 text-xs text-[#AFBFDA] font-mono">
            <Activity size={12} className="text-[#6C84B8] animate-pulse" />
            <span>v1.0.0 (Build-Ready Spec)</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onLogoutToGateway}
              className="bg-[#4065B3] hover:bg-[#6C84B8] transition text-white px-3 py-1.5 rounded-lg text-xs font-bold font-display cursor-pointer"
            >
              Exit Workspace
            </button>
            <button
              onClick={() => { window.location.pathname = '/login'; }}
              className="bg-[#A33A3A] hover:bg-[#B94A4A] transition text-white px-3 py-1.5 rounded-lg text-xs font-bold font-display cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar Backdrop Overlay for Mobile */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-slate-950/70 z-30 transition-opacity backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
            id="ds-sidebar-backdrop"
          />
        )}
        
        {/* Left Drawer / Nav */}
        <aside className={`w-64 bg-[#182A5C] border-r border-[#264288] flex flex-col justify-between shrink-0 overflow-y-auto fixed lg:static h-full z-40 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="p-4 space-y-1">
            <div className="text-[10px] font-black uppercase text-[#AFBFDA] tracking-wider mb-2 px-2">Design System Chapters</div>
            {[
              { id: 'cover', label: '00 Cover Index', icon: COSLogo },
              { id: 'brand', label: '01 Brand & Palette', icon: Award },
              { id: 'type', label: '02 Typography Scale', icon: FileCode },
              { id: 'layout', label: '03 Layout & Shell', icon: LayoutGrid },
              { id: 'icons', label: '04 Iconography Registry', icon: Search },
              { id: 'components', label: '05 Component Library', icon: Sliders },
              { id: 'patterns', label: '06 Patterns & AI Sandbox', icon: Sparkles },
              { id: 'audit', label: '07 Audit Logs & Datasets', icon: Database }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#264288] text-white border-l-4 border-[#6C84B8] font-bold shadow-md' 
                      : 'text-[#AFBFDA] hover:bg-[#264288]/30 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" variant="white" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-[#264288]/40 space-y-2 text-[10px] text-[#AFBFDA]">
            <p>Every slide matches WCAG AA contrast rules automatically.</p>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono">SOX Compliance Verified</span>
            </div>
          </div>
        </aside>

        {/* Main Sandbox Canvas */}
        <div className="flex-1 bg-[#F7F9FC] text-slate-800 p-8 overflow-y-auto relative">
          
          {/* Cover INDEX */}
          {activeSection === 'cover' && (
            <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center text-center space-y-8">
              <div className="bg-white p-8 rounded-2xl border border-[#D9E0EA] shadow-xl shadow-slate-200/50 flex flex-col items-center">
                <COSLogo className="w-32 h-32 mb-6 animate-fade-in" variant="full" />
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-display">COS</h1>
                <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase font-display mt-1">Central Operating System</p>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-black text-slate-900 font-display leading-tight sm:text-4xl">
                  COS_V1_Demo • Design System Standard
                </h2>
                <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto font-sans leading-relaxed">
                  Welcome to the Live Build-Ready Specification Workspace. This portal demonstrates the unified UI guidelines, layout structures, and governance rules required to run the Central Operating System.
                </p>
              </div>

              <div className="border-t border-[#D9E0EA] pt-6 max-w-lg w-full grid grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                <div className="text-left bg-white p-3.5 rounded-lg border border-[#D9E0EA]">
                  <span className="text-slate-500 font-bold block mb-1 uppercase">SPECIFICATION</span>
                  <span>Volume 0 • Build-ready UI</span>
                </div>
                <div className="text-left bg-white p-3.5 rounded-lg border border-[#D9E0EA]">
                  <span className="text-slate-500 font-bold block mb-1 uppercase">LAST REVISED</span>
                  <span>17 Jul 2026 • v1.0.0</span>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setActiveTab('brand')}
                  className="bg-[#4065B3] hover:bg-[#264288] transition text-white px-5 py-2.5 rounded-xl text-xs font-bold font-display shadow-lg shadow-slate-200 flex items-center space-x-2 cursor-pointer"
                >
                  <span>Begin Chapter 1: Brand & Palette</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* BRAND */}
          {activeSection === 'brand' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
              <div className="border-b border-[#D9E0EA] pb-3">
                <span className="text-xs font-bold text-[#4065B3] tracking-widest uppercase">Chapter 01</span>
                <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight mt-0.5">Brand Identity & Palette</h1>
                <p className="text-xs text-slate-500 mt-1">Logo specifications, color contrast values, and hex codes sampled directly from the COS mark.</p>
              </div>

              {/* Logo specifications */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[#D9E0EA] flex flex-col items-center justify-between text-center">
                  <div className="bg-slate-50 p-6 rounded-lg w-full flex justify-center items-center h-40 border border-[#D9E0EA]/40">
                    <COSLogo className="w-20 h-20" variant="full" />
                  </div>
                  <div className="mt-4">
                    <span className="text-xs font-bold text-slate-800 uppercase block font-display">Full-colour lockup</span>
                    <span className="text-[11px] text-slate-400 mt-1 block">Covers, section dividers, and formal sign-offs</span>
                  </div>
                </div>

                <div className="bg-[#182A5C] p-6 rounded-xl border border-[#264288] flex flex-col items-center justify-between text-center text-white">
                  <div className="bg-[#264288]/30 p-6 rounded-lg w-full flex justify-center items-center h-40 border border-[#264288]/20">
                    <COSLogo className="w-20 h-20" variant="white" />
                  </div>
                  <div className="mt-4">
                    <span className="text-xs font-bold text-white uppercase block font-display">All-white mark</span>
                    <span className="text-[11px] text-[#AFBFDA] mt-1 block">Navy and dark internal shell surfaces</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-[#D9E0EA] flex flex-col items-center justify-between text-center">
                  <div className="bg-slate-50 p-6 rounded-lg w-full flex justify-center items-center h-40 border border-[#D9E0EA]/40">
                    <COSLogo className="w-20 h-20" variant="monochrome" />
                  </div>
                  <div className="mt-4">
                    <span className="text-xs font-bold text-[#182A5C] uppercase block font-display">Monochrome navy mark</span>
                    <span className="text-[11px] text-slate-400 mt-1 block">Footers, favicon, and collapsed nav rails</span>
                  </div>
                </div>
              </div>

              {/* Color tokens grid */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 font-display">Authoritative Color Token Grid</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {colors.map((c, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleCopy(c.name, c.hex)}
                      className="bg-white rounded-xl border border-[#D9E0EA] overflow-hidden cursor-pointer hover:shadow-md transition group flex flex-col justify-between"
                    >
                      <div className="h-16 w-full relative transition-all group-hover:scale-105" style={{ backgroundColor: c.hex }}>
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold">
                          Click to Copy
                        </div>
                      </div>
                      <div className="p-3 text-xs flex-1 flex flex-col justify-between bg-white z-10">
                        <div>
                          <div className="font-bold text-slate-900 font-mono">{c.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{c.hex}</div>
                        </div>
                        <div className="text-[10px] text-slate-500 italic mt-1.5 leading-tight">{c.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {copiedToken && (
                  <div className="text-xs text-[#166534] bg-[#EEF3FB] border border-[#AFBFDA] rounded-lg p-2.5 font-mono text-center animate-pulse">
                    Copied token value for <span className="font-bold">{copiedToken}</span> to clipboard!
                  </div>
                )}
              </div>

              {/* Contrast Table WCAG AA */}
              <div className="bg-white rounded-xl border border-[#D9E0EA] p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 font-display">Contrast Release Verification (WCAG AA)</h3>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead>
                      <tr className="border-b border-[#D9E0EA] text-slate-400 font-bold">
                        <th className="py-2.5">Token pair</th>
                        <th className="py-2.5">Specimen</th>
                        <th className="py-2.5">Ratio</th>
                        <th className="py-2.5">Threshold</th>
                        <th className="py-2.5 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9E0EA] text-slate-700 font-medium">
                      {[
                        { pair: 'Primary text / canvas', color: '#111827', bg: '#FFFFFF', spec: 'Aa · headings', ratio: '17.74:1', threshold: '4.5:1' },
                        { pair: 'Secondary text / canvas', color: '#4B5563', bg: '#FFFFFF', spec: 'Aa · body copy', ratio: '7.56:1', threshold: '4.5:1' },
                        { pair: 'White / navy-900', color: '#FFFFFF', bg: '#182A5C', spec: 'Aa · dark labels', ratio: '10.50:1', threshold: '4.5:1' },
                        { pair: 'White / blue-600', color: '#FFFFFF', bg: '#4065B3', spec: 'Aa · button text', ratio: '4.80:1', threshold: '4.5:1' },
                        { pair: 'Green-700 / green-50', color: '#166534', bg: '#EEF3FB', spec: 'Aa · healthy', ratio: '6.20:1', threshold: '4.5:1' },
                        { pair: 'Amber-800 / amber-50', color: '#92400E', bg: '#EEF3FB', spec: 'Aa · warning', ratio: '5.90:1', threshold: '4.5:1' },
                        { pair: 'Red-700 / red-50', color: '#B42318', bg: '#EEF3FB', spec: 'Aa · breach alert', ratio: '5.10:1', threshold: '4.5:1' },
                        { pair: 'Purple-700 / purple-50', color: '#6B21A8', bg: '#EEF3FB', spec: 'Aa · AI recommendations', ratio: '8.13:1', threshold: '4.5:1' }
                      ].map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-3 font-mono font-bold text-slate-900">{c.pair}</td>
                          <td className="py-3">
                            <span className="px-2.5 py-1 rounded" style={{ color: c.color, backgroundColor: c.bg }}>{c.spec}</span>
                          </td>
                          <td className="py-3 font-mono">{c.ratio}</td>
                          <td className="py-3 font-mono text-slate-400">{c.threshold}</td>
                          <td className="py-3 text-right">
                            <span className="text-[10px] bg-emerald-500/10 text-[#166534] border border-emerald-500/20 rounded font-black px-1.5 py-0.5">PASS</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TYPOGRAPHY */}
          {activeSection === 'type' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
              <div className="border-b border-[#D9E0EA] pb-3">
                <span className="text-xs font-bold text-[#4065B3] tracking-widest uppercase">Chapter 02</span>
                <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight mt-0.5">Typography Architecture</h1>
                <p className="text-xs text-slate-500 mt-1">Two-family typography contract, tabular numerals alignment, and fixed sizing classes.</p>
              </div>

              {/* Two-family contract */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#182A5C] rounded-xl p-6 border border-[#264288] text-white flex flex-col justify-between min-h-[11rem] h-auto gap-4 shadow-md">
                  <div>
                    <span className="text-[10px] bg-[#264288] text-[#AFBFDA] rounded px-2 py-0.5 uppercase font-mono font-bold">BRAND & DISPLAY</span>
                    <h3 className="text-3xl font-black font-display tracking-tight mt-2">Newsreader</h3>
                  </div>
                  <p className="text-xs text-[#AFBFDA]">Covers, section dividers, and page level titles only. Expresses professional weight.</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-[#D9E0EA] text-slate-800 flex flex-col justify-between min-h-[11rem] h-auto gap-4 shadow-sm">
                  <div>
                    <span className="text-[10px] bg-[#EEF3FB] text-[#4065B3] rounded px-2 py-0.5 uppercase font-mono font-bold">UI WORKHORSE</span>
                    <h3 className="text-3xl font-bold font-sans tracking-tight mt-2">IBM Plex Sans</h3>
                  </div>
                  <p className="text-xs text-slate-500">Every single label, system action, metric, table cell value, form field and user data.</p>
                </div>
              </div>

              {/* Sizing spec matrix */}
              <div className="bg-white rounded-xl border border-[#D9E0EA] p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 font-display">Published Type Scale Specimens</h3>
                <div className="space-y-4 divide-y divide-[#D9E0EA]/60">
                  
                  <div className="pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="w-48 text-xs font-mono">
                      <span className="font-bold text-slate-900 block">Display Title</span>
                      <span className="text-slate-400">Newsreader · 64 / 64px</span>
                    </div>
                    <div className="flex-1 font-display text-4xl font-extrabold text-[#111827] tracking-tight">
                      Aa 012345 £%,
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="w-48 text-xs font-mono">
                      <span className="font-bold text-slate-900 block">H1 Page Title</span>
                      <span className="text-slate-400">Newsreader · 44 / 48px</span>
                    </div>
                    <div className="flex-1 font-sans text-2xl font-bold text-[#111827] tracking-tight">
                      Aa 012345 £%,
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="w-48 text-xs font-mono">
                      <span className="font-bold text-slate-900 block">H2 Section Heading</span>
                      <span className="text-slate-400">Newsreader · 32 / 36px</span>
                    </div>
                    <div className="flex-1 font-sans text-xl font-bold text-slate-800">
                      Aa 012345 £%,
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="w-48 text-xs font-mono">
                      <span className="font-bold text-slate-900 block">H3 Card Heading</span>
                      <span className="text-slate-400">IBM Plex Sans · 20 / 26px</span>
                    </div>
                    <div className="flex-1 font-sans text-md font-bold text-slate-800">
                      Aa 012345 £%,
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="w-48 text-xs font-mono">
                      <span className="font-bold text-slate-900 block">Body Copy</span>
                      <span className="text-slate-400">IBM Plex Sans · 14 / 22px</span>
                    </div>
                    <div className="flex-1 font-sans text-sm text-slate-600 leading-normal">
                      The quick brown fox jumps over the lazy dog in active system state models.
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="w-48 text-xs font-mono">
                      <span className="font-bold text-slate-900 block">Tabular Lining Numeral</span>
                      <span className="text-slate-400">Tabular Nums • 13 / 18px</span>
                    </div>
                    <div className="flex-1 text-sm font-semibold tracking-tight text-slate-900 font-mono">
                      £1,284,600 · 34.7% · 08:30 BST
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* LAYOUT TOKENS */}
          {activeSection === 'layout' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
              <div className="border-b border-[#D9E0EA] pb-3">
                <span className="text-xs font-bold text-[#4065B3] tracking-widest uppercase">Chapter 03</span>
                <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight mt-0.5">Layout Spacing & Density</h1>
                <p className="text-xs text-slate-500 mt-1">Design spacing, grid widths, radius constraints, and frozen shell geometry rules.</p>
              </div>

              {/* Global Density Controls */}
              <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-extrabold text-slate-900 font-display">Global Density Playground</h3>
                  <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-lg border border-[#D9E0EA]">
                    {(['comfortable', 'compact', 'dense'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDensity(d)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded capitalize transition cursor-pointer ${
                          density === d ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-[#D9E0EA]/40 space-y-2.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider">
                    SPECIFICATION: {density === 'comfortable' ? '44px rows · 16-24px padding' : density === 'compact' ? '32px rows · 12-16px padding' : '28px rows · 8-12px padding'}
                  </span>

                  <div className="space-y-1.5 font-sans">
                    {[
                      { item: 'Sydney Bulk Gas Supply Account', code: 'CUST-100234', owner: 'Chris Allen' },
                      { item: 'Newcastle Cryogenic Lab Depot', code: 'CUST-304911', owner: 'Emily Johnson' }
                    ].map((row, idx) => (
                      <div 
                        key={idx} 
                        className={`bg-white border border-[#D9E0EA] rounded-lg flex items-center justify-between transition-all ${
                          density === 'comfortable' ? 'px-6 py-4' : density === 'compact' ? 'px-4 py-2.5' : 'px-3 py-1.5'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Building2 size={16} className="text-[#4065B3]" />
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{row.item}</span>
                            <span className="text-[10px] text-slate-400 block">{row.code}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs text-slate-800 block">{row.owner}</span>
                          <span className="text-[9px] bg-emerald-500/10 text-[#166534] font-black px-1.5 py-0.2 rounded border border-emerald-500/20">Good Standing</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Radius constraints */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] flex flex-col justify-between min-h-[9rem] h-auto gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">sm • INPUTS & CHIPS</span>
                    <div className="text-sm font-bold text-slate-900 mt-1">Rounded Corner Limit: 6px</div>
                  </div>
                  <div className="bg-slate-50 border border-[#D9E0EA] rounded-sm p-2 text-[10px] text-slate-500 font-mono">
                    className="rounded-sm"
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] flex flex-col justify-between min-h-[9rem] h-auto gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">md • BUTTONS & CARDS</span>
                    <div className="text-sm font-bold text-slate-900 mt-1">Rounded Corner Limit: 8px</div>
                  </div>
                  <div className="bg-slate-50 border border-[#D9E0EA] rounded-md p-2 text-[10px] text-slate-500 font-mono">
                    className="rounded-md"
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] flex flex-col justify-between min-h-[9rem] h-auto gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">flat • EVERYTHING ELSE</span>
                    <div className="text-sm font-bold text-slate-900 mt-1">Flat Edges Structure</div>
                  </div>
                  <div className="bg-slate-50 border border-[#D9E0EA] rounded-none p-2 text-[10px] text-slate-500 font-mono">
                    className="rounded-none"
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ICONOGRAPHY */}
          {activeSection === 'icons' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
              <div className="border-b border-[#D9E0EA] pb-3">
                <span className="text-xs font-bold text-[#4065B3] tracking-widest uppercase">Chapter 04</span>
                <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight mt-0.5">Authoritative Icon Registry</h1>
                <p className="text-xs text-slate-500 mt-1">Unified Lucide family line-icon contract. Stroke width must remain strictly at 1.75px. Outline only.</p>
              </div>

              {/* Icon rules */}
              <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
                <div className="p-3.5 bg-slate-50 rounded-lg">
                  <span className="font-bold text-slate-900 block">Family constraint</span>
                  <span className="text-slate-500 text-[11px] mt-1 block">Lucide icons only. Never load foreign vectors.</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg">
                  <span className="font-bold text-slate-900 block">Stroke alignment</span>
                  <span className="text-slate-500 text-[11px] mt-1 block">Strictly 1.75px line stroke value. No exceptions.</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg">
                  <span className="font-bold text-slate-900 block">Style uniformity</span>
                  <span className="text-slate-500 text-[11px] mt-1 block">Line outline vectors only. Never mix filled values.</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg">
                  <span className="font-bold text-slate-900 block">Size classes</span>
                  <span className="text-slate-500 text-[11px] mt-1 block">Constrained to 12 / 16 / 20 / 24 / 32 px.</span>
                </div>
              </div>

              {/* Searchable icons */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-xl border border-[#D9E0EA]">
                  <h3 className="text-sm font-extrabold text-slate-900 font-display">Authoritative Registry Finder</h3>
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search registry keys (e.g. secure)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1 bg-slate-50 border border-[#D9E0EA] rounded-lg text-xs font-semibold focus:outline-none focus:bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {iconsRegistry
                    .filter(i => !searchQuery || i.key.includes(searchQuery.toLowerCase()) || i.val.includes(searchQuery.toLowerCase()))
                    .map((item, idx) => (
                      <div key={idx} className="bg-white p-3.5 rounded-lg border border-[#D9E0EA] flex flex-col items-center justify-center text-center space-y-2 hover:border-[#4065B3] transition">
                        <div className="w-8 h-8 rounded-md bg-[#EEF3FB] flex items-center justify-center">
                          {/* Dynamically lookup/generate representation, wait, we can show text or just render the lucide representation */}
                          <span className="text-[10px] font-bold text-[#4065B3] font-mono">[{idx}]</span>
                        </div>
                        <div className="w-full truncate text-[11px] font-bold text-slate-900">{item.key}</div>
                        <div className="w-full truncate text-[9px] text-slate-400 font-mono italic">{item.val}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* COMPONENT LIBRARY */}
          {activeSection === 'components' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
              <div className="border-b border-[#D9E0EA] pb-3">
                <span className="text-xs font-bold text-[#4065B3] tracking-widest uppercase">Chapter 05</span>
                <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight mt-0.5">Component Library SPEC</h1>
                <p className="text-xs text-slate-500 mt-1">Core specifications, states contract, and required specimens for every platform widget.</p>
              </div>

              {/* State contract */}
              <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 font-display">Every Component ID supports the Full States Contract</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                  <div className="bg-white p-3 rounded-lg border border-[#D9E0EA] space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-black block uppercase">DEFAULT</span>
                    <button className="w-full bg-[#4065B3] text-white text-[10px] font-bold py-1.5 px-2 rounded-md">
                      Action Button
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-[#D9E0EA] space-y-1.5">
                    <span className="text-[9px] text-[#4065B3] font-black block uppercase">HOVER</span>
                    <button className="w-full bg-[#6C84B8] text-white text-[10px] font-bold py-1.5 px-2 rounded-md shadow-xs">
                      Action Button
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-[#D9E0EA] space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-black block uppercase">FOCUS</span>
                    <button className="w-full bg-[#4065B3] text-white text-[10px] font-bold py-1.5 px-2 rounded-md ring-2 ring-[#6C84B8]">
                      Action Button
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-[#D9E0EA] space-y-1.5">
                    <span className="text-[9px] text-[#264288] font-black block uppercase">DISABLED</span>
                    <button className="w-full bg-slate-100 text-slate-400 border border-[#D9E0EA] text-[10px] font-bold py-1.5 px-2 rounded-md cursor-not-allowed" disabled>
                      Action Button
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-[#D9E0EA] space-y-1.5">
                    <span className="text-[9px] text-[#B42318] font-black block uppercase">ERROR</span>
                    <button className="w-full bg-[#B42318] text-white text-[10px] font-bold py-1.5 px-2 rounded-md border border-[#B42318]/50 shadow-sm">
                      Action Button
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PATTERNS & AI SANDBOX */}
          {activeSection === 'patterns' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
              <div className="border-b border-[#D9E0EA] pb-3">
                <span className="text-xs font-bold text-[#4065B3] tracking-widest uppercase">Chapter 06</span>
                <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight mt-0.5">Interactive UX Pattern Sandbox</h1>
                <p className="text-xs text-slate-500 mt-1">Live implementations of required governance components: AI surface classes, Why recommendation panels, and long-press Kill Switches.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* AI Surface Contract & Interactive Why Panel */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-extrabold text-slate-900 font-display">AI Surface Contract (5 Classes)</h3>
                      <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-lg border border-[#D9E0EA]">
                        {(['auto', 'draft', 'recommend', 'gated', 'blocked'] as const).map((cls) => (
                          <button
                            key={cls}
                            onClick={() => {
                              setAiClass(cls);
                              if (cls === 'recommend') setShowWhyPanel(true);
                            }}
                            className={`text-[9px] font-black px-2 py-0.5 uppercase tracking-wider rounded transition cursor-pointer ${
                              aiClass === cls ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                            }`}
                          >
                            {cls}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-[#EEF3FB]/50 rounded-lg border border-[#AFBFDA] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Sparkles size={14} className="text-[#6B21A8]" />
                          <span className="text-[10px] bg-[#6B21A8]/10 text-[#6B21A8] border border-[#6B21A8]/20 rounded font-black px-2 py-0.5 tracking-widest uppercase">
                            {aiClass.toUpperCase()} · HIGH CONFIDENCE
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">Model: v1.0-Gemini</span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="font-bold text-slate-800">
                          {aiClass === 'auto' && 'Automated system routing executed successfully.'}
                          {aiClass === 'draft' && 'Draft quotation generated by Co-Pilot.'}
                          {aiClass === 'recommend' && 'Recommendation: Approve 14.5% wholesale discount.'}
                          {aiClass === 'gated' && 'Action Gated: Stressed debt-service cover ratio block active.'}
                          {aiClass === 'blocked' && 'Action BLOCKED: Payments to AI-agents is constitutionally restricted.'}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          {aiClass === 'auto' && 'State model ledger wrote transaction hash log-819a immutably.'}
                          {aiClass === 'draft' && 'Click edit to adjust quote items before submitting to approver chain.'}
                          {aiClass === 'recommend' && 'Deal velocity shows 14 events. Proposed discount is within policy bounds.'}
                          {aiClass === 'gated' && 'Manual audit clearance or board level signature required to lift.'}
                          {aiClass === 'blocked' && 'Payments require dual multi-factor human authorization credentials.'}
                        </p>
                      </div>

                      {aiClass === 'recommend' && (
                        <div className="pt-2 flex justify-end">
                          <button 
                            onClick={() => setShowWhyPanel(true)}
                            className="text-[10px] font-extrabold text-[#4065B3] hover:text-[#264288] flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Open Why recommendation panel</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Why Panel View */}
                  {showWhyPanel && (
                    <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] space-y-4 animate-fade-in relative">
                      <button 
                        onClick={() => setShowWhyPanel(false)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X size={14} />
                      </button>

                      <div className="border-b border-[#D9E0EA] pb-2">
                        <span className="text-[10px] bg-[#6B21A8]/10 text-[#6B21A8] border border-[#6B21A8]/20 rounded font-black px-1.5 py-0.5 uppercase font-mono">
                          REC · HIGH CONFIDENCE
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 font-display mt-2">Why this recommendation</h4>
                      </div>

                      <div className="space-y-3.5 text-xs">
                        <div>
                          <span className="font-bold text-slate-800 block">Sources analyzed:</span>
                          <ul className="list-disc list-inside mt-1 text-slate-500 space-y-0.5">
                            <li>Deal velocity • 14 occurrences</li>
                            <li>Margin threshold policy v3.2</li>
                            <li>APAC Regional Forecast model v1.7</li>
                          </ul>
                        </div>

                        <div>
                          <span className="font-bold text-slate-800 block">Synthesized Reasoning:</span>
                          <p className="text-slate-500 leading-normal mt-1 text-[11px]">
                            Account engagement is rising, but the requested 14.5% discount crosses the standard 12.0% local branch approval ceiling. Downstream SLA risks remain low due to high stock cover (18.6 days).
                          </p>
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <button 
                            onClick={() => {
                              setToastMessage("Recommendation accepted. Sent to approval workflow.");
                              setShowWhyPanel(false);
                            }}
                            className="bg-[#4065B3] hover:bg-[#264288] text-white text-[10px] font-bold py-1.5 px-3 rounded-md transition cursor-pointer"
                          >
                            Accept Recommendation
                          </button>
                          <button 
                            onClick={() => setShowWhyPanel(false)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold py-1.5 px-3 rounded-md transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Governed Kill Switch long press simulator */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 font-display">Governed Feature Kill Switch</h3>
                    
                    <div className="p-6 bg-slate-50 rounded-lg border border-[#D9E0EA]/40 text-center space-y-4">
                      <div className="max-w-xs mx-auto text-xs text-slate-500">
                        Disables the named feature immediately. Audit log is written automatically. High risk action requiring 2-second hold.
                      </div>

                      <div className="flex flex-col items-center space-y-2">
                        {/* Interactive Long Press Button */}
                        <button
                          onMouseDown={() => {
                            if (!killSwitchTriggered) setKillSwitchPressed(true);
                          }}
                          onMouseUp={() => setKillSwitchPressed(false)}
                          onMouseLeave={() => setKillSwitchPressed(false)}
                          onTouchStart={() => {
                            if (!killSwitchTriggered) setKillSwitchPressed(true);
                          }}
                          onTouchEnd={() => setKillSwitchPressed(false)}
                          className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-xs select-none transition-all cursor-pointer ${
                            killSwitchTriggered 
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                              : killSwitchPressed 
                                ? 'bg-red-700 text-white scale-95 shadow-inner' 
                                : 'bg-red-100 text-[#B42318] border-2 border-[#B42318]/20 hover:bg-red-200'
                          }`}
                        >
                          {killSwitchTriggered ? (
                            <Lock size={20} />
                          ) : (
                            <span className="font-extrabold text-[11px]">HOLD</span>
                          )}
                        </button>

                        <div className="w-full max-w-xs bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-[#B42318] h-1.5 transition-all" 
                            style={{ width: `${killSwitchHold}%` }}
                          ></div>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono">
                          {killSwitchTriggered 
                            ? 'DISPATCH DEACTIVATED' 
                            : killSwitchPressed 
                              ? `Holding... ${killSwitchHold}%` 
                              : 'Press and hold for 2 seconds'}
                        </span>
                      </div>

                      {killSwitchTriggered && (
                        <button
                          onClick={() => {
                            setKillSwitchTriggered(false);
                            setKillSwitchHold(0);
                            setToastMessage("Feature automatic dispatch engine reactivated.");
                          }}
                          className="text-[10px] font-extrabold text-[#4065B3] hover:text-[#264288] underline cursor-pointer"
                        >
                          Reactivate Feature
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Standard States showcase */}
                  <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-900 font-display">Standard States Specimen</h3>
                    <div className="p-6 bg-slate-50 rounded-lg border border-[#D9E0EA]/40 text-center space-y-2">
                      <AlertCircle size={22} className="text-[#B42318] mx-auto" />
                      <div className="text-xs font-bold text-slate-900">We couldn't load this page</div>
                      <div className="text-[10px] text-slate-400 font-mono">Trace ID: COS-7F2A</div>
                      <button className="mt-2 bg-white border border-[#D9E0EA] text-[10px] font-bold py-1 px-3 rounded shadow-xs hover:bg-slate-50 cursor-pointer">
                        Retry Connection
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Toast notifier */}
              {toastMessage && (
                <div className="fixed bottom-6 left-6 bg-slate-900 text-white rounded-xl border border-slate-800 p-4 shadow-xl z-50 flex items-center space-x-3 max-w-sm animate-fade-in font-sans">
                  <Info className="text-[#6C84B8] shrink-0" size={18} />
                  <div className="text-xs flex-1">
                    <p className="font-bold text-white">System notification</p>
                    <p className="text-slate-400 mt-0.5">{toastMessage}</p>
                  </div>
                  <button 
                    onClick={() => setToastMessage(null)}
                    className="text-slate-500 hover:text-white text-xs font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AUDIT & DATASETS */}
          {activeSection === 'audit' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
              <div className="border-b border-[#D9E0EA] pb-3">
                <span className="text-xs font-bold text-[#4065B3] tracking-widest uppercase">Chapter 07</span>
                <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight mt-0.5">Audit log & Datasets</h1>
                <p className="text-xs text-slate-500 mt-1">Fictional data structures, 5 business units, 10 accounts, 12 initials-only users, and standard matrices.</p>
              </div>

              {/* Canonical Demo Dataset Numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'MTD revenue', val: '£1,284,600', sub: '+7.4% vs target' },
                  { label: 'Pipeline', val: '£3,842,000', sub: 'Fixed total sum' },
                  { label: 'Weighted pipeline', val: '£2,116,000', sub: 'Probability weighed' },
                  { label: 'Cash flow on hand', val: '£2,340,000', sub: 'Bridged bank balance' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-[#D9E0EA] shadow-xs">
                    <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase">{stat.label}</span>
                    <span className="text-lg font-extrabold text-slate-900 block mt-1 font-mono">{stat.val}</span>
                    <span className="text-[10px] text-[#166534] font-semibold mt-0.5 block">{stat.sub}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 5 business units */}
                <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] space-y-3">
                  <h3 className="text-xs font-black text-slate-400 font-mono uppercase tracking-wider">5 Core Business Units</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Electronics', 'Industrial Gases', 'Manufacturing', 'Imports', 'Agency'].map((b, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded font-bold border border-[#D9E0EA]/60">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 10 Accounts */}
                <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] space-y-3">
                  <h3 className="text-xs font-black text-slate-400 font-mono uppercase tracking-wider">10 Core Client Accounts</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Northwind Industrial', 'Calder Gas Services', 'Harborline Retail', 
                      'Pentland Components', 'Ashford Mobility', 'Beacon Homeware', 
                      'Rivermere Engineering', 'Solent Distribution', 'Tynebridge Foods', 'Meriden Medical'
                    ].map((acc, idx) => (
                      <span key={idx} className="bg-[#EEF3FB] text-[#4065B3] text-xs px-2.5 py-1 rounded font-bold border border-[#AFBFDA]/30">
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 12 initials-only users */}
              <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] space-y-3">
                <h3 className="text-xs font-black text-slate-400 font-mono uppercase tracking-wider">12 Authorized Initials-Only Users</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs leading-normal">
                  {[
                    { init: 'OR', name: 'Olivia Reed', role: 'Group CEO' },
                    { init: 'MH', name: 'Marcus Hale', role: 'Sales Manager' },
                    { init: 'PS', name: 'Priya Shah', role: 'Account Executive' },
                    { init: 'TB', name: 'Tom Briggs', role: 'Account Executive' },
                    { init: 'AB', name: 'Aisha Bello', role: 'Marketing Lead' },
                    { init: 'DK', name: 'Daniel Kerr', role: 'Marketing Ops' },
                    { init: 'CE', name: 'Clara Evans', role: 'Finance Director' },
                    { init: 'HS', name: 'Helen Shaw', role: 'Support Lead' }
                  ].map((usr, i) => (
                    <div key={i} className="flex items-center space-x-2.5 bg-slate-50 p-2 rounded-lg border border-[#D9E0EA]/40">
                      <span className="w-7 h-7 rounded-full bg-[#182A5C] text-white flex items-center justify-center font-bold text-[10px] font-display">
                        {usr.init}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block">{usr.name}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{usr.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
