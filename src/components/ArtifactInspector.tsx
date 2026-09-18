/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VAULT_PROVENANCE } from '../model/vaultSource';
import { Binary, Box, FileText, Cpu, CheckCircle2, ChevronRight, Play } from 'lucide-react';

export const ArtifactInspector: React.FC = () => {
  const [selectedSubTab, setSelectedSubTab] = useState<'holo' | 'wasm' | 'provenance' | 'cargo'>('holo');
  
  // Wasm byte dispatch tester state
  const [testOp, setTestOp] = useState<number>(1); // 1 = Transfer
  const [testArg1, setTestArg1] = useState<string>('alice.uor');
  const [testArg2, setTestArg2] = useState<string>('bob.uor');
  const [testAmount, setTestAmount] = useState<string>('25000');
  const [dispatchResult, setDispatchResult] = useState<{
    requestHex: string;
    responseHex: string;
    status: 'ok' | 'error';
    decoded: string;
    cycles: number;
  } | null>(null);

  // Generate simulated dispatch bytes
  const handleSimulateDispatch = () => {
    // Construct byte buffer representation:
    // [1 byte: opCode] [1 byte: senderLen] [N bytes: sender] [1 byte: targetLen] [M bytes: target] [8 bytes: amount big-endian]
    const opByte = testOp.toString(16).padStart(2, '0');
    const srcBytes = Array.from(testArg1).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
    const tgtBytes = Array.from(testArg2).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
    const amtBig = BigInt(testAmount || '0');
    const amtHex = amtBig.toString(16).padStart(16, '0').match(/.{2}/g)?.join(' ') || '00';

    const reqHex = `${opByte} ${(testArg1.length).toString(16).padStart(2, '0')} ${srcBytes} ${(testArg2.length).toString(16).padStart(2, '0')} ${tgtBytes} ${amtHex}`;
    
    const isOk = amtBig > 0n && amtBig <= 250_000n;
    const respHex = isOk 
      ? `00 00 00 00 00 00 00 01 ${(amtBig).toString(16).padStart(16, '0').match(/.{2}/g)?.join(' ')}` 
      : `01 00 00 00 00 00 00 02 69 6e 73 75 66 66 69 63 69 65 6e 74 2d 66 75 6e 64 73`;

    setDispatchResult({
      requestHex: reqHex,
      responseHex: respHex,
      status: isOk ? 'ok' : 'error',
      decoded: isOk 
        ? `Result::Ok(25,000 UOR settled) -> Invariant transferConservation preserved.`
        : `Result::Err(VaultError::InsufficientFunds)`,
      cycles: 420
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-white">PrismPM Artifact &amp; Binary Inspector</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                Hologram v4 Specification
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              PrismPM packages the verified application into a single binary Hologram archive (<code className="text-slate-200">Vault.holo</code>)
              starting with canonical magic bytes <code className="text-slate-200">HOLO\x04\x00</code>. It contains the import-free
              Core-Wasm guest, evaluated View manifest, and cryptographic provenance locks.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              Magic: <code className="text-cyan-300">0x48 0x4F 0x4C 0x4F 0x04 0x00</code>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex space-x-2 mt-4 pt-4 border-t border-slate-800 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setSelectedSubTab('holo')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              selectedSubTab === 'holo' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Vault.holo (Binary Container)</span>
          </button>

          <button
            onClick={() => setSelectedSubTab('wasm')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              selectedSubTab === 'wasm' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Core-Wasm dispatchBytes Emulator</span>
          </button>

          <button
            onClick={() => setSelectedSubTab('provenance')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              selectedSubTab === 'provenance' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>public/provenance.json</span>
          </button>

          <button
            onClick={() => setSelectedSubTab('cargo')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              selectedSubTab === 'cargo' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Cargo.toml &amp; Crate Manifest</span>
          </button>
        </div>

      </div>

      {/* Tab Panels */}
      {selectedSubTab === 'holo' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>Hex Dump: .prism/build/Vault.holo (68,912 bytes total)</span>
            <span className="text-emerald-400">Canonical Header Verified</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 font-mono text-xs border border-slate-800 space-y-2">
            <div className="text-slate-500 text-[11px] mb-2">
              OFFSET   00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F  ASCII
            </div>
            <div className="text-slate-300">
              <span className="text-slate-500">00000000 </span>
              <span className="text-emerald-400 font-bold">48 4f 4c 4f 04 00 </span>
              <span className="text-indigo-400">01 00 00 00 02 00 00 00 00 00 </span>
              <span className="text-slate-400">|HOLO............|</span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-500">00000010 </span>
              <span className="text-cyan-400">00 61 73 6d 01 00 00 00 01 08 02 60 02 7f 7f 01 </span>
              <span className="text-slate-400">|.wasm......\`...|</span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-500">00000020 </span>
              <span className="text-cyan-400">7f 03 02 01 00 05 03 01 00 01 07 19 02 06 6d 65 </span>
              <span className="text-slate-400">|..............me|</span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-500">00000030 </span>
              <span className="text-cyan-400">6d 6f 72 79 02 00 0d 64 69 73 70 61 74 63 68 42 </span>
              <span className="text-slate-400">|mory...dispatchB|</span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-500">00000040 </span>
              <span className="text-cyan-400">79 74 65 73 00 00 0a 3d 01 3b 01 01 7f 20 00 41 </span>
              <span className="text-slate-400">|ytes..=.;... .A|</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <div className="font-semibold text-indigo-300 mb-1">Layer 0: Primary Guest Core-Wasm</div>
              <ul className="text-slate-400 space-y-1 text-[11px]">
                <li>• Contract: <code className="text-slate-200">hologram:guest/core-wasm@1</code></li>
                <li>• Imports: 0 (pure sandboxed deterministic WASM)</li>
                <li>• Exported Memory: <code className="text-slate-200">"memory"</code> (min 1 page, max 64KB)</li>
                <li>• Exported Function: <code className="text-slate-200">dispatchBytes(ptr, len) -&gt; uint32</code></li>
              </ul>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <div className="font-semibold text-amber-300 mb-1">Layer 1: View Layer Specification</div>
              <ul className="text-slate-400 space-y-1 text-[11px]">
                <li>• Presentation Target: <code className="text-slate-200">HologramPortable &amp; GithubPages</code></li>
                <li>• Style Token: <code className="text-slate-200">Compact, HighContrast, SystemSans</code></li>
                <li>• Live Mode: <code className="text-slate-200">LiveMode.Polite</code></li>
                <li>• Input Grammar: <code className="text-slate-200">AsciiAlphanumericAddress</code></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {selectedSubTab === 'wasm' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>Low-Level Core-Wasm Wire Simulator: dispatchBytes()</span>
            <span className="text-indigo-400">No Host Imports</span>
          </div>

          <p className="text-xs text-slate-300">
            PrismPM compiles the formal application root into a pure Core-WASM guest that exchanges raw byte buffers.
            Try formulating a binary request packet below and watch the Wasm dispatch engine decode and respond:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Operation Code</label>
              <select
                value={testOp}
                onChange={(e) => setTestOp(parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              >
                <option value={0}>0x00: Deposit</option>
                <option value={1}>0x01: Transfer</option>
                <option value={2}>0x02: LockEscrow</option>
                <option value={5}>0x05: AuditInvariants</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Sender Address</label>
              <input
                type="text"
                value={testArg1}
                onChange={(e) => setTestArg1(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Recipient Address</label>
              <input
                type="text"
                value={testArg2}
                onChange={(e) => setTestArg2(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Amount (Uint64)</label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>
          </div>

          <button
            onClick={handleSimulateDispatch}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono flex items-center space-x-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Wasm dispatchBytes(ptr, len)</span>
          </button>

          {dispatchResult && (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-2 mt-4">
              <div className="text-slate-400 text-[11px] uppercase tracking-wider">Dispatched Byte Payload:</div>
              <div className="text-indigo-400 bg-slate-900 p-2 rounded overflow-x-auto">
                <code>{dispatchResult.requestHex}</code>
              </div>

              <div className="text-slate-400 text-[11px] uppercase tracking-wider mt-2">Returned Core-Wasm Response Bytes:</div>
              <div className="text-emerald-400 bg-slate-900 p-2 rounded overflow-x-auto">
                <code>{dispatchResult.responseHex}</code>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-300">
                <span>Decoded: <strong>{dispatchResult.decoded}</strong></span>
                <span className="text-slate-500">Cycles: {dispatchResult.cycles}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedSubTab === 'provenance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>File: public/provenance.json (Normative Cryptographic Binding)</span>
            <span>Schema: {VAULT_PROVENANCE.schema}</span>
          </div>

          <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800/80">
            <code>{JSON.stringify(VAULT_PROVENANCE, null, 2)}</code>
          </pre>

          <p className="text-xs text-slate-400 font-mono">
            Every build locks the adapter wasm, Javascript bindings, generated core, model ID, and view manifest.
            Any tampering with bytecode causes verification gates to reject execution.
          </p>
        </div>
      )}

      {selectedSubTab === 'cargo' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>File: cargo/prism-vault-0.1.0/Cargo.toml (Generated Rust Crate)</span>
            <span>Edition: 2021</span>
          </div>

          <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800/80">
            <code>{`[package]
name = "prism-vault"
version = "0.1.0"
edition = "2021"
description = "Authoritative UOR Vault model generated by PrismPM and LexLean 1.1"
license = "Apache-2.0 OR MIT"
repository = "https://github.com/UOR-Foundation/PrismPM"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
prism-stdlib = { version = "0.3.0", default-features = false }

[profile.release]
opt-level = "z"
lto = true
codegen-units = 1
panic = "abort"`}</code>
          </pre>
        </div>
      )}

    </div>
  );
};
