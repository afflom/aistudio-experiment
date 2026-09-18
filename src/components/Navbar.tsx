/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PrismVault - Production Navigation Bar
 */

import React from 'react';
import { 
  Layers, 
  LayoutDashboard, 
  ArrowRightLeft, 
  Lock, 
  Coins, 
  ShieldCheck, 
  Code2, 
  RefreshCw, 
  ChevronRight,
  CheckCircle2,
  Clock
} from 'lucide-react';

export type AppNavTab = 'overview' | 'transfers' | 'escrows' | 'treasury' | 'solvency' | 'model';

interface NavbarProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  currentEpoch: number;
  onAdvanceEpoch: () => void;
  onResetLedger: () => void;
  totalCirculating: bigint;
  totalEscrow: bigint;
  isSolvent: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentEpoch,
  onAdvanceEpoch,
  onResetLedger,
  totalCirculating,
  totalEscrow,
  isSolvent
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Platform Identity */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-white text-base">PrismVault</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  Built with PrismPM
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Verifiable Digital Asset Settlement &amp; Escrow Platform
              </div>
            </div>
          </div>

          {/* Quick Metrics & Controls */}
          <div className="hidden md:flex items-center space-x-3 text-xs font-mono">
            {/* Solvency Status */}
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center space-x-2">
              <span className="text-slate-400">Backing:</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isSolvent ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span className={isSolvent ? "text-emerald-300 font-semibold" : "text-rose-400 font-semibold"}>
                  {isSolvent ? "100% Backed" : "Invariant Violation"}
                </span>
              </div>
            </div>

            {/* Epoch Counter */}
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Epoch:</span>
              <span className="text-cyan-300 font-bold">#{currentEpoch}</span>
              <button
                id="btn-advance-epoch"
                onClick={onAdvanceEpoch}
                title="Advance 1 Epoch (Simulates time passage for escrow time-locks)"
                className="ml-1 text-slate-400 hover:text-cyan-300 transition-colors p-0.5 rounded hover:bg-slate-700 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reset State */}
            <button
              id="btn-reset-state"
              onClick={onResetLedger}
              title="Reset Ledger to Genesis State"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

        </div>

        {/* Cohesive Main Navigation Tabs */}
        <nav className="flex items-center space-x-1 border-t border-slate-800/80 -mb-px overflow-x-auto py-1.5">
          <button
            id="nav-tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            id="nav-tab-transfers"
            onClick={() => setActiveTab('transfers')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'transfers'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Settlement</span>
          </button>

          <button
            id="nav-tab-escrows"
            onClick={() => setActiveTab('escrows')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'escrows'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Escrow Contracts</span>
          </button>

          <button
            id="nav-tab-treasury"
            onClick={() => setActiveTab('treasury')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'treasury'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Treasury</span>
          </button>

          <button
            id="nav-tab-solvency"
            onClick={() => setActiveTab('solvency')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'solvency'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Proof of Reserves</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-2"></div>

          <button
            id="nav-tab-model"
            onClick={() => setActiveTab('model')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'model'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Model &amp; Architecture</span>
          </button>
        </nav>

      </div>
    </header>
  );
};
