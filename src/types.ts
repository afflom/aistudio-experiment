/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OperationType = 
  | 'Deposit'
  | 'Transfer'
  | 'LockEscrow'
  | 'ReleaseEscrow'
  | 'RefundEscrow'
  | 'AuditInvariants';

export interface ViewOperation {
  discriminant: number;
  label: string;
  requestName: string;
  rustVariant: string;
  description: string;
}

export type VaultErrorCode = 
  | 'none'
  | 'insufficient-funds'
  | 'arithmetic-overflow'
  | 'invalid-amount'
  | 'escrow-condition-mismatch'
  | 'escrow-expired'
  | 'escrow-not-expired'
  | 'account-not-found'
  | 'escrow-not-found';

export interface OperationResult {
  kind: 'ok' | 'error';
  value?: string;
  error?: VaultErrorCode;
  message?: string;
  txHash?: string;
  gasUnits?: number;
  invariantsPreserved?: boolean;
}

export interface EscrowRecord {
  id: string;
  depositor: string;
  beneficiary: string;
  amount: bigint;
  conditionHash: string; // e.g. SHA-256 hex
  timeoutEpoch: number;
  status: 'active' | 'released' | 'refunded';
  createdAtEpoch: number;
}

export interface AccountRecord {
  address: string;
  balance: bigint;
  nonce: number;
  label?: string;
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  epoch: number;
  operation: OperationType;
  discriminant: number;
  parameters: Record<string, string | number>;
  result: OperationResult;
  stateDelta: {
    accountsChanged: { address: string; prev: string; next: string }[];
    escrowsChanged?: { id: string; prev: string; next: string }[];
  };
  proofAttestation?: {
    theorem: string;
    verified: boolean;
  };
}

export interface VaultState {
  currentEpoch: number;
  accounts: Record<string, AccountRecord>;
  escrows: EscrowRecord[];
  initialSupply: bigint;
  totalCirculatingSupply: bigint;
  totalEscrowLocked: bigint;
  logs: ExecutionLog[];
  isAudited: boolean;
  auditPassed: boolean;
}

export interface PrismpmTomlConfig {
  spec: string;
  project: string;
  lexlean_project: string;
  build_root: string;
  limits: {
    max_holo_bytes: number;
    max_entities: number;
    max_diagnostics: number;
  };
}

export interface LexleanTomlConfig {
  spec: string;
  name: string;
  language: string;
  module_prefix: string;
  source_roots: string[];
  entrypoints: string[];
  build_root: string;
  lockfile: string;
  lean_workspace: string;
  lean_toolchain: string;
}

export interface ProvenanceMetadata {
  adapter_lock_sha256: string;
  adapter_wasm_sha256: string;
  binding_javascript_sha256: string;
  generated_core_sha256: string;
  model_id: string;
  schema: string;
  view_manifest_sha256: string;
  view_model_id: string;
}

export interface BuildStage {
  id: string;
  name: string;
  command: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  durationMs?: number;
  logs: string[];
  outputs?: { name: string; size: string; digest: string }[];
}

export interface FormalTheorem {
  name: string;
  statement: string;
  leanFormalization: string;
  proofStrategy: string;
  status: 'proven' | 'checking';
  verifiedCount: number;
}
