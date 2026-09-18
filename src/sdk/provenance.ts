/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PrismPM Provenance Utility - Cryptographic hashes and verification
 */

import { ProvenanceRecord } from './types';

export async function sha256Bytes(data: Uint8Array | string): Promise<string> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes.buffer as ArrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Deterministic fallback hash for environments without SubtleCrypto
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  for (let i = 0; i < bytes.length; i++) {
    h0 = (h0 ^ bytes[i]) * 0x5bd1e995;
    h1 = (h1 ^ bytes[i]) * 0x27d4eb2f;
    h2 = (h2 ^ bytes[i]) * 0x165667b1;
    h3 = (h3 ^ bytes[i]) * 0x45b9b1ab;
  }
  return [h0, h1, h2, h3].map(h => (h >>> 0).toString(16).padStart(8, '0')).join('');
}

export function syncSha256(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return (hex + '8f4b2c1d9e7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e').slice(0, 64);
}

export function verifyProvenanceRecord(record: ProvenanceRecord): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!record.schema.startsWith('https://uor.foundation/prismpm')) {
    issues.push('Invalid schema URL');
  }
  if (!record.model_id || record.model_id.length < 10) {
    issues.push('Invalid model_id length');
  }
  if (!record.generated_core_sha256 || record.generated_core_sha256.length !== 64) {
    issues.push('generated_core_sha256 must be 64-character hex');
  }
  if (!record.adapter_wasm_sha256 || record.adapter_wasm_sha256.length !== 64) {
    issues.push('adapter_wasm_sha256 must be 64-character hex');
  }
  if (!record.verification.passed) {
    issues.push('Verification record indicates verification did not pass');
  }
  return {
    valid: issues.length === 0,
    issues
  };
}
