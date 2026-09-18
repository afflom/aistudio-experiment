/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RAW_VAULT_LEX_TEX, VAULT_PRISMPM_TOML, VAULT_LEXLEAN_TOML, VAULT_OPERATIONS, VAULT_THEOREMS } from '../model/vaultSource';
import { FileCode, Settings, FileText, Check, Copy, Download, Code2, ShieldAlert, Sparkles } from 'lucide-react';

export const ModelExplorer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'lextex' | 'prismpm' | 'lexlean' | 'ast' | 'theorems'>('lextex');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-white">Standards-Based Platform Modeling in PrismPM</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                UOR Specification
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              PrismPM is the UOR Framework's utility for modeling platforms using standards-based definitions.
              Rather than assembling an ad-hoc collection of disparate scripts, PrismVault is formally specified in <code className="text-indigo-300">src/Vault.lex.tex</code>:
              defining domain entities (accounts, escrow contracts, settlement receipts), role-based state machines, and mathematical conservation proofs.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCopy(
                activeSubTab === 'lextex' ? RAW_VAULT_LEX_TEX :
                activeSubTab === 'prismpm' ? JSON.stringify(VAULT_PRISMPM_TOML, null, 2) :
                JSON.stringify(VAULT_LEXLEAN_TOML, null, 2)
              )}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono transition-colors flex items-center space-x-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Source'}</span>
            </button>

            <button
              onClick={() => handleDownload('Vault.lex.tex', RAW_VAULT_LEX_TEX)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .lex.tex</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex space-x-2 mt-4 pt-4 border-t border-slate-800 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('lextex')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'lextex'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>src/Vault.lex.tex</span>
          </button>

          <button
            onClick={() => setActiveSubTab('prismpm')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'prismpm'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>prismpm.toml</span>
          </button>

          <button
            onClick={() => setActiveSubTab('lexlean')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'lexlean'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>lexlean.toml</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ast')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'ast'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>AST &amp; Declaration Entities</span>
          </button>

          <button
            onClick={() => setActiveSubTab('theorems')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'theorems'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formally Modeled Theorems</span>
          </button>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        
        {activeSubTab === 'lextex' && (
          <div className="p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span>File: src/Vault.lex.tex (Formal Semantic Module)</span>
              <span>Spec: lexlean/semantic-module/1</span>
            </div>
            <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800/80">
              <code>{RAW_VAULT_LEX_TEX}</code>
            </pre>
          </div>
        )}

        {activeSubTab === 'prismpm' && (
          <div className="p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span>File: prismpm.toml (Normative PrismPM Project Manifest)</span>
              <span>Spec: prismpm/project/1</span>
            </div>
            <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800/80">
              <code>{`spec = "${VAULT_PRISMPM_TOML.spec}"
project = "${VAULT_PRISMPM_TOML.project}"
lexlean_project = "${VAULT_PRISMPM_TOML.lexlean_project}"
build_root = "${VAULT_PRISMPM_TOML.build_root}"

[limits]
max_holo_bytes = ${VAULT_PRISMPM_TOML.limits.max_holo_bytes}
max_entities = ${VAULT_PRISMPM_TOML.limits.max_entities}
max_diagnostics = ${VAULT_PRISMPM_TOML.limits.max_diagnostics}`}</code>
            </pre>
            <div className="mt-3 text-xs text-slate-400 font-mono">
              <strong>PrismPM Constraint:</strong> All five top-level fields and all three limit fields are required; unknown fields are errors. Limits are strictly enforced at build and verify time.
            </div>
          </div>
        )}

        {activeSubTab === 'lexlean' && (
          <div className="p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span>File: lexlean.toml (LexLean Compiler &amp; Toolchain Configuration)</span>
              <span>Spec: lexlean/project/1</span>
            </div>
            <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800/80">
              <code>{`spec = "${VAULT_LEXLEAN_TOML.spec}"
name = "${VAULT_LEXLEAN_TOML.name}"
language = "${VAULT_LEXLEAN_TOML.language}"
module_prefix = "${VAULT_LEXLEAN_TOML.module_prefix}"
source_roots = ["src"]
entrypoints = ["src/Vault.lex.tex"]
build_root = "${VAULT_LEXLEAN_TOML.build_root}"
lockfile = "${VAULT_LEXLEAN_TOML.lockfile}"
lean_workspace = "${VAULT_LEXLEAN_TOML.lean_workspace}"
lean_toolchain = "${VAULT_LEXLEAN_TOML.lean_toolchain}"

[[lexicon_source]]
package = "lexlean.std.nat"
kind = "builtin"

[limits]
max_file_bytes = 4194304
max_total_source_bytes = 67108864
max_scope_depth = 1024
max_import_depth = 128
max_diagnostics = 256`}</code>
            </pre>
          </div>
        )}

        {activeSubTab === 'ast' && (
          <div className="p-5 space-y-4">
            <div className="text-xs font-mono text-slate-400 mb-2">
              Parsed Semantic Declarations from <code className="text-slate-200">Vault.lex.tex</code>:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                <div className="flex items-center justify-between font-semibold text-indigo-300 pb-2 mb-2 border-b border-slate-800">
                  <span>inductive Operation</span>
                  <span className="text-slate-500">6 constructors</span>
                </div>
                <ul className="space-y-1 text-slate-300">
                  {VAULT_OPERATIONS.map(op => (
                    <li key={op.discriminant} className="flex items-center justify-between">
                      <span>• {op.label.replace(' ', '')}</span>
                      <span className="text-slate-500 text-[11px]">[{op.discriminant}] {op.requestName}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                <div className="flex items-center justify-between font-semibold text-rose-300 pb-2 mb-2 border-b border-slate-800">
                  <span>inductive VaultError</span>
                  <span className="text-slate-500">7 constructors</span>
                </div>
                <ul className="space-y-1 text-slate-300">
                  <li>• InsufficientFunds</li>
                  <li>• ArithmeticOverflow</li>
                  <li>• InvalidAmount</li>
                  <li>• EscrowConditionMismatch</li>
                  <li>• EscrowExpired</li>
                  <li>• EscrowNotExpired</li>
                  <li>• AccountNotFound</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                <div className="flex items-center justify-between font-semibold text-cyan-300 pb-2 mb-2 border-b border-slate-800">
                  <span>structure Account</span>
                  <span className="text-slate-500">3 fields</span>
                </div>
                <ul className="space-y-1 text-slate-300">
                  <li>• address: <span className="text-amber-400">string</span></li>
                  <li>• balance: <span className="text-amber-400">uint64</span></li>
                  <li>• nonce: <span className="text-amber-400">uint32</span></li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                <div className="flex items-center justify-between font-semibold text-amber-300 pb-2 mb-2 border-b border-slate-800">
                  <span>structure EscrowRecord</span>
                  <span className="text-slate-500">7 fields</span>
                </div>
                <ul className="space-y-1 text-slate-300">
                  <li>• id: <span className="text-amber-400">string</span></li>
                  <li>• depositor: <span className="text-amber-400">string</span></li>
                  <li>• beneficiary: <span className="text-amber-400">string</span></li>
                  <li>• amount: <span className="text-amber-400">uint64</span></li>
                  <li>• conditionHash: <span className="text-amber-400">string</span></li>
                  <li>• timeoutEpoch: <span className="text-amber-400">uint32</span></li>
                  <li>• status: <span className="text-amber-400">EscrowStatus</span></li>
                </ul>
              </div>

            </div>
          </div>
        )}

        {activeSubTab === 'theorems' && (
          <div className="p-5 space-y-4">
            <div className="text-xs font-mono text-slate-400 mb-2">
              Theorems formalized in LexLean and proven in Lean 4.32.1:
            </div>

            <div className="space-y-3">
              {VAULT_THEOREMS.map((thm) => (
                <div key={thm.name} className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-400 font-bold text-sm">theorem {thm.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[11px]">
                      Verified Lean 4
                    </span>
                  </div>

                  <div className="text-slate-300 mb-2 font-sans text-xs bg-slate-900/60 p-2.5 rounded border border-slate-800">
                    <div className="text-slate-400 text-[11px] font-mono uppercase tracking-wider mb-1">Mathematical Proposition</div>
                    {thm.statement}
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 mb-2">
                    <div className="text-slate-400 text-[11px] font-mono uppercase tracking-wider mb-1">Lean 4 Code</div>
                    <code className="text-cyan-300 whitespace-pre">{thm.leanFormalization}</code>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Proof Strategy: <strong className="text-slate-300">{thm.proofStrategy}</strong></span>
                    <span>Runtime checks passed: <strong className="text-emerald-400">{thm.verifiedCount} times</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
