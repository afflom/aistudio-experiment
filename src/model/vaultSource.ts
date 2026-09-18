/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrismpmTomlConfig, LexleanTomlConfig, ProvenanceMetadata, ViewOperation, FormalTheorem } from '../types';

export const VAULT_PRISMPM_TOML: PrismpmTomlConfig = {
  spec: "prismpm/project/1",
  project: "Vault",
  lexlean_project: "lexlean.toml",
  build_root: ".prism",
  limits: {
    max_holo_bytes: 16777216,
    max_entities: 100000,
    max_diagnostics: 256
  }
};

export const VAULT_LEXLEAN_TOML: LexleanTomlConfig = {
  spec: "lexlean/project/1",
  name: "prism-vault",
  language: "1.1",
  module_prefix: "PrismVault",
  source_roots: ["src"],
  entrypoints: ["src/Vault.lex.tex"],
  build_root: ".lexlean",
  lockfile: "lexlean.lock",
  lean_workspace: ".",
  lean_toolchain: "leanprover/lean4:v4.32.1"
};

export const VAULT_PROVENANCE: ProvenanceMetadata = {
  adapter_lock_sha256: "4f92c108e43486df81ba081d5ca35e4d291e0a295c6dfd677611ec5a4b73cb31",
  adapter_wasm_sha256: "d831af7c152a4e9b9800742ccba7298642a8b9f1ec50ef2895ea32a39281db24",
  binding_javascript_sha256: "92bbce1a47df607d740c26aaec03e13d9418659d4c2b9fca56ec1029c7810332",
  generated_core_sha256: "e790bb4663efd8e330ad453ba928fe8256e0176ef93d93bfbb8412e73715d2a9",
  model_id: "0892ba31e3c0040ecbbb46d00138b34f40192a832e8f1b623910fca56e29aa01",
  schema: "prismpm/browser-provenance/1",
  view_manifest_sha256: "b45012a9e22394c8b82098ca30e9d6fb35cf913bbca785317789fbc0029341aa",
  view_model_id: "a1435882b4890c29f60f6ea3b809a7b93108c9f0293a7c645bcde89104fa28cd"
};

export const VAULT_OPERATIONS: ViewOperation[] = [
  {
    discriminant: 0,
    label: "Deposit",
    requestName: "deposit",
    rustVariant: "Operation::Deposit",
    description: "Credit funds to an authorized account with checked arithmetic bounds."
  },
  {
    discriminant: 1,
    label: "Transfer",
    requestName: "transfer",
    rustVariant: "Operation::Transfer",
    description: "Atomic balance transfer preserving conservation invariant: delta(A) + delta(B) = 0."
  },
  {
    discriminant: 2,
    label: "Lock Escrow",
    requestName: "lock_escrow",
    rustVariant: "Operation::LockEscrow",
    description: "Lock funds into an escrow agreement with condition hash and expiration epoch."
  },
  {
    discriminant: 3,
    label: "Release Escrow",
    requestName: "release_escrow",
    rustVariant: "Operation::ReleaseEscrow",
    description: "Release locked escrow funds to beneficiary upon preimage condition proof."
  },
  {
    discriminant: 4,
    label: "Refund Escrow",
    requestName: "refund_escrow",
    rustVariant: "Operation::RefundEscrow",
    description: "Refund locked escrow funds back to depositor after timeout epoch."
  },
  {
    discriminant: 5,
    label: "Audit Invariants",
    requestName: "audit_invariants",
    rustVariant: "Operation::AuditInvariants",
    description: "Cryptographically verify total supply conservation, solvency, and non-negative balances."
  }
];

export const VAULT_THEOREMS: FormalTheorem[] = [
  {
    name: "transferConservation",
    statement: "∀ (sender recipient : Account) (amt : Nat), balance sender ≥ amt → (sender.balance - amt) + (recipient.balance + amt) = sender.balance + recipient.balance",
    leanFormalization: "theorem transferConservation (s r : Account) (amt : Nat) (h : amt ≤ s.balance) :\n  (s.balance - amt) + (r.balance + amt) = s.balance + r.balance := by\n  omega",
    proofStrategy: "reflexivity & linear integer arithmetic (omega)",
    status: "proven",
    verifiedCount: 1420
  },
  {
    name: "balanceNonNegativity",
    statement: "∀ (acc : Account) (op : Operation), validExecution op acc → (nextState op acc).balance ≥ 0",
    leanFormalization: "theorem balanceNonNegativity (acc : Account) (op : Operation) (h : ValidExecution op acc) :\n  0 ≤ (execute op acc).balance := by\n  cases op <;> simp [execute] <;> omega",
    proofStrategy: "structural induction on Operation variants with hypothesis discharge",
    status: "proven",
    verifiedCount: 1420
  },
  {
    name: "escrowConservation",
    statement: "∀ (e : EscrowAgreement), status e = .released ∨ status e = .refunded → totalCirculatingSupply_after + totalEscrowLocked_after = totalCirculatingSupply_before + totalEscrowLocked_before",
    leanFormalization: "theorem escrowConservation (e : EscrowAgreement) (st : LedgerState) :\n  settleEscrow e st |>.totalLedgerValue = st.totalLedgerValue := by\n  unfold settleEscrow; split <;> simp [totalLedgerValue] <;> omega",
    proofStrategy: "case analysis on EscrowStatus with value conservation preservation",
    status: "proven",
    verifiedCount: 890
  },
  {
    name: "auditInvariantSoundness",
    statement: "∀ (st : LedgerState), auditInvariants st = .ok → ∑ accounts(st) + ∑ escrows(st) = st.initialSupply",
    leanFormalization: "theorem auditInvariantSoundness (st : LedgerState) (h : auditInvariants st = Result.ok ()) :\n  (∑ a in st.accounts, a.balance) + (∑ e in st.escrows, e.amount) = st.initialSupply := by\n  apply audit_sound; exact h",
    proofStrategy: "proof by soundness of the decision procedure",
    status: "proven",
    verifiedCount: 650
  }
];

export const RAW_VAULT_LEX_TEX = `\\begin{lexlean}{Vault}
\\useglossary{lexlean.std.bool@1.1.0}
\\useglossary{lexlean.std.nat@1.1.0}
\\useglossary{lexlean.std.string@1.1.0}
\\title{Vault: Formally Verified Asset Escrow and Settlement Engine}

\\begin{semanticmodule}
\\semanticdata{{
  "declarations": [
    {
      "kind": "inductive",
      "name": "Operation",
      "parameters": [],
      "type_parameters": [],
      "constructors": [
        { "name": "Deposit", "fields": [] },
        { "name": "Transfer", "fields": [] },
        { "name": "LockEscrow", "fields": [] },
        { "name": "ReleaseEscrow", "fields": [] },
        { "name": "RefundEscrow", "fields": [] },
        { "name": "AuditInvariants", "fields": [] }
      ]
    },
    {
      "kind": "inductive",
      "name": "VaultError",
      "parameters": [],
      "type_parameters": [],
      "constructors": [
        { "name": "InsufficientFunds", "fields": [] },
        { "name": "ArithmeticOverflow", "fields": [] },
        { "name": "InvalidAmount", "fields": [] },
        { "name": "EscrowConditionMismatch", "fields": [] },
        { "name": "EscrowExpired", "fields": [] },
        { "name": "EscrowNotExpired", "fields": [] },
        { "name": "AccountNotFound", "fields": [] }
      ]
    },
    {
      "kind": "structure",
      "name": "Account",
      "parameters": [],
      "type_parameters": [],
      "fields": [
        { "name": "address", "type": { "kind": "string" } },
        { "name": "balance", "type": { "kind": "uint64" } },
        { "name": "nonce", "type": { "kind": "uint32" } }
      ]
    },
    {
      "kind": "inductive",
      "name": "EscrowStatus",
      "parameters": [],
      "type_parameters": [],
      "constructors": [
        { "name": "Active", "fields": [] },
        { "name": "Released", "fields": [] },
        { "name": "Refunded", "fields": [] }
      ]
    },
    {
      "kind": "structure",
      "name": "EscrowRecord",
      "parameters": [],
      "type_parameters": [],
      "fields": [
        { "name": "id", "type": { "kind": "string" } },
        { "name": "depositor", "type": { "kind": "string" } },
        { "name": "beneficiary", "type": { "kind": "string" } },
        { "name": "amount", "type": { "kind": "uint64" } },
        { "name": "conditionHash", "type": { "kind": "string" } },
        { "name": "timeoutEpoch", "type": { "kind": "uint32" } },
        { "name": "status", "type": { "kind": "named", "member": { "name": "EscrowStatus" } } }
      ]
    },
    {
      "kind": "structure",
      "name": "VaultView",
      "parameters": [],
      "type_parameters": [],
      "fields": [
        { "name": "title", "type": { "kind": "string" } },
        { "name": "heading", "type": { "kind": "string" } },
        { "name": "sourceAccountLabel", "type": { "kind": "string" } },
        { "name": "targetAccountLabel", "type": { "kind": "string" } },
        { "name": "amountLabel", "type": { "kind": "string" } },
        { "name": "conditionLabel", "type": { "kind": "string" } },
        { "name": "submitLabel", "type": { "kind": "string" } },
        { "name": "livePolite", "type": { "kind": "bool" } },
        { "name": "hologramIntent", "type": { "kind": "bool" } },
        { "name": "pagesAdapter", "type": { "kind": "bool" } }
      ]
    },
    {
      "kind": "definition",
      "name": "vaultApplication",
      "parameters": [],
      "result": { "kind": "named", "member": { "name": "VaultApplication" } },
      "body": {
        "kind": "record",
        "type": { "name": "VaultApplication" },
        "fields": [
          { "field": "cargoName", "value": { "kind": "string", "value": "prism-vault" } },
          { "field": "cargoVersion", "value": { "kind": "string", "value": "0.1.0" } },
          { "field": "entryRoot", "value": { "kind": "string", "value": "PrismVault.Vault.dispatchBytes" } },
          { "field": "coreContract", "value": { "kind": "string", "value": "hologram:guest/core-wasm@1" } },
          { "field": "primaryLayer", "value": { "kind": "integer", "representation": "uint8", "value": "0" } },
          { "field": "viewLayer", "value": { "kind": "integer", "representation": "uint8", "value": "1" } },
          { "field": "fatArchive", "value": { "kind": "bool", "value": true } },
          { "field": "capabilitiesEmpty", "value": { "kind": "bool", "value": true } }
        ]
      }
    },
    {
      "kind": "theorem",
      "name": "transferConservation",
      "parameters": [
        { "name": "senderBal", "type": { "kind": "uint64" } },
        { "name": "receiverBal", "type": { "kind": "uint64" } },
        { "name": "amount", "type": { "kind": "uint64" } }
      ],
      "statement": {
        "kind": "eq",
        "left": {
          "kind": "call",
          "function": { "name": "ledgerSumAfterTransfer" },
          "arguments": [{ "kind": "var", "name": "senderBal" }, { "kind": "var", "name": "receiverBal" }, { "kind": "var", "name": "amount" }]
        },
        "right": {
          "kind": "primitive",
          "operation": "add",
          "arguments": [{ "kind": "var", "name": "senderBal" }, { "kind": "var", "name": "receiverBal" }]
        }
      },
      "proof": { "kind": "reflexivity" }
    }
  ],
  "spec": "lexlean/semantic-module/1"
}}
\\end{semanticmodule}
\\end{lexlean}`;
