/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PrismPM Model & Architecture Studio
 * 
 * Provides inspection of the standards-based model definitions,
 * formal Lean 4 verification pipeline, Core-Wasm bytecode, and release packaging.
 */

import React, { useState } from 'react';
import { ModelExplorer } from './ModelExplorer';
import { BuildPipeline } from './BuildPipeline';
import { ProofVerifier } from './ProofVerifier';
import { ArtifactInspector } from './ArtifactInspector';
import { PublishPipeline } from './PublishPipeline';
import { FileCode, Cpu, ShieldCheck, Binary, Rocket, Layers } from 'lucide-react';

export type ModelStudioTab = 'spec' | 'build' | 'proofs' | 'wasm' | 'closure';

export const ModelStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModelStudioTab>('spec');

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 font-mono text-xs border border-indigo-500/30 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                PrismPM Standards-Based Modeling
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700">
                LexLean 1.1 / Lean 4.32.1
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-2">
              Platform Architecture &amp; Formal Specification
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              PrismVault is defined from standards-based PrismPM models. Inspect the mathematical model in <code className="text-indigo-300">src/Vault.lex.tex</code>,
              the verified compilation pipeline, machine-checked invariant theorems, and compiled distribution closures.
            </p>
          </div>

          {/* Sub-navigation */}
          <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('spec')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'spec' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Model Spec</span>
            </button>

            <button
              onClick={() => setActiveTab('build')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'build' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Build Pipeline</span>
            </button>

            <button
              onClick={() => setActiveTab('proofs')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'proofs' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Formal Proofs</span>
            </button>

            <button
              onClick={() => setActiveTab('wasm')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'wasm' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Binary className="w-3.5 h-3.5" />
              <span>Core-Wasm ABI</span>
            </button>

            <button
              onClick={() => setActiveTab('closure')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'closure' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>6-File Closure &amp; Crate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-view Content */}
      <div>
        {activeTab === 'spec' && <ModelExplorer />}
        {activeTab === 'build' && <BuildPipeline />}
        {activeTab === 'proofs' && <ProofVerifier />}
        {activeTab === 'wasm' && <ArtifactInspector />}
        {activeTab === 'closure' && <PublishPipeline />}
      </div>
    </div>
  );
};
