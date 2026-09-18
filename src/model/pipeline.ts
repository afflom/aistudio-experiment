/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BuildStage } from '../types';
import { VAULT_PROVENANCE } from './vaultSource';

export const INITIAL_PIPELINE_STAGES: BuildStage[] = [
  {
    id: 'check',
    name: '1. Model Syntax & Snapshot Check',
    command: 'prismpm --project . check',
    description: 'Validates prismpm.toml, lexlean.toml, AST structure, and entity limits against LexLean 1.1.',
    status: 'pending',
    logs: []
  },
  {
    id: 'lexlean',
    name: '2. LexLean Elaboration & Proof Check',
    command: 'lexlean build --target lean4',
    description: 'Elaborates .lex.tex into Lean 4.32.1 AST, replays theorems via leanchecker, and checks axioms.',
    status: 'pending',
    logs: []
  },
  {
    id: 'lcnf',
    name: '3. lean4-prod LCNF Root Extraction',
    command: 'lean4-prod export --roots PrismVault.Vault.dispatchBytes',
    description: 'Extracts named runtime roots into monomorphic LCNF intermediate representation.',
    status: 'pending',
    logs: []
  },
  {
    id: 'codegen',
    name: '4. Core-Wasm & View Generation',
    command: 'prismpm codegen --target core-wasm --target cargo',
    description: 'Generates import-free hologram:guest/core-wasm@1 and Cargo crate package prism-vault-0.1.0.crate.',
    status: 'pending',
    logs: []
  },
  {
    id: 'hologram',
    name: '5. Hologram v4 Binary Packaging',
    command: 'prismpm holo compose --output .prism/build/Vault.holo',
    description: 'Composes binary Hologram v4 container (HOLO\\x04\\x00), calculates SHA-256 digests, and generates provenance.json.',
    status: 'pending',
    logs: []
  },
  {
    id: 'verify',
    name: '6. Hologram Live Oracle Acceptance',
    command: 'prismpm verify --oracle hologram-live',
    description: 'Executes portable View intents, validates acceptance vectors, and verifies state idempotency.',
    status: 'pending',
    logs: []
  }
];

export interface StageExecutionResult {
  stageId: string;
  logs: string[];
  durationMs: number;
  outputs?: { name: string; size: string; digest: string }[];
}

export function simulateStageExecution(stageId: string): StageExecutionResult {
  switch (stageId) {
    case 'check':
      return {
        stageId,
        durationMs: 240,
        logs: [
          '[INFO] Reading prismpm.toml spec: "prismpm/project/1"',
          '[INFO] Project name: "Vault", lexlean_project: "lexlean.toml"',
          '[INFO] Limits check: max_holo_bytes=16,777,216, max_entities=100,000, max_diagnostics=256',
          '[INFO] Parsing src/Vault.lex.tex (LexLean semantic module)...',
          '[INFO] Loaded 6 operations, 7 error constructors, 4 record types, 4 verified theorems.',
          '[OK] Project boundary and AST limits passed. 0 syntax diagnostics emitted.'
        ],
        outputs: [
          { name: '.prism/snapshot.json', size: '14.8 KB', digest: 'sha256:7f3a1...9b2c' }
        ]
      };

    case 'lexlean':
      return {
        stageId,
        durationMs: 480,
        logs: [
          '[INFO] Invoking LexLean 1.1 with leanprover/lean4:v4.32.1',
          '[INFO] Elaborating inductive declarations: Operation, VaultError, EscrowStatus, ProtocolError',
          '[INFO] Elaborating structures: Account, EscrowRecord, VaultView, VaultApplication',
          '[CHECK] Verifying theorem: transferConservation... PROVED (omega tactic, 0 axioms violated)',
          '[CHECK] Verifying theorem: balanceNonNegativity... PROVED (structural induction, 0 axioms violated)',
          '[CHECK] Verifying theorem: escrowConservation... PROVED (case split, 0 axioms violated)',
          '[CHECK] Verifying theorem: auditInvariantSoundness... PROVED (decision procedure soundness)',
          '[OK] Replay verified through leanchecker. All 4 theorems proved without ungrounded axioms.'
        ],
        outputs: [
          { name: '.lexlean/Vault.lean', size: '28.4 KB', digest: 'sha256:3a91c...08fe' },
          { name: '.lexlean/leanchecker.log', size: '3.1 KB', digest: 'sha256:d14ef...82aa' }
        ]
      };

    case 'lcnf':
      return {
        stageId,
        durationMs: 310,
        logs: [
          '[INFO] Scanning named runtime root: PrismVault.Vault.dispatchBytes',
          '[INFO] Monomorphizing Nat, UInt64, UInt32, and List data constructors',
          '[INFO] Erasing Prop fields and ghost proofs for zero-cost runtime execution',
          '[INFO] Checking canonicalIndexes buffer safety and allocation bounds: max 65,536 bytes',
          '[OK] Extracted complete LCNF graph for 1 named runtime root. 0 dead branches.'
        ],
        outputs: [
          { name: '.prism/lcnf/dispatchBytes.lcnf', size: '19.2 KB', digest: 'sha256:8b09f...41e2' }
        ]
      };

    case 'codegen':
      return {
        stageId,
        durationMs: 520,
        logs: [
          '[INFO] Generating import-free hologram:guest/core-wasm@1 target...',
          '[INFO] Core contract: 0 imports, memory export "memory", function export "dispatchBytes"',
          '[INFO] Request maximum: 52 bytes, Response maximum: 32 bytes',
          '[INFO] Packaging Cargo crate: cargo/prism-vault-0.1.0.crate',
          '[INFO] Emitting portable HOLOVIEW view manifest & Pages HTML/JS adapter',
          '[OK] Core-Wasm compiled (44,120 bytes), Cargo crate packaged (18,450 bytes).'
        ],
        outputs: [
          { name: 'core-wasm/prism_vault_core_wasm.wasm', size: '44.1 KB', digest: `sha256:${VAULT_PROVENANCE.adapter_wasm_sha256.substring(0, 16)}...` },
          { name: 'cargo/prism-vault-0.1.0.crate', size: '18.5 KB', digest: `sha256:${VAULT_PROVENANCE.generated_core_sha256.substring(0, 16)}...` },
          { name: 'view/manifest.json', size: '2.8 KB', digest: `sha256:${VAULT_PROVENANCE.view_manifest_sha256.substring(0, 16)}...` }
        ]
      };

    case 'hologram':
      return {
        stageId,
        durationMs: 390,
        logs: [
          '[INFO] Composing binary Hologram v4 container...',
          '[INFO] Writing magic header: 0x48 0x4F 0x4C 0x4F 0x04 0x00 ("HOLO\\x04\\x00")',
          '[INFO] Layer 0: Core-Wasm byte payload (primary guest)',
          '[INFO] Layer 1: Evaluated View manifest (portable presentation profile)',
          '[INFO] Generating public/provenance.json with cryptographic SHA-256 bindings',
          '[OK] Vault.holo compiled cleanly. Final archive size: 68,912 bytes.'
        ],
        outputs: [
          { name: '.prism/build/Vault.holo', size: '68.9 KB', digest: `sha256:${VAULT_PROVENANCE.model_id.substring(0, 16)}...` },
          { name: 'public/provenance.json', size: '656 bytes', digest: `sha256:${VAULT_PROVENANCE.adapter_lock_sha256.substring(0, 16)}...` }
        ]
      };

    case 'verify':
      return {
        stageId,
        durationMs: 440,
        logs: [
          '[INFO] Opening .prism/build/Vault.holo in Hologram Live headless oracle',
          '[TEST] Executing modeled vector #1 (Transfer Alice -> Bob: 15,000 UOR)... PASS',
          '[TEST] Executing modeled vector #2 (Transfer Insufficient funds check)... PASS (error: insufficient-funds)',
          '[TEST] Executing modeled vector #3 (LockEscrow with timeout)... PASS (active escrow created)',
          '[TEST] Executing modeled vector #4 (AuditInvariants total solvency)... PASS (supply conserved)',
          '[TEST] Testing display-independent portable surface detach and idempotent shutdown... PASS',
          '[OK] All 4 acceptance vectors verified. Emitted prismpm/application-acceptance/1.'
        ],
        outputs: [
          { name: '.prism/verified/acceptance.json', size: '4.2 KB', digest: 'sha256:91ca0...33bd' }
        ]
      };

    default:
      return { stageId, durationMs: 100, logs: ['[ERROR] Unknown stage'] };
  }
}
