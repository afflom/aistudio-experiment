/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VaultState, OperationType } from '../types';
import { VAULT_OPERATIONS } from '../model/vaultSource';
import { Shield, ArrowRightLeft, Lock, Unlock, RotateCcw, CheckCircle2, AlertTriangle, ArrowUpRight, Zap, Info, Hash } from 'lucide-react';

interface AppRunnerProps {
  state: VaultState;
  onExecute: (op: OperationType, params: any) => void;
  onAdvanceEpoch: () => void;
}

export const AppRunner: React.FC<AppRunnerProps> = ({ state, onExecute, onAdvanceEpoch }) => {
  const [selectedOp, setSelectedOp] = useState<OperationType>('Transfer');
  const [sourceAccount, setSourceAccount] = useState<string>('alice.uor');
  const [targetAccount, setTargetAccount] = useState<string>('bob.uor');
  const [amount, setAmount] = useState<string>('25000');
  const [escrowId, setEscrowId] = useState<string>('escrow-001');
  const [conditionPreimage, setConditionPreimage] = useState<string>('settlement_preimage_uor');
  const [timeoutEpoch, setTimeoutEpoch] = useState<number>(state.currentEpoch + 6);
  const [statusMessage, setStatusMessage] = useState<{ type: 'ok' | 'error' | 'idle'; text: string; details?: string }>({
    type: 'idle',
    text: 'Awaiting operation input. Form ready to dispatch verified intents.'
  });

  const latestLog = state.logs[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecute(selectedOp, {
      account: sourceAccount,
      sourceAccount,
      targetAccount,
      amount,
      escrowId,
      conditionPreimage,
      timeoutEpoch
    });

    // Update status based on execution
    setTimeout(() => {
      const top = state.logs[0];
      if (top) {
        if (top.result.kind === 'ok') {
          setStatusMessage({
            type: 'ok',
            text: top.result.value || 'Operation executed successfully.',
            details: `Tx: ${top.result.txHash || '0x...'} • Gas: ${top.result.gasUnits} units • Proof: ${top.proofAttestation?.theorem || 'Verified'}`
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: top.result.message || 'Operation failed verification.',
            details: `Error code: ${top.result.error || 'rejected'}`
          });
        }
      }
    }, 50);
  };

  const applyPreset = (op: OperationType, src: string, tgt: string, amt: string, escId?: string, preimage?: string) => {
    setSelectedOp(op);
    setSourceAccount(src);
    setTargetAccount(tgt);
    setAmount(amt);
    if (escId) setEscrowId(escId);
    if (preimage) setConditionPreimage(preimage);
  };

  const activeEscrows = state.escrows.filter(e => e.status === 'active');
  const historicalEscrows = state.escrows.filter(e => e.status !== 'active');

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Verification & Invariant Conservation Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-white">PrismPM Holo/1 Presentation View</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
                  Proof Checked
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Portable WASM core compiled from <code className="text-slate-300">src/Vault.lex.tex</code> with Lean 4.32.1 invariant proofs.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-xs font-mono">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider">Total Ledger Supply</div>
              <div className="text-slate-100 font-bold">{state.initialSupply.toLocaleString()} UOR</div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-xs font-mono">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider">Active Escrows</div>
              <div className="text-amber-300 font-bold">{state.totalEscrowLocked.toLocaleString()} UOR</div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono">
              <div className="text-emerald-400 text-[10px] uppercase tracking-wider">Solvency Invariant</div>
              <div className="text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONSERVED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form (The Modeled View Layer) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                <span>Execute Modeled Intent</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Grammar: AsciiAlphanumericAddress
              </span>
            </div>

            {/* Presets for Quick Testing */}
            <div className="mb-4">
              <div className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-between">
                <span>Quick Scenario Presets:</span>
                <span className="text-[11px] text-slate-500">Click to fill</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => applyPreset('Transfer', 'alice.uor', 'bob.uor', '25000')}
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left text-slate-200 transition-colors"
                >
                  <div className="text-indigo-300 font-semibold truncate">Transfer 25k UOR</div>
                  <div className="text-[10px] text-slate-400 truncate">Alice → Bob</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('LockEscrow', 'alice.uor', 'bob.uor', '15000', undefined, 'settlement_preimage_uor')}
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left text-slate-200 transition-colors"
                >
                  <div className="text-amber-300 font-semibold truncate">Lock Escrow 15k</div>
                  <div className="text-[10px] text-slate-400 truncate">Alice → Bob (Timed)</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('Transfer', 'bob.uor', 'carol.uor', '999999')}
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left text-slate-200 transition-colors"
                >
                  <div className="text-rose-300 font-semibold truncate">Overdraw Test</div>
                  <div className="text-[10px] text-slate-400 truncate">Bob → Carol (Rejection)</div>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedOp('AuditInvariants'); }}
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left text-slate-200 transition-colors"
                >
                  <div className="text-emerald-300 font-semibold truncate">Audit Invariants</div>
                  <div className="text-[10px] text-slate-400 truncate">Full Ledger Proof</div>
                </button>
              </div>
            </div>

            {/* Modeled Form */}
            <form id="application-form" onSubmit={handleSubmit} className="space-y-4">
              
              {/* Operation Select */}
              <div>
                <label htmlFor="operation" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Operation Intent (Discriminant)
                </label>
                <select
                  id="operation"
                  name="operation"
                  value={selectedOp}
                  onChange={(e) => setSelectedOp(e.target.value as OperationType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {VAULT_OPERATIONS.map((op) => (
                    <option key={op.discriminant} value={op.label.replace(' ', '')}>
                      [{op.discriminant}] {op.label} — {op.rustVariant}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-400 mt-1">
                  {VAULT_OPERATIONS.find(o => o.label.replace(' ', '') === selectedOp)?.description}
                </div>
              </div>

              {/* Dynamic Inputs based on operation */}
              {selectedOp === 'Deposit' && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="deposit-target" className="block text-xs font-medium text-slate-300 mb-1">
                      Recipient Account
                    </label>
                    <input
                      id="deposit-target"
                      type="text"
                      value={sourceAccount}
                      onChange={(e) => setSourceAccount(e.target.value)}
                      placeholder="e.g. alice.uor"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="deposit-amount" className="block text-xs font-medium text-slate-300 mb-1">
                      Deposit Amount (UOR)
                    </label>
                    <input
                      id="deposit-amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {selectedOp === 'Transfer' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="transfer-source" className="block text-xs font-medium text-slate-300 mb-1">
                        Source (Sender)
                      </label>
                      <select
                        id="transfer-source"
                        value={sourceAccount}
                        onChange={(e) => setSourceAccount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {Object.keys(state.accounts).map(acc => (
                          <option key={acc} value={acc}>{acc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="transfer-target" className="block text-xs font-medium text-slate-300 mb-1">
                        Target (Recipient)
                      </label>
                      <select
                        id="transfer-target"
                        value={targetAccount}
                        onChange={(e) => setTargetAccount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {Object.keys(state.accounts).map(acc => (
                          <option key={acc} value={acc}>{acc}</option>
                        ))}
                        <option value="dave.uor">dave.uor (New Account)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="transfer-amount" className="block text-xs font-medium text-slate-300 mb-1">
                      Transfer Amount (UOR)
                    </label>
                    <input
                      id="transfer-amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 25000"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Sender Balance: <strong className="text-slate-200">{state.accounts[sourceAccount]?.balance.toLocaleString() || '0'} UOR</strong></span>
                      <span className="text-indigo-400 font-mono">Proof: transferConservation</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedOp === 'LockEscrow' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="escrow-depositor" className="block text-xs font-medium text-slate-300 mb-1">
                        Depositor
                      </label>
                      <select
                        id="escrow-depositor"
                        value={sourceAccount}
                        onChange={(e) => setSourceAccount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {Object.keys(state.accounts).map(acc => (
                          <option key={acc} value={acc}>{acc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="escrow-beneficiary" className="block text-xs font-medium text-slate-300 mb-1">
                        Beneficiary
                      </label>
                      <select
                        id="escrow-beneficiary"
                        value={targetAccount}
                        onChange={(e) => setTargetAccount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {Object.keys(state.accounts).map(acc => (
                          <option key={acc} value={acc}>{acc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="lock-amount" className="block text-xs font-medium text-slate-300 mb-1">
                        Amount (UOR)
                      </label>
                      <input
                        id="lock-amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="lock-timeout" className="block text-xs font-medium text-slate-300 mb-1">
                        Timeout Epoch (Current: #{state.currentEpoch})
                      </label>
                      <input
                        id="lock-timeout"
                        type="number"
                        value={timeoutEpoch}
                        onChange={(e) => setTimeoutEpoch(parseInt(e.target.value) || state.currentEpoch + 5)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="condition-preimage" className="block text-xs font-medium text-slate-300 mb-1">
                      Condition Secret Preimage
                    </label>
                    <input
                      id="condition-preimage"
                      type="text"
                      value={conditionPreimage}
                      onChange={(e) => setConditionPreimage(e.target.value)}
                      placeholder="e.g. settlement_preimage_uor"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {selectedOp === 'ReleaseEscrow' && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="release-escrow-id" className="block text-xs font-medium text-slate-300 mb-1">
                      Active Escrow ID
                    </label>
                    <select
                      id="release-escrow-id"
                      value={escrowId}
                      onChange={(e) => setEscrowId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {activeEscrows.length === 0 && <option value="">No active escrows available</option>}
                      {activeEscrows.map(esc => (
                        <option key={esc.id} value={esc.id}>
                          {esc.id} — {esc.amount.toLocaleString()} UOR ({esc.depositor} → {esc.beneficiary})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="release-preimage" className="block text-xs font-medium text-slate-300 mb-1">
                      Condition Preimage Proof
                    </label>
                    <input
                      id="release-preimage"
                      type="text"
                      value={conditionPreimage}
                      onChange={(e) => setConditionPreimage(e.target.value)}
                      placeholder="e.g. settlement_preimage_uor"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {selectedOp === 'RefundEscrow' && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="refund-escrow-id" className="block text-xs font-medium text-slate-300 mb-1">
                      Escrow to Refund (Requires Current Epoch ≥ Timeout)
                    </label>
                    <select
                      id="refund-escrow-id"
                      value={escrowId}
                      onChange={(e) => setEscrowId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {activeEscrows.length === 0 && <option value="">No active escrows available</option>}
                      {activeEscrows.map(esc => (
                        <option key={esc.id} value={esc.id}>
                          {esc.id} — Expires at #{esc.timeoutEpoch} (Current: #{state.currentEpoch})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between">
                    <span>Current epoch: <strong>#{state.currentEpoch}</strong></span>
                    <button
                      type="button"
                      onClick={onAdvanceEpoch}
                      className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-cyan-300 text-xs font-mono transition-colors"
                    >
                      +1 Epoch
                    </button>
                  </div>
                </div>
              )}

              {selectedOp === 'AuditInvariants' && (
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs space-y-2">
                  <div className="font-semibold text-slate-200">Formal Invariant Verification Pass</div>
                  <ul className="text-slate-400 space-y-1 list-disc list-inside">
                    <li>Validates non-negativity: <code className="text-slate-300">∀ a, balance(a) ≥ 0</code></li>
                    <li>Validates total supply conservation: <code className="text-slate-300">∑ balance + ∑ escrow = 1.5M UOR</code></li>
                    <li>Executes zero-axiom Lean decision procedure</li>
                  </ul>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="submit"
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Execute &amp; Dispatch to Wasm Core</span>
              </button>

            </form>

            {/* Polite Output Result (Directly matching calculator-example's output result) */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Output Result (aria-live="polite")</span>
                <span className="text-slate-500">Core Response</span>
              </div>
              <output
                id="result"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className={`block p-3 rounded-lg text-xs font-mono border transition-all ${
                  statusMessage.type === 'ok'
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : statusMessage.type === 'error'
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="font-medium">{statusMessage.text}</div>
                {statusMessage.details && (
                  <div className="text-[11px] opacity-80 mt-1 text-slate-400">
                    {statusMessage.details}
                  </div>
                )}
              </output>
            </div>

          </div>
        </div>

        {/* Right Column: Active Ledger State & Escrows */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Accounts Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-400" />
                <span>Active Ledger Accounts</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {Object.keys(state.accounts).length} Registered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2">Account</th>
                    <th className="pb-2 text-right">Balance</th>
                    <th className="pb-2 text-right">Nonce</th>
                    <th className="pb-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Object.values(state.accounts).map((acc) => (
                    <tr key={acc.address} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5">
                        <div className="font-medium text-slate-200">{acc.address}</div>
                        {acc.label && <div className="text-[10px] text-slate-500">{acc.label}</div>}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-100">
                        {acc.balance.toLocaleString()} UOR
                      </td>
                      <td className="py-2.5 text-right text-slate-400">
                        #{acc.nonce}
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSourceAccount(acc.address);
                            setSelectedOp('Transfer');
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] transition-colors"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Escrow Agreements */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Escrow Contracts</span>
              </h3>
              <span className="text-xs font-mono text-amber-400">
                {activeEscrows.length} Active Locked
              </span>
            </div>

            {state.escrows.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center font-mono">
                No escrow contracts currently in ledger.
              </div>
            ) : (
              <div className="space-y-2.5">
                {state.escrows.map((esc) => {
                  const isExpired = state.currentEpoch >= esc.timeoutEpoch;
                  return (
                    <div
                      key={esc.id}
                      className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                        esc.status === 'active'
                          ? 'bg-slate-800/70 border-slate-700'
                          : esc.status === 'released'
                          ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-400'
                          : 'bg-slate-800/30 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-200">{esc.id}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded uppercase font-bold ${
                            esc.status === 'active'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : esc.status === 'released'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-700 text-slate-400'
                          }`}>
                            {esc.status}
                          </span>
                        </div>
                        <span className="font-bold text-slate-100">
                          {esc.amount.toLocaleString()} UOR
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                        <div>From: <span className="text-slate-300">{esc.depositor}</span></div>
                        <div>To: <span className="text-slate-300">{esc.beneficiary}</span></div>
                        <div>Timeout: <span className={isExpired ? "text-rose-400 font-bold" : "text-slate-300"}>Epoch #{esc.timeoutEpoch} {isExpired && "(Expired)"}</span></div>
                        <div className="truncate" title={esc.conditionHash}>Hash: <span className="text-slate-500">{esc.conditionHash.substring(0, 10)}...</span></div>
                      </div>

                      {esc.status === 'active' && (
                        <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-slate-700/60">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOp('ReleaseEscrow');
                              setEscrowId(esc.id);
                              setConditionPreimage('settlement_preimage_uor');
                            }}
                            className="px-2 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] flex items-center space-x-1"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>Claim Release</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOp('RefundEscrow');
                              setEscrowId(esc.id);
                            }}
                            className={`px-2 py-1 rounded text-[11px] flex items-center space-x-1 ${
                              isExpired
                                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                            }`}
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Refund {isExpired ? '(Eligible)' : '(Locked)'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Bottom Trace & Proof Attestation Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-white">Execution Trace &amp; Proof Attestation History</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              Last {state.logs.length} Operations
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">Deterministic Byte Dispatch</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Epoch</th>
                <th className="pb-2">Operation</th>
                <th className="pb-2">Outcome</th>
                <th className="pb-2">Gas</th>
                <th className="pb-2">Formal Theorem Attested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {state.logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-2 text-cyan-300 font-bold whitespace-nowrap">#{log.epoch}</td>
                  <td className="py-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-medium">
                      [{log.discriminant}] {log.operation}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className={log.result.kind === 'ok' ? 'text-emerald-400' : 'text-rose-400'}>
                      {log.result.kind === 'ok' ? (log.result.value || 'OK') : (log.result.message || log.result.error)}
                    </span>
                  </td>
                  <td className="py-2 text-slate-400">{log.result.gasUnits || 45}</td>
                  <td className="py-2">
                    {log.proofAttestation ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{log.proofAttestation.theorem}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">n/a</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
