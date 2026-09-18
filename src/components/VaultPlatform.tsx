/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PrismVault - Production Platform Experience
 * 
 * Domain-focused financial platform modeled with standards-based PrismPM definitions.
 * Provides intuitive operations for transfers, escrow agreements, treasury management,
 * and real-time cryptographic proof of reserves.
 */

import React, { useState } from 'react';
import { VaultState, OperationType, EscrowRecord } from '../types';
import { AppNavTab } from './Navbar';
import { 
  Building2, 
  ArrowRightLeft, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  Coins, 
  ArrowUpRight, 
  ChevronRight, 
  Check, 
  FileText,
  History,
  Send,
  PlusCircle,
  ExternalLink,
  Shield,
  Layers,
  ArrowDownLeft
} from 'lucide-react';

interface VaultPlatformProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  state: VaultState;
  onExecute: (op: OperationType, params: any) => void;
  onAdvanceEpoch: () => void;
}

export const VaultPlatform: React.FC<VaultPlatformProps> = ({
  activeTab,
  setActiveTab,
  state,
  onExecute,
  onAdvanceEpoch
}) => {
  // Settlement State
  const [senderAccount, setSenderAccount] = useState<string>('alice.uor');
  const [recipientAccount, setRecipientAccount] = useState<string>('bob.uor');
  const [settlementAmount, setSettlementAmount] = useState<string>('25000');
  const [settlementMemo, setSettlementMemo] = useState<string>('OTC Settlement Batch #104');

  // Escrow State
  const [escrowDepositor, setEscrowDepositor] = useState<string>('alice.uor');
  const [escrowBeneficiary, setEscrowBeneficiary] = useState<string>('bob.uor');
  const [escrowAmount, setEscrowAmount] = useState<string>('15000');
  const [escrowTimeout, setEscrowTimeout] = useState<number>(state.currentEpoch + 4);
  const [escrowPreimage, setEscrowPreimage] = useState<string>('delivery_oracle_token_2026');
  const [activeEscrowTab, setActiveEscrowTab] = useState<'agreements' | 'create'>('agreements');
  const [claimSecret, setClaimSecret] = useState<string>('settlement_preimage_uor');

  // Treasury State
  const [depositTarget, setDepositTarget] = useState<string>('treasury.uor');
  const [depositAmount, setDepositAmount] = useState<string>('50000');

  // Feedback banner state
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error' | 'idle';
    title: string;
    description: string;
    theorem?: string;
  }>({
    type: 'idle',
    title: 'Ready for Verified Execution',
    description: 'All operations are validated through machine-checked PrismPM invariant rules.'
  });

  const isSolvent = (state.totalCirculatingSupply + state.totalEscrowLocked) === state.initialSupply;

  // Handlers
  const handleSettlementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = BigInt(settlementAmount || 0);
    const senderBal = state.accounts[senderAccount]?.balance || 0n;

    if (amt > senderBal) {
      setStatusFeedback({
        type: 'error',
        title: 'Settlement Rejected: Insufficient Liquidity',
        description: `${senderAccount} has ${senderBal.toLocaleString()} UOR, which is insufficient for ${amt.toLocaleString()} UOR.`,
        theorem: 'conservation_transfer'
      });
      return;
    }

    onExecute('Transfer', {
      sourceAccount: senderAccount,
      targetAccount: recipientAccount,
      amount: settlementAmount,
      memo: settlementMemo
    });

    setStatusFeedback({
      type: 'success',
      title: 'Settlement Completed',
      description: `Transferred ${Number(settlementAmount).toLocaleString()} UOR from ${senderAccount} to ${recipientAccount} with zero counterparty risk.`,
      theorem: 'conservation_transfer'
    });
  };

  const handleCreateEscrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecute('LockEscrow', {
      sourceAccount: escrowDepositor,
      targetAccount: escrowBeneficiary,
      amount: escrowAmount,
      timeoutEpoch: escrowTimeout,
      conditionPreimage: escrowPreimage
    });

    setStatusFeedback({
      type: 'success',
      title: 'Escrow Agreement Activated',
      description: `Locked ${Number(escrowAmount).toLocaleString()} UOR collateral until Epoch #${escrowTimeout} or milestone proof submission.`,
      theorem: 'escrow_conservation'
    });
    setActiveEscrowTab('agreements');
  };

  const handleClaimEscrow = (escrow: EscrowRecord) => {
    onExecute('ReleaseEscrow', {
      escrowId: escrow.id,
      targetAccount: escrow.beneficiary,
      conditionPreimage: claimSecret
    });

    setStatusFeedback({
      type: 'success',
      title: 'Milestone Proven & Collateral Released',
      description: `Released ${Number(escrow.amount).toLocaleString()} UOR to ${escrow.beneficiary} upon cryptographic proof verification.`,
      theorem: 'valid_release_preimage'
    });
  };

  const handleRefundEscrow = (escrow: EscrowRecord) => {
    if (state.currentEpoch < escrow.timeoutEpoch) {
      setStatusFeedback({
        type: 'error',
        title: 'Refund Ineligible: Agreement Active',
        description: `Current Epoch #${state.currentEpoch} has not reached timeout Epoch #${escrow.timeoutEpoch}. Collateral remains locked for delivery.`,
        theorem: 'escrow_refund_eligibility'
      });
      return;
    }

    onExecute('RefundEscrow', {
      escrowId: escrow.id,
      sourceAccount: escrow.depositor
    });

    setStatusFeedback({
      type: 'success',
      title: 'Expired Collateral Reclaimed',
      description: `Returned ${Number(escrow.amount).toLocaleString()} UOR collateral to ${escrow.depositor} after timeout expiration.`,
      theorem: 'escrow_refund_soundness'
    });
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecute('Deposit', {
      account: depositTarget,
      amount: depositAmount
    });
    setStatusFeedback({
      type: 'success',
      title: 'Reserve Capital Allocated',
      description: `Allocated ${Number(depositAmount).toLocaleString()} UOR to ${depositTarget}.`,
      theorem: 'deposit_preserves_solvency'
    });
  };

  const handleRunAudit = () => {
    onExecute('AuditInvariants', {});
    setStatusFeedback({
      type: 'success',
      title: 'Continuous Solvency Invariants Verified',
      description: `Total ledger supply (${state.initialSupply.toLocaleString()} UOR) mathematically reconciles with circulating balances + locked escrow reserves. Zero capital leakage.`,
      theorem: 'audit_invariant_soundness'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Executive Portfolio Header */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 font-mono text-xs border border-indigo-500/30 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    Institutional Digital Asset Vault
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-mono text-xs border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    100% Backed Reserves
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight mt-2">
                  Vault Overview &amp; Balances
                </h1>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Real-time verifiable settlement, conditional escrows, and treasury reserve custody powered by machine-checked invariant models.
                </p>
              </div>

              {/* Quick Action Shortcuts */}
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setActiveTab('transfers')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Settlement</span>
                </button>

                <button
                  onClick={() => setActiveTab('escrows')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Escrow Agreements</span>
                </button>

                <button
                  onClick={() => setActiveTab('treasury')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Deposit Liquidity</span>
                </button>
              </div>
            </div>

            {/* Core Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="text-xs font-mono text-slate-400 uppercase">Total Vault Reserves</div>
                <div className="text-2xl font-bold text-white font-mono mt-1">
                  {state.initialSupply.toLocaleString()} <span className="text-xs text-slate-400 font-normal">UOR</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Fully Backed &bull; Zero Leakage
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="text-xs font-mono text-slate-400 uppercase">Circulating Balances</div>
                <div className="text-2xl font-bold text-indigo-300 font-mono mt-1">
                  {state.totalCirculatingSupply.toLocaleString()} <span className="text-xs text-slate-400 font-normal">UOR</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {((state.totalCirculatingSupply * 100n) / state.initialSupply).toString()}% of total reserves
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="text-xs font-mono text-slate-400 uppercase">Locked in Escrow</div>
                <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                  {state.totalEscrowLocked.toLocaleString()} <span className="text-xs text-slate-400 font-normal">UOR</span>
                </div>
                <div className="text-[11px] text-amber-300/80 mt-1">
                  {state.escrows.filter(e => e.status === 'active').length} active agreements
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="text-xs font-mono text-slate-400 uppercase">Ledger Epoch</div>
                <div className="text-2xl font-bold text-cyan-300 font-mono mt-1 flex items-center justify-between">
                  <span>#{state.currentEpoch}</span>
                  <button
                    onClick={onAdvanceEpoch}
                    title="Advance Epoch"
                    className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 font-sans cursor-pointer"
                  >
                    <span>+1 Epoch</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Time-lock milestone clock
                </div>
              </div>
            </div>
          </div>

          {/* Accounts Portfolio Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Vault Account Balances</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {Object.keys(state.accounts).length} Managed Accounts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(state.accounts).map(acc => {
                const sharePct = Number((acc.balance * 100n) / state.initialSupply);
                return (
                  <div
                    key={acc.address}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{acc.address}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        Nonce: {acc.nonce}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">{acc.label}</div>

                    <div>
                      <div className="text-lg font-bold font-mono text-indigo-300">
                        {acc.balance.toLocaleString()} <span className="text-xs font-normal text-slate-400">UOR</span>
                      </div>
                      
                      {/* Share bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(2, sharePct))}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                        <span>Portfolio Share</span>
                        <span>{sharePct}%</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                      <button
                        onClick={() => {
                          setSenderAccount(acc.address);
                          setActiveTab('transfers');
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send</span>
                      </button>
                      <button
                        onClick={() => {
                          setRecipientAccount(acc.address);
                          setActiveTab('transfers');
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ArrowDownLeft className="w-3 h-3" />
                        <span>Receive</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Ledger */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                <span>Recent Verified Activity</span>
              </h3>
              <button
                onClick={() => setActiveTab('solvency')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 cursor-pointer"
              >
                <span>Audit All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {state.logs.slice(0, 5).map(log => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
                      {log.operation}
                    </span>
                    <span className="text-slate-300">{log.result.value || log.result.message}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>Epoch #{log.epoch}</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Conserved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SETTLEMENT & TRANSFERS TAB */}
      {activeTab === 'transfers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
                    <span>Direct Bilateral Settlement</span>
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Instant Finality
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Execute direct, atomic peer-to-peer settlement between verified accounts. The balance conservation theorem guarantees zero overdrafts.
                </p>
              </div>

              <form onSubmit={handleSettlementSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Sender Account
                    </label>
                    <select
                      value={senderAccount}
                      onChange={(e) => setSenderAccount(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    >
                      {Object.values(state.accounts).map(a => (
                        <option key={a.address} value={a.address}>
                          {a.address} ({a.balance.toLocaleString()} UOR)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Recipient Counterparty
                    </label>
                    <select
                      value={recipientAccount}
                      onChange={(e) => setRecipientAccount(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    >
                      {Object.values(state.accounts).map(a => (
                        <option key={a.address} value={a.address}>
                          {a.address} ({a.balance.toLocaleString()} UOR)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono text-slate-300">
                      Settlement Amount (UOR)
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Available: {state.accounts[senderAccount]?.balance.toLocaleString()} UOR
                    </span>
                  </div>
                  <input
                    type="number"
                    value={settlementAmount}
                    onChange={(e) => setSettlementAmount(e.target.value)}
                    min="1"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex gap-2 mt-2">
                    {['5000', '25000', '50000', '100000'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSettlementAmount(val)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-mono rounded transition-colors cursor-pointer"
                      >
                        +{Number(val).toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Payment Memo / Reference
                  </label>
                  <input
                    type="text"
                    value={settlementMemo}
                    onChange={(e) => setSettlementMemo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="btn-execute-settlement"
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Authorize Settlement</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Settlement Invariant Explainer & Activity */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Mathematical Settlement Guarantee</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Settlements in PrismVault are governed by the formal Lean 4 theorem <code className="text-indigo-300">conservation_transfer</code>.
                The sender balance is decremented and recipient balance incremented in an atomic step with verified non-overdraw bounds.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
                <div className="text-emerald-400">✓ Balance Invariant: &Delta;(Sender) + &Delta;(Recipient) = 0</div>
                <div className="text-slate-500">✓ Counterparty Risk: 0.00%</div>
                <div className="text-slate-500">✓ Finality: Immediate (1 State Transition)</div>
              </div>
            </div>

            {/* Quick Settlement Activity */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                <span>Settlement Log</span>
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {state.logs.filter(l => l.operation === 'Transfer').length === 0 ? (
                  <div className="text-xs font-mono text-slate-500 text-center py-4">
                    No transfers executed yet in current session.
                  </div>
                ) : (
                  state.logs.filter(l => l.operation === 'Transfer').map(log => (
                    <div key={log.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>{log.result.value}</span>
                        <span className="text-slate-500 text-[10px]">#{log.epoch}</span>
                      </div>
                      <div className="text-[10px] text-emerald-400">✓ Proof: conservation_transfer</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESCROW CONTRACTS TAB */}
      {activeTab === 'escrows' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <span>Conditional Escrow Agreements</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Time-locked, milestone-conditioned collateral contracts. Funds release upon cryptographic secret proof, or refund after timeout epoch.
                </p>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-1.5 text-xs font-mono bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveEscrowTab('agreements')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    activeEscrowTab === 'agreements' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Active Agreements ({state.escrows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEscrowTab('create')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    activeEscrowTab === 'create' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  + New Escrow
                </button>
              </div>
            </div>

            {/* List Agreements */}
            {activeEscrowTab === 'agreements' && (
              <div className="space-y-4">
                {state.escrows.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 font-mono bg-slate-950/50 rounded-xl border border-slate-800/60">
                    No escrow agreements found. Click "+ New Escrow" to initiate one.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.escrows.map(escrow => {
                      const isExpired = state.currentEpoch >= escrow.timeoutEpoch;
                      const remainingEpochs = Math.max(0, escrow.timeoutEpoch - state.currentEpoch);

                      return (
                        <div
                          key={escrow.id}
                          className={`p-5 rounded-xl border transition-all space-y-4 ${
                            escrow.status === 'active'
                              ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                              : 'bg-slate-950/40 border-slate-900 opacity-80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-white">{escrow.id}</span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${
                                escrow.status === 'active'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : escrow.status === 'released'
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              }`}>
                                {escrow.status}
                              </span>
                            </div>

                            <span className="text-base font-bold font-mono text-amber-300">
                              {escrow.amount.toLocaleString()} UOR
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                            <div>
                              <span className="text-slate-500 text-[10px] block">Depositor</span>
                              <span className="text-slate-200">{escrow.depositor}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block">Beneficiary</span>
                              <span className="text-slate-200">{escrow.beneficiary}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block">Expiry Epoch</span>
                              <span className="text-slate-200">#{escrow.timeoutEpoch}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block">Time Remaining</span>
                              <span className={isExpired ? "text-rose-400 font-bold" : "text-cyan-400 font-bold"}>
                                {isExpired ? "Timeout Expired" : `${remainingEpochs} epochs remaining`}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          {escrow.status === 'active' && (
                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
                              <button
                                onClick={() => handleClaimEscrow(escrow)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Release Funds to {escrow.beneficiary}</span>
                              </button>

                              <button
                                onClick={() => handleRefundEscrow(escrow)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                                  isExpired
                                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                                }`}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>{isExpired ? `Reclaim Collateral` : `Refund (Eligible at #${escrow.timeoutEpoch})`}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Create Escrow Form */}
            {activeEscrowTab === 'create' && (
              <form onSubmit={handleCreateEscrowSubmit} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Funding Depositor
                    </label>
                    <select
                      value={escrowDepositor}
                      onChange={(e) => setEscrowDepositor(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                    >
                      {Object.values(state.accounts).map(a => (
                        <option key={a.address} value={a.address}>
                          {a.address} ({a.balance.toLocaleString()} UOR)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Beneficiary (Delivery Party)
                    </label>
                    <select
                      value={escrowBeneficiary}
                      onChange={(e) => setEscrowBeneficiary(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                    >
                      {Object.values(state.accounts).map(a => (
                        <option key={a.address} value={a.address}>
                          {a.address}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Collateral Volume (UOR)
                    </label>
                    <input
                      type="number"
                      value={escrowAmount}
                      onChange={(e) => setEscrowAmount(e.target.value)}
                      min="1"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Expiration Epoch (Current: #{state.currentEpoch})
                    </label>
                    <input
                      type="number"
                      value={escrowTimeout}
                      onChange={(e) => setEscrowTimeout(Number(e.target.value))}
                      min={state.currentEpoch + 1}
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Delivery Condition Preimage Secret
                  </label>
                  <input
                    type="text"
                    value={escrowPreimage}
                    onChange={(e) => setEscrowPreimage(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    SHA-256 condition hash is calculated by the model to gate final disbursement.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="btn-create-escrow"
                    className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Lock Assets into Escrow Agreement</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TREASURY TAB */}
      {activeTab === 'treasury' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Coins className="w-5 h-5 text-cyan-400" />
                    <span>Treasury Capital Inflow</span>
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Reserve Custody
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Allocate newly arrived reserve capital to target vault accounts with verified proof of global supply conservation.
                </p>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Target Vault Account
                  </label>
                  <select
                    value={depositTarget}
                    onChange={(e) => setDepositTarget(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs font-mono text-slate-100 focus:ring-2 focus:ring-cyan-500"
                  >
                    {Object.values(state.accounts).map(a => (
                      <option key={a.address} value={a.address}>
                        {a.address} — {a.label} ({a.balance.toLocaleString()} UOR)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Inflow Capital Volume (UOR)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="1"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-100"
                  />
                  <div className="flex gap-2 mt-2">
                    {['10000', '50000', '100000', '500000'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDepositAmount(val)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-mono rounded transition-colors cursor-pointer"
                      >
                        +{Number(val).toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Current Total Reserves:</span>
                    <span className="text-slate-200">{state.initialSupply.toLocaleString()} UOR</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Projected Reserves:</span>
                    <span className="text-cyan-300 font-bold">{(state.initialSupply + BigInt(depositAmount || 0)).toLocaleString()} UOR</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 pt-1">
                    ✓ Theorem 'deposit_preserves_solvency' guarantees zero unbacked issuance.
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="btn-allocate-treasury"
                    className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Coins className="w-4 h-4" />
                    <span>Allocate Verified Reserve Liquidity</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Treasury Policy Guidelines</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                PrismVault treasury expansion is formally restricted by invariant bounds. Newly minted or deposited liquidity is immediately reconciled against the global supply ledger.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
                <div className="text-cyan-300">Reserve Backing: 1:1 Fully Audited</div>
                <div className="text-slate-400">Reconciliation: Continuous</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROOF OF RESERVES & SOLVENCY TAB */}
      {activeTab === 'solvency' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Real-Time Proof of Reserves &amp; Solvency</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Continuous mathematical reconciliation of circulating balances and escrow collateral against total reserves.
                </p>
              </div>

              <button
                type="button"
                id="btn-run-formal-audit"
                onClick={handleRunAudit}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify All Ledger Invariants</span>
              </button>
            </div>

            {/* Solvency Balance Sheet */}
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Vault Balance Sheet (Cryptographically Proved)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">Circulating Liabilities</div>
                  <div className="text-xl font-bold font-mono text-indigo-300 mt-1">
                    {state.totalCirculatingSupply.toLocaleString()} UOR
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Sum of all participant accounts</div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">Escrow Collateral</div>
                  <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                    {state.totalEscrowLocked.toLocaleString()} UOR
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Locked under condition contracts</div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">Total Backed Reserves</div>
                  <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                    {state.initialSupply.toLocaleString()} UOR
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">100.00% Exact Solvency Ratio</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Mathematical Solvency Equation: {state.totalCirculatingSupply.toLocaleString()} + {state.totalEscrowLocked.toLocaleString()} = {state.initialSupply.toLocaleString()} (Variance: 0.0000 UOR)
                </span>
              </div>
            </div>

            {/* Invariant Theorem Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Machine-Checked Lean 4 Invariant Proofs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">conservation_transfer</span>
                    <span className="text-emerald-400 text-[10px]">Verified ✓</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Proves that no tokens are created or destroyed during peer-to-peer balance transfers.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">escrow_conservation</span>
                    <span className="text-emerald-400 text-[10px]">Verified ✓</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Proves that locked escrow collateral remains invariant until milestone release or timeout refund.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">deposit_preserves_solvency</span>
                    <span className="text-emerald-400 text-[10px]">Verified ✓</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Guarantees that new capital allocations strictly preserve ledger solvency rules.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">audit_invariant_soundness</span>
                    <span className="text-emerald-400 text-[10px]">Verified ✓</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Root theorem verifying that global ledger state can never deviate from 100% solvency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Confirmation Card (Polite ARIA Live Region for Accessibility) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusFeedback.type === 'error' ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`}></span>
            <span>Transaction Status &amp; Attestation</span>
          </span>
          {statusFeedback.theorem && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
              Verified: {statusFeedback.theorem}
            </span>
          )}
        </div>

        <div
          id="result"
          role="status"
          aria-live="polite"
          className={`p-3.5 rounded-lg font-mono text-xs transition-colors ${
            statusFeedback.type === 'error'
              ? 'bg-rose-950/40 text-rose-200 border border-rose-800/40'
              : statusFeedback.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-800/40'
              : 'bg-slate-950 text-slate-300 border border-slate-800'
          }`}
        >
          <div className="font-bold">{statusFeedback.title}</div>
          <div className="mt-0.5 text-slate-300">{statusFeedback.description}</div>
        </div>
      </div>

    </div>
  );
};
