/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PrismPM Application Client Runtime - Instantiates and executes PrismPM applications
 * using the official PrismPM SDK pattern seen in calculator-example.
 */

import { VaultState, OperationType, OperationResult, VaultErrorCode, ExecutionLog } from '../types';
import { VaultEngine, createInitialState } from '../model/engine';
import { BrowserClosure, ProvenanceRecord, ViewManifest } from './types';
import { createSixFileBrowserClosure, generateViewManifest } from './closure';
import { syncSha256 } from './provenance';

export interface ApplicationEventMap {
  'stateChanged': (state: VaultState) => void;
  'dispatched': (log: ExecutionLog) => void;
  'verified': (passed: boolean) => void;
}

export class PrismApplication {
  private engine: VaultEngine;
  private manifest: ViewManifest;
  private closure: BrowserClosure;
  private listeners: { [K in keyof ApplicationEventMap]?: Array<ApplicationEventMap[K]> } = {};

  constructor(initialState?: VaultState) {
    this.engine = new VaultEngine(initialState);
    this.manifest = generateViewManifest();
    this.closure = createSixFileBrowserClosure();
  }

  /**
   * Get current state machine data
   */
  public getState(): VaultState {
    return this.engine.getState();
  }

  /**
   * Get the PrismPM View Manifest
   */
  public getViewManifest(): ViewManifest {
    return this.manifest;
  }

  /**
   * Get the generated 6-file browser closure
   */
  public getBrowserClosure(): BrowserClosure {
    return this.closure;
  }

  /**
   * Subscribe to runtime events
   */
  public on<K extends keyof ApplicationEventMap>(event: K, handler: ApplicationEventMap[K]): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(handler);
    return () => {
      this.listeners[event] = (this.listeners[event] as any[])?.filter(h => h !== handler);
    };
  }

  private emit<K extends keyof ApplicationEventMap>(event: K, ...args: Parameters<ApplicationEventMap[K]>) {
    const list = this.listeners[event];
    if (list) {
      list.forEach(fn => (fn as any)(...args));
    }
  }

  /**
   * High-level typed operation execution
   */
  public execute(op: OperationType, params: Record<string, any>): OperationResult {
    const { result, log } = this.engine.execute(op, params);
    const state = this.engine.getState();

    this.emit('stateChanged', state);
    if (log) {
      this.emit('dispatched', log);
    }
    this.emit('verified', state.auditPassed);

    return result;
  }

  /**
   * Low-level byte dispatch matching Core-Wasm `dispatchBytes`
   */
  public dispatchBytes(rawBytes: Uint8Array): Uint8Array {
    if (rawBytes.length === 0) {
      return new Uint8Array([0x00]);
    }
    const discriminant = rawBytes[0];
    const opNames: OperationType[] = [
      'Deposit',
      'Transfer',
      'LockEscrow',
      'ReleaseEscrow',
      'RefundEscrow',
      'AuditInvariants'
    ];

    const op = opNames[discriminant] || 'AuditInvariants';
    const result = this.execute(op, { rawCall: true });

    const statusByte = result.kind === 'ok' ? 0x01 : 0x00;
    const responsePayload = new TextEncoder().encode(result.value || result.message || 'ok');
    const out = new Uint8Array(responsePayload.length + 1);
    out[0] = statusByte;
    out.set(responsePayload, 1);
    return out;
  }

  /**
   * Advance epoch and audit timeouts
   */
  public advanceEpoch(): void {
    this.engine.advanceEpoch();
    this.emit('stateChanged', this.engine.getState());
  }

  /**
   * Reset ledger to genesis
   */
  public reset(): void {
    this.engine.reset();
    this.emit('stateChanged', this.engine.getState());
  }
}
