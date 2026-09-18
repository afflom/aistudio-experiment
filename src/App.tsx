/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { PrismPM, PrismApplication } from '@prismpm/sdk';
import { VaultState, OperationType } from './types';
import { Navbar, AppNavTab } from './components/Navbar';
import { VaultPlatform } from './components/VaultPlatform';
import { ModelStudio } from './components/ModelStudio';
import { Layers, GitBranch, ExternalLink } from 'lucide-react';

export default function App() {
  // Defined with PrismPM by importing PrismPM and its SDK
  const appRef = useRef<PrismApplication>(PrismPM.createApplication());
  const [vaultState, setVaultState] = useState<VaultState>(() => appRef.current.getState());
  const [activeTab, setActiveTab] = useState<AppNavTab>('overview');

  useEffect(() => {
    // Subscribe to state change events from the PrismPM SDK
    const unsubscribe = appRef.current.on('stateChanged', (newState) => {
      setVaultState({ ...newState });
    });
    return unsubscribe;
  }, []);

  const handleExecute = (op: OperationType, params: any) => {
    appRef.current.execute(op, params);
  };

  const handleAdvanceEpoch = () => {
    appRef.current.advanceEpoch();
  };

  const handleResetLedger = () => {
    appRef.current.reset();
  };

  const isSolvent = (vaultState.totalCirculatingSupply + vaultState.totalEscrowLocked) === vaultState.initialSupply;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Production Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentEpoch={vaultState.currentEpoch}
        onAdvanceEpoch={handleAdvanceEpoch}
        onResetLedger={handleResetLedger}
        totalCirculating={vaultState.totalCirculatingSupply}
        totalEscrow={vaultState.totalEscrowLocked}
        isSolvent={isSolvent}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'model' ? (
          <ModelStudio />
        ) : (
          <VaultPlatform
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            state={vaultState}
            onExecute={handleExecute}
            onAdvanceEpoch={handleAdvanceEpoch}
          />
        )}
      </main>

      {/* Platform Institutional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 text-slate-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>PrismVault: Verifiable Digital Asset Platform modeled via standards-based PrismPM definitions.</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-400">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Lean 4.32.1 Formal Proof Engine</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">
              Zero-Trust Solvency Verified
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
